// Admin authentication: credentials come from environment variables, and a successful
// login returns a signed, expiring token (JWT). Every admin check in the server goes
// through isAdminRequest / requireAdmin below.
//
// Required environment variables (see server/.env.example):
//   ADMIN_JWT_SECRET      random string, at least 32 characters
//   ADMIN_PASSWORD_HASH   bcrypt hash of the admin password
//                         (create it with: node scripts/hash-admin-password.js)
// Optional:
//   ADMIN_USERNAME        defaults to "admin"
//   ADMIN_TOKEN_TTL       token lifetime, defaults to "12h" (e.g. "8h", "1d")

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const AUDIENCE = "aira-admin";
const MAX_PASSWORD_LENGTH = 200;

function adminSecret() {
  const secret = process.env.ADMIN_JWT_SECRET;
  return secret && secret.length >= 32 ? secret : null;
}

function adminUsername() {
  return (process.env.ADMIN_USERNAME || "admin").trim();
}

/** True when the server has everything it needs to log admins in. */
export function isAdminAuthConfigured() {
  return Boolean(adminSecret() && process.env.ADMIN_PASSWORD_HASH);
}

export function issueAdminToken() {
  const secret = adminSecret();
  if (!secret) throw new Error("ADMIN_JWT_SECRET is not configured");
  return jwt.sign({ role: "admin" }, secret, {
    subject: adminUsername(),
    audience: AUDIENCE,
    expiresIn: process.env.ADMIN_TOKEN_TTL || "12h",
    algorithm: "HS256",
  });
}

/** Checks a username and password against ADMIN_USERNAME / ADMIN_PASSWORD_HASH. */
export async function verifyAdminCredentials(username, password) {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash || !adminSecret()) return false;
  if (typeof password !== "string" || password.length === 0 || password.length > MAX_PASSWORD_LENGTH) {
    return false;
  }
  // Always run the bcrypt comparison so a wrong username takes as long as a wrong password.
  const passwordOk = await bcrypt.compare(password, hash);
  const usernameOk = typeof username === "string" && username.trim() === adminUsername();
  return passwordOk && usernameOk;
}

function extractToken(raw) {
  if (!raw) return null;
  let value = String(raw).trim();
  if (value.toLowerCase().startsWith("bearer ")) value = value.slice(7).trim();
  return value || null;
}

/**
 * Returns the verified admin token payload, or null. Accepts the token in the
 * "x-admin-auth" header (what the admin panel sends) or as "Authorization: Bearer".
 * Regular user tokens never pass: admin tokens use their own secret and audience.
 */
export function getAdminSession(req) {
  const secret = adminSecret();
  if (!secret) return null;
  for (const raw of [req.headers["x-admin-auth"], req.headers["authorization"]]) {
    const token = extractToken(raw);
    if (!token) continue;
    try {
      const payload = jwt.verify(token, secret, { audience: AUDIENCE, algorithms: ["HS256"] });
      if (payload && payload.role === "admin") return payload;
    } catch {
      // not a valid admin token; try the next header
    }
  }
  return null;
}

export function isAdminRequest(req) {
  return getAdminSession(req) !== null;
}

export function requireAdmin(req, res, next) {
  const session = getAdminSession(req);
  if (!session) {
    return res.status(401).json({ message: "Unauthorized admin access.", error: "Unauthorized admin access." });
  }
  req.admin = { username: session.sub, expiresAt: session.exp ? session.exp * 1000 : null };
  next();
}

// ---- Secret settings -----------------------------------------------------------------
// The settings table also stores credentials (payment, Facebook, Firebase). The public
// settings endpoints must never return these unless the request carries a valid admin token.

const SECRET_SETTING_KEYS = new Set([
  "razorpay_key_secret",
  "facebook_app_secret",
  "facebook_page_access_token",
  "facebook_webhook_verify_token",
  "firebase_service_account_json",
]);
const SECRET_SETTING_PATTERN = /(secret|password|passwd|private|service_account|access_token|verify_token|api_key|apikey)/i;

export function isSecretSettingKey(key) {
  return SECRET_SETTING_KEYS.has(key) || SECRET_SETTING_PATTERN.test(String(key || ""));
}

/** Removes secret keys from a settings map unless the request is from an admin. */
export function settingsForRequest(req, settingsMap) {
  if (isAdminRequest(req)) return settingsMap;
  const visible = {};
  for (const [key, value] of Object.entries(settingsMap)) {
    if (!isSecretSettingKey(key)) visible[key] = value;
  }
  return visible;
}

// ---- Login rate limiting (in memory, per client IP) ---------------------------------

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_LOGINS = 5;
const failedLogins = new Map(); // ip -> { count, firstAt }

function clientKey(req) {
  return req.ip || (req.socket && req.socket.remoteAddress) || "unknown";
}

/** Returns seconds to wait if this client is locked out, otherwise 0. */
export function loginRetryAfter(req) {
  const entry = failedLogins.get(clientKey(req));
  if (!entry) return 0;
  const elapsed = Date.now() - entry.firstAt;
  if (elapsed > LOGIN_WINDOW_MS) {
    failedLogins.delete(clientKey(req));
    return 0;
  }
  return entry.count >= MAX_FAILED_LOGINS ? Math.ceil((LOGIN_WINDOW_MS - elapsed) / 1000) : 0;
}

export function recordFailedLogin(req) {
  const key = clientKey(req);
  const entry = failedLogins.get(key);
  if (!entry || Date.now() - entry.firstAt > LOGIN_WINDOW_MS) {
    failedLogins.set(key, { count: 1, firstAt: Date.now() });
  } else {
    entry.count += 1;
  }
  // keep memory bounded
  if (failedLogins.size > 10000) {
    const oldestKey = failedLogins.keys().next().value;
    failedLogins.delete(oldestKey);
  }
}

export function clearFailedLogins(req) {
  failedLogins.delete(clientKey(req));
}
