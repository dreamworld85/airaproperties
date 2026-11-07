import { Router } from "express";
import bcrypt from "bcryptjs";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { checkUserAccess } from "../utils/access.js";
import { getStarterPackConfig, getStarterPackForRole, activateStarterPlanForUser } from "../utils/starterPack.js";
import { deleteUploadedFile } from "../utils/fileHelper.js";
import { deleteUserCompletely } from "../utils/userCleanup.js";
import { getUploadDir } from "../middleware/upload.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = getUploadDir();
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`);
  }
});
const upload = multer({ storage });

const router = Router();

function toPublicUser(row) {
  const roleName = (!row.role || row.role.toLowerCase() === "user") ? "Buyer" : row.role;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    whatsappNumber: row.whatsapp_number,
    location: row.location,
    state: row.state || "Kerala",
    avatarUrl: row.avatar_url,
    trialEndsAt: row.custom_trial_expiry || row.trial_ends_at,
    subscriptionStatus: row.is_free_subscription_granted === 1 ? "active" : row.subscription_status,
    razorpaySubscriptionId: row.razorpay_subscription_id,
    role: roleName,
    createdAt: row.created_at,
    subscriptionDurationMonths: row.subscription_duration_months,
    agencyLogoUrl: row.agency_logo_url,
    agencyAddress: row.agency_address,
    agencyDistrict: row.agency_district,
    agencyBannerUrl: row.agency_banner_url || null,
    enquiryCreditsLeft: row.enquiry_credits_left !== null && row.enquiry_credits_left !== undefined ? Number(row.enquiry_credits_left) : 0,
    listingSlotsLeft: row.listing_slots_left !== null && row.listing_slots_left !== undefined ? Number(row.listing_slots_left) : 0,
  };
}

// GET /api/users/me
router.get("/me", requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [req.userId]);
    if (rows.length === 0) return res.status(404).json({ error: "User not found" });
    const userRow = rows[0];
    if (!userRow.role || userRow.role.toLowerCase() === "user") {
      await pool.query("UPDATE users SET role = 'Buyer' WHERE id = ?", [req.userId]);
      userRow.role = "Buyer";
    }
    if (userRow.enquiry_credits_left === null || userRow.listing_slots_left === null) {
      const starter = await getStarterPackConfig();
      await pool.query(
        "UPDATE users SET enquiry_credits_left = COALESCE(enquiry_credits_left, ?), listing_slots_left = COALESCE(listing_slots_left, ?) WHERE id = ?",
        [starter.enquiryTokens, starter.listingSlots, req.userId]
      );
      if (userRow.enquiry_credits_left === null) userRow.enquiry_credits_left = starter.enquiryTokens;
      if (userRow.listing_slots_left === null) userRow.listing_slots_left = starter.listingSlots;
    }
    const accessCheck = await checkUserAccess(req.userId);
    const [countRows] = await pool.query("SELECT COUNT(*) AS count FROM properties WHERE owner_id = ?", [req.userId]);
    res.json({
      ...toPublicUser(rows[0]),
      hasAccess: accessCheck.hasAccess,
      canPostProperty: accessCheck.canPostProperty,
      hasTrial: false,
      remainingDays: 0,
      isSubscribed: accessCheck.isSubscribed,
      inquiryCount: accessCheck.inquiryCount,
      propertiesCount: countRows[0].count,
      enquiryCreditsLeft: accessCheck.enquiryCreditsLeft,
      listingSlotsLeft: accessCheck.listingSlotsLeft,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// GET /api/users/me/transactions
router.get("/me/transactions", requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.*, p.title AS property_title 
       FROM credit_transactions t
       LEFT JOIN properties p ON p.id = t.property_id
       WHERE t.user_id = ? 
       ORDER BY t.id DESC LIMIT 50`,
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch transaction history" });
  }
});

// PATCH /api/users/me  { name, phone, email, location, avatarUrl, whatsappNumber, password }
router.patch("/me", requireAuth, async (req, res) => {
  try {
    const { name, phone, email, location, state, avatarUrl, whatsappNumber, password } = req.body;
    const cleanEmail = email !== undefined ? (email && String(email).trim() ? String(email).trim().toLowerCase() : null) : undefined;
    const cleanPhone = phone !== undefined ? (phone && String(phone).trim() ? String(phone).trim() : null) : undefined;
    const cleanName = name !== undefined ? (name && String(name).trim() ? String(name).trim() : null) : undefined;

    if (password && String(password).trim()) {
      if (String(password).trim().length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }
      const hash = await bcrypt.hash(String(password).trim(), 10);
      await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [hash, req.userId]);
    }

    await pool.query(
      `UPDATE users SET
        name = COALESCE(?, name),
        phone = COALESCE(?, phone),
        email = CASE WHEN ? = 1 THEN ? ELSE email END,
        location = COALESCE(?, location),
        state = COALESCE(?, state),
        avatar_url = COALESCE(?, avatar_url),
        whatsapp_number = COALESCE(?, whatsapp_number)
       WHERE id = ?`,
      [
        cleanName !== undefined ? cleanName : null,
        cleanPhone !== undefined ? cleanPhone : null,
        cleanEmail !== undefined ? 1 : 0,
        cleanEmail !== undefined ? cleanEmail : null,
        location !== undefined ? location : null,
        state !== undefined ? state : null,
        avatarUrl !== undefined ? avatarUrl : null,
        whatsappNumber !== undefined ? whatsappNumber : null,
        req.userId
      ]
    );
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [req.userId]);
    const accessCheck = await checkUserAccess(req.userId);
    const [countRows] = await pool.query("SELECT COUNT(*) AS count FROM properties WHERE owner_id = ?", [req.userId]);
    res.json({
      ...toPublicUser(rows[0]),
      hasAccess: accessCheck.hasAccess,
      hasTrial: accessCheck.hasTrial,
      remainingDays: accessCheck.remainingDays,
      isSubscribed: accessCheck.isSubscribed,
      inquiryCount: accessCheck.inquiryCount,
      propertiesCount: countRows[0].count,
    });
  } catch (err) {
    console.error(err);
    if (err && (err.code === "ER_DUP_ENTRY" || err.errno === 1062)) {
      const msg = err.message || "";
      if (msg.includes("phone")) {
        return res.status(400).json({ error: "This contact number is already registered to another account." });
      }
      if (msg.includes("email")) {
        return res.status(400).json({ error: "This email address is already registered to another account." });
      }
      return res.status(400).json({ error: "This detail is already registered to another account." });
    }
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// POST /api/users/me/avatar — Upload and update user avatar image
router.post("/me/avatar", requireAuth, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const avatarUrl = `/uploads/${req.file.filename}`;
    await pool.query("UPDATE users SET avatar_url = ? WHERE id = ?", [avatarUrl, req.userId]);
    
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [req.userId]);
    const accessCheck = await checkUserAccess(req.userId);
    const [countRows] = await pool.query("SELECT COUNT(*) AS count FROM properties WHERE owner_id = ?", [req.userId]);
    res.json({
      ...toPublicUser(rows[0]),
      hasAccess: accessCheck.hasAccess,
      hasTrial: accessCheck.hasTrial,
      remainingDays: accessCheck.remainingDays,
      isSubscribed: accessCheck.isSubscribed,
      inquiryCount: accessCheck.inquiryCount,
      propertiesCount: countRows[0].count,
    });
  } catch (err) {
    console.error("Avatar upload failed:", err);
    res.status(500).json({ error: "Failed to upload avatar" });
  }
});

// POST /api/users/me/banner — Upload and update agency banner image
router.post("/me/banner", requireAuth, upload.single("banner"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const bannerUrl = `/uploads/${req.file.filename}`;
    await pool.query("UPDATE users SET agency_banner_url = ? WHERE id = ?", [bannerUrl, req.userId]);

    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [req.userId]);
    const accessCheck = await checkUserAccess(req.userId);
    const [countRows] = await pool.query("SELECT COUNT(*) AS count FROM properties WHERE owner_id = ?", [req.userId]);
    res.json({
      ...toPublicUser(rows[0]),
      hasAccess: accessCheck.hasAccess,
      hasTrial: accessCheck.hasTrial,
      remainingDays: accessCheck.remainingDays,
      isSubscribed: accessCheck.isSubscribed,
      inquiryCount: accessCheck.inquiryCount,
      propertiesCount: countRows[0].count,
    });
  } catch (err) {
    console.error("Banner upload failed:", err);
    res.status(500).json({ error: "Failed to upload banner" });
  }
});

// Helper to automatically sync Facebook and Instagram post comments for a specific user's properties
async function syncSocialCommentsForOwner(ownerId) {
  try {
    const [tokenRow] = await pool.query("SELECT `value` FROM settings WHERE `key` = 'facebook_page_access_token'");
    const [pageIdRow] = await pool.query("SELECT `value` FROM settings WHERE `key` = 'facebook_page_id'");
    const accessToken = tokenRow[0]?.value || process.env.FB_PAGE_ACCESS_TOKEN;
    const pageId = pageIdRow[0]?.value || process.env.FB_PAGE_ID || "1385544157967865";
    if (!accessToken) return;

    // 1. AUTO-MATCH: Scan recent Facebook page posts to link any post containing property URL to properties table
    try {
      const postsRes = await fetch(`https://graph.facebook.com/v21.0/${pageId}/posts?fields=id,message,created_time&limit=25&access_token=${accessToken}`);
      const postsData = await postsRes.json();
      if (Array.isArray(postsData?.data)) {
        for (const post of postsData.data) {
          if (!post.message) continue;
          const match = post.message.match(/airaproperties\.in\/property\/(\d+)/i);
          if (match && match[1]) {
            const matchedPropertyId = parseInt(match[1], 10);
            await pool.query(
              "UPDATE properties SET fb_post_id = ? WHERE id = ? AND (fb_post_id IS NULL OR fb_post_id = '')",
              [post.id, matchedPropertyId]
            ).catch(() => {});
          }
        }
      }
    } catch (scanErr) {
      console.warn("Auto-matching FB posts error:", scanErr.message);
    }

    // 2. Fetch properties owned by THIS specific user that have an active social post ID
    const [properties] = await pool.query(
      `SELECT id, fb_post_id, ig_post_id FROM properties WHERE owner_id = ? AND (fb_post_id IS NOT NULL OR ig_post_id IS NOT NULL)`,
      [ownerId]
    );

    for (const prop of properties) {
      // Sync Facebook comments for this property
      if (prop.fb_post_id) {
        try {
          const res = await fetch(`https://graph.facebook.com/v21.0/${prop.fb_post_id}/comments?fields=id,message,created_time,from&access_token=${accessToken}&limit=50`);
          const data = await res.json();
          if (Array.isArray(data?.data)) {
            for (const c of data.data) {
              if (!c.id) continue;
              const [[existing]] = await pool.query("SELECT id FROM enquiries WHERE external_id = ?", [c.id]);
              if (!existing) {
                const commentTime = c.created_time ? new Date(c.created_time) : new Date();
                const commenterName = c.from?.name || "Facebook Buyer";
                await pool.query(
                  `INSERT INTO enquiries (property_id, visitor_id, name, phone, email, message, source, external_id, post_id, created_at)
                   VALUES (?, NULL, ?, NULL, NULL, ?, 'facebook', ?, ?, ?)`,
                  [prop.id, commenterName, c.message || "Enquired on Facebook", c.id, prop.fb_post_id, commentTime]
                );
              }
            }
          }
        } catch (fbErr) {
          console.warn(`Could not sync FB comments for property ${prop.id}:`, fbErr.message);
        }
      }

      // Sync Instagram comments for this property
      if (prop.ig_post_id) {
        try {
          const res = await fetch(`https://graph.facebook.com/v21.0/${prop.ig_post_id}/comments?fields=id,message,created_time,from&access_token=${accessToken}&limit=50`);
          const data = await res.json();
          if (Array.isArray(data?.data)) {
            for (const c of data.data) {
              if (!c.id) continue;
              const [[existing]] = await pool.query("SELECT id FROM enquiries WHERE external_id = ?", [c.id]);
              if (!existing) {
                const commentTime = c.created_time ? new Date(c.created_time) : new Date();
                const commenterName = c.from?.username || c.from?.name || "Instagram Buyer";
                await pool.query(
                  `INSERT INTO enquiries (property_id, visitor_id, name, phone, email, message, source, external_id, post_id, created_at)
                   VALUES (?, NULL, ?, NULL, NULL, ?, 'instagram', ?, ?, ?)`,
                  [prop.id, commenterName, c.message || "Enquired on Instagram", c.id, prop.ig_post_id, commentTime]
                );
              }
            }
          }
        } catch (igErr) {
          console.warn(`Could not sync IG comments for property ${prop.id}:`, igErr.message);
        }
      }
    }
  } catch (err) {
    console.warn("syncSocialCommentsForOwner error:", err.message);
  }
}

// POST /api/users/me/sync-social-enquiries — manually trigger social enquiries sync for current user
router.post("/me/sync-social-enquiries", requireAuth, async (req, res) => {
  try {
    await syncSocialCommentsForOwner(req.userId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/me/stats — dashboard totals + recent visitors, across all of the
// user's properties. Backs the Visitors & Enquiries screen.
router.get("/me/stats", requireAuth, async (req, res) => {
  try {
    // Sync Facebook and Instagram comments for this user's properties before loading stats
    await syncSocialCommentsForOwner(req.userId);

    const [[viewsRow]] = await pool.query(
      `SELECT COUNT(*) AS totalViews FROM property_views pv
       JOIN properties p ON p.id = pv.property_id WHERE p.owner_id = ?`,
      [req.userId]
    );

    const accessCheck = await checkUserAccess(req.userId);
    const roleLower = String(accessCheck.role || "").toLowerCase();
    const isTrialExpired = (roleLower === "broker" || roleLower === "agency") && !accessCheck.hasAccess;

    const [recentVisitors] = await pool.query(
      `SELECT 
         e.id AS enquiryId,
         COALESCE(NULLIF(e.name, ''), u.name, 'Visitor') AS visitorName,
         u.location AS visitorLocation,
         COALESCE(NULLIF(e.phone, ''), u.phone, '') AS visitorPhone,
         COALESCE(NULLIF(e.email, ''), u.email, '') AS visitorEmail,
         e.message AS message,
         COALESCE(e.source, 'web') AS source,
         e.external_id AS externalId,
         e.post_id AS postId,
         p.id AS propertyId,
         p.title AS propertyTitle,
         p.price AS propertyPrice,
         (SELECT url FROM property_media WHERE property_id = p.id AND media_type = 'image' LIMIT 1) AS propertyImage,
         e.created_at AS enquiredAt
       FROM enquiries e
       JOIN properties p ON p.id = e.property_id
       LEFT JOIN users u ON u.id = e.visitor_id
       WHERE p.owner_id = ?
       ORDER BY e.created_at DESC LIMIT 100`,
      [req.userId]
    );

    const webCount = recentVisitors.filter(v => (v.source || 'web') === 'web').length;
    const facebookCount = recentVisitors.filter(v => v.source === 'facebook').length;
    const instagramCount = recentVisitors.filter(v => v.source === 'instagram').length;

    const processedVisitors = recentVisitors.map(v => {
      if (isTrialExpired) {
        return {
          enquiryId: v.enquiryId,
          visitorName: "Locked Visitor Profile",
          visitorLocation: "Subscribe to unlock details",
          visitorPhone: "+91 XXXXX XXXXX",
          visitorEmail: "locked@keralarealty.com",
          message: v.message ? "Enquiry message hidden. Top up tokens to view." : null,
          source: v.source || "web",
          externalId: v.externalId,
          postId: v.postId,
          propertyId: v.propertyId,
          propertyTitle: v.propertyTitle,
          propertyPrice: v.propertyPrice,
          propertyImage: v.propertyImage,
          enquiredAt: v.enquiredAt,
          isLocked: true
        };
      }
      return {
        ...v,
        isLocked: false
      };
    });

    res.json({
      totalViews: viewsRow.totalViews,
      totalEnquiries: recentVisitors.length,
      webCount,
      facebookCount,
      instagramCount,
      recentVisitors: processedVisitors,
      isTrialExpired,
      hasTrial: accessCheck.hasTrial,
      remainingDays: accessCheck.remainingDays,
      role: accessCheck.role,
      isSubscribed: accessCheck.isSubscribed,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// GET /api/users/me/sent-enquiries — enquiries sent by this user to other property owners
router.get("/me/sent-enquiries", requireAuth, async (req, res) => {
  try {
    const [sentEnquiries] = await pool.query(
      `SELECT 
         e.id AS enquiryId,
         e.message AS message,
         e.created_at AS enquiredAt,
         p.id AS propertyId,
         p.title AS propertyTitle,
         p.price AS propertyPrice,
         p.district AS propertyDistrict,
         p.state AS propertyState,
         (SELECT url FROM property_media WHERE property_id = p.id AND media_type = 'image' LIMIT 1) AS propertyImage,
         COALESCE(p.contact_number, owner.phone) AS sellerPhone,
         COALESCE(p.whatsapp_number, owner.phone) AS sellerWhatsapp,
         COALESCE(p.owner_name, owner.name, 'Seller') AS sellerName
       FROM enquiries e
       JOIN properties p ON p.id = e.property_id
       JOIN users owner ON owner.id = p.owner_id
       WHERE e.visitor_id = ?
       ORDER BY e.created_at DESC LIMIT 50`,
      [req.userId]
    );

    res.json(sentEnquiries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch sent enquiries" });
  }
});

// Helper to clean slug
function toSlug(str) {
  return (str || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

// GET /api/users/agency-by-slug/:slug — get agency public profile by agency name slug
router.get("/agency-by-slug/:slug", async (req, res) => {
  try {
    const targetSlug = toSlug(req.params.slug);
    if (!targetSlug) return res.status(404).json({ error: "Agency not found" });

    // Fetch agencies and find matching slug
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE LOWER(role) = 'agency' OR name IS NOT NULL"
    );

    let match = rows.find((r) => toSlug(r.name) === targetSlug);
    // If not direct match, check if targetSlug is a numeric ID
    if (!match && /^\d+$/.test(req.params.slug)) {
      match = rows.find((r) => r.id === parseInt(req.params.slug, 10));
    }

    if (!match) return res.status(404).json({ error: "Agency not found" });

    const [[listingsRow]] = await pool.query(
      "SELECT COUNT(*) AS totalListings FROM properties WHERE owner_id = ? AND status IN ('Active', 'Sold')",
      [match.id]
    );
    const [[clientsRow]] = await pool.query(
      `SELECT COUNT(DISTINCT e.visitor_id) AS distinctEnquirers
       FROM enquiries e JOIN properties p ON p.id = e.property_id
       WHERE p.owner_id = ?`,
      [match.id]
    );

    const joined = new Date(match.created_at);
    const yearsActive = Math.max(0, (Date.now() - joined.getTime()) / (365 * 24 * 60 * 60 * 1000));

    res.json({
      ...toPublicUser(match),
      totalListings: listingsRow.totalListings,
      distinctEnquirers: clientsRow.distinctEnquirers,
      yearsActive: Math.round(yearsActive * 10) / 10,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch agency by slug" });
  }
});

// GET /api/users/:id/profile — public profile for Agency/Broker/Owner cards.
// "Years on Kerala Realty" is derived from account age rather than self-reported,
// since that's the only trustworthy signal we actually have.
router.get("/:id/profile", async (req, res) => {
  try {
    let userRow = null;
    const isNumeric = /^\d+$/.test(req.params.id);

    if (isNumeric) {
      const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [req.params.id]);
      if (rows.length > 0) userRow = rows[0];
    }

    if (!userRow) {
      const targetSlug = toSlug(req.params.id);
      const [allUsers] = await pool.query("SELECT * FROM users WHERE name IS NOT NULL");
      userRow = allUsers.find((r) => toSlug(r.name) === targetSlug);
    }

    if (!userRow) return res.status(404).json({ error: "User not found" });

    const [[listingsRow]] = await pool.query(
      "SELECT COUNT(*) AS totalListings FROM properties WHERE owner_id = ? AND status IN ('Active', 'Sold')",
      [userRow.id]
    );
    const [[clientsRow]] = await pool.query(
      `SELECT COUNT(DISTINCT e.visitor_id) AS distinctEnquirers
       FROM enquiries e JOIN properties p ON p.id = e.property_id
       WHERE p.owner_id = ?`,
      [userRow.id]
    );

    const joined = new Date(userRow.created_at);
    const yearsActive = Math.max(0, (Date.now() - joined.getTime()) / (365 * 24 * 60 * 60 * 1000));

    res.json({
      ...toPublicUser(userRow),
      totalListings: listingsRow.totalListings,
      distinctEnquirers: clientsRow.distinctEnquirers,
      yearsActive: Math.round(yearsActive * 10) / 10,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch public profile" });
  }
});

// POST /api/users/me/role-switch
router.post("/me/role-switch", requireAuth, async (req, res) => {
  try {
    const { requestedRole } = req.body;
    const allowedRoles = ["Broker", "Agency"];
    if (!allowedRoles.includes(requestedRole)) {
      return res.status(400).json({ error: "Invalid requested role. You can only switch to Broker or Agency." });
    }

    const [userRows] = await pool.query("SELECT role FROM users WHERE id = ?", [req.userId]);
    if (userRows.length === 0) return res.status(404).json({ error: "User not found" });
    const userRole = userRows[0].role;

    if (userRole === "user" || userRole === "Buyer" || userRole === "buyer") {
      return res.status(400).json({ error: "You can select your role directly when posting your first property." });
    }

    if (userRole === requestedRole) {
      return res.status(400).json({ error: "You are already in this role." });
    }

    const [existing] = await pool.query(
      "SELECT id FROM role_switch_requests WHERE user_id = ? AND requested_role = ? AND status = 'Pending'",
      [req.userId, requestedRole]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: "Upgrade request already pending admin approval" });
    }

    await pool.query(
      "INSERT INTO role_switch_requests (user_id, requested_role, status) VALUES (?, ?, 'Pending')",
      [req.userId, requestedRole]
    );

    res.status(201).json({ message: "Upgrade request submitted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit upgrade request" });
  }
});

// GET /api/users/me/role-switch
router.get("/me/role-switch", requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT status, created_at FROM role_switch_requests WHERE user_id = ? ORDER BY id DESC LIMIT 1",
      [req.userId]
    );
    res.json(rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch switch request status" });
  }
});

// GET /api/users/me/notifications
router.get("/me/notifications", requireAuth, async (req, res) => {
  try {
    const accessCheck = await checkUserAccess(req.userId);
    const isLocked = !accessCheck.hasAccess;

    const [rows] = await pool.query(
      `SELECT n.*, u.name AS sender_name, u.role AS sender_role, u.avatar_url AS sender_avatar
       FROM notifications n
       LEFT JOIN users u ON u.id = n.sender_id
       WHERE n.user_id = ?
       ORDER BY n.created_at DESC LIMIT 50`,
      [req.userId]
    );

    const processed = rows.map((n) => {
      if (isLocked && n.type !== "RoleUpgrade" && n.type !== "System") {
        let msg = "Someone contacted you (Upgrade to view profile)";
        if (n.type === "like") {
          msg = "Someone liked your property (Upgrade to view profile)";
        } else if (n.type === "review") {
          msg = "Someone reviewed your property (Upgrade to view profile)";
        }
        return {
          ...n,
          sender_name: "Locked Profile",
          sender_avatar: null,
          message: msg,
          isLocked: true,
        };
      }
      return {
        ...n,
        isLocked: false,
      };
    });

    res.json(processed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// POST /api/users/me/notifications/read-all
router.post("/me/notifications/read-all", requireAuth, async (req, res) => {
  try {
    await pool.query(
      "UPDATE notifications SET is_read = 1 WHERE user_id = ?",
      [req.userId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to mark notifications as read" });
  }
});

// POST /api/users/setup-role (Set user role details and lock role)
router.post("/setup-role", requireAuth, upload.single("agencyLogo"), async (req, res) => {
  try {
    const { role, ownerName, brokerName, agencyName, contactPhone, whatsappNumber, agencyAddress, agencyDistrict } = req.body;
    const allowedRoles = ["owner", "broker", "agency"];
    const targetRole = (role || "").toLowerCase();

    if (!allowedRoles.includes(targetRole)) {
      return res.status(400).json({ error: "Invalid role selected" });
    }

    // Check if user is already locked
    const [[user]] = await pool.query("SELECT role FROM users WHERE id = ?", [req.userId]);
    if (user && user.role && user.role.toLowerCase() !== "user" && user.role.toLowerCase() !== "buyer") {
      return res.status(400).json({ error: "Your account role is already locked. Contact Admin to switch." });
    }

    // Query settings to get default trial days for this role
    const settingKey = targetRole === "agency" ? "default_trial_days_agency" : (targetRole === "broker" ? "default_trial_days_broker" : "default_trial_days");
    const [[daysRow]] = await pool.query("SELECT `value` FROM settings WHERE `key` = ?", [settingKey]);
    const defaultDays = daysRow ? parseInt(daysRow.value, 10) : (targetRole === "agency" ? 3 : 5);

    // Save details to users table
    const nameToSave = targetRole === "owner" ? ownerName : (targetRole === "broker" ? brokerName : agencyName);
    const agencyLogoUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const finalAvatar = targetRole === "agency" && agencyLogoUrl ? agencyLogoUrl : null;

    await pool.query(
      `UPDATE users 
       SET role = ?, 
           name = COALESCE(?, name),
           phone = COALESCE(?, phone),
           whatsapp_number = COALESCE(?, whatsapp_number),
           avatar_url = COALESCE(?, avatar_url),
           agency_logo_url = ?,
           agency_address = ?,
           agency_district = ?,
           trial_ends_at = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL ? DAY)
       WHERE id = ?`,
      [
        targetRole, 
        nameToSave, 
        contactPhone, 
        whatsappNumber || null,
        finalAvatar, 
        targetRole === "agency" && agencyLogoUrl ? agencyLogoUrl : null,
        targetRole === "agency" ? (agencyAddress || null) : null,
        targetRole === "agency" ? (agencyDistrict || null) : null,
        defaultDays, 
        req.userId
      ]
    );

    const [updatedUser] = await pool.query("SELECT * FROM users WHERE id = ?", [req.userId]);
    const accessCheck = await checkUserAccess(req.userId);
    res.json({ 
      success: true, 
      message: "Role setup completed and locked successfully.",
      user: {
        ...toPublicUser(updatedUser[0]),
        hasAccess: accessCheck.hasAccess,
        hasTrial: accessCheck.hasTrial,
        remainingDays: accessCheck.remainingDays,
        isSubscribed: accessCheck.isSubscribed,
        inquiryCount: accessCheck.inquiryCount,
      }
    });
  } catch (err) {
    console.error(err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "This contact number is already registered to another account. Please use a different number." });
    }
    res.status(500).json({ error: "Failed to setup role" });
  }
});

// DELETE /api/users/me — Self-deletion of account and all associated data
router.delete("/me", requireAuth, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const userId = req.userId;

    const result = await deleteUserCompletely(conn, userId, { deletedBy: "Self" });
    if (!result.success) {
      await conn.rollback();
      return res.status(404).json({ error: result.error || "User not found" });
    }

    await conn.commit();
    res.json({ success: true, message: "Account and all associated data permanently deleted.", ...result });
  } catch (err) {
    await conn.rollback();
    console.error("[SELF DELETE USER ERROR]", err);
    res.status(500).json({ error: "Failed to delete account" });
  } finally {
    conn.release();
  }
});

// GET /api/users/agents — Fetch public list of estate agents (Brokers and Agencies)
router.get("/agents", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, email, phone, location, avatar_url AS avatarUrl, role 
       FROM users 
       WHERE role IN ('Broker', 'Agency', 'broker', 'agency') 
       ORDER BY id DESC LIMIT 12`
    );
    res.json(rows);
  } catch (err) {
    console.error("Failed to fetch agents:", err);
    res.status(500).json({ error: "Failed to fetch agents" });
  }
});

export default router;
