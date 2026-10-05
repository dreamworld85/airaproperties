import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import Razorpay from "razorpay";
import crypto from "crypto";

const router = Router();

// Helper to retrieve Razorpay credentials dynamically from DB settings or environment
async function getRazorpay() {
  let kId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
  let kSecret = process.env.RAZORPAY_KEY_SECRET;

  try {
    const [[idRow]] = await pool.query("SELECT `value` FROM settings WHERE `key` = 'razorpay_key_id'");
    if (idRow?.value && idRow.value.trim()) {
      kId = idRow.value.trim();
    }
    const [[secRow]] = await pool.query("SELECT `value` FROM settings WHERE `key` = 'razorpay_key_secret'");
    if (secRow?.value && secRow.value.trim()) {
      kSecret = secRow.value.trim();
    }
  } catch (err) {
    // fallback
  }

  const finalId = kId || "rzp_test_TjCoQOO2xpM24Y";
  const finalSec = kSecret || "Dh5EgzAjP6KdMfcisL4uZbSd";

  const instance = new Razorpay({
    key_id: finalId,
    key_secret: finalSec,
  });

  return { razorpay: instance, keyId: finalId, keySecret: finalSec };
}

// GET /api/payments/config (Public key & mode status check)
router.get("/config", async (_req, res) => {
  try {
    const { keyId } = await getRazorpay();
    const isConfigured = keyId && keyId !== "rzp_test_placeholder";
    const mode = keyId.startsWith("rzp_live") ? "live" : "test";
    res.json({
      keyId,
      key_id: keyId,
      isConfigured,
      mode,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to read payment config: " + err.message });
  }
});

// POST /api/payments/create-subscription
// Create Razorpay order for token/credit packages
router.post("/create-subscription", requireAuth, async (req, res) => {
  try {
    const { planId, plan_id, planType, durationMonths } = req.body;
    const [userRows] = await pool.query("SELECT role FROM users WHERE id = ?", [req.userId]);
    if (userRows.length === 0) return res.status(404).json({ error: "User not found" });
    const userRole = (userRows[0].role || "user").toLowerCase();

    let plan = null;
    if (planId || plan_id) {
      const targetId = planId || plan_id;
      const [rows] = await pool.query(
        "SELECT * FROM subscription_plans WHERE id = ? OR plan_id = ?",
        [targetId, targetId]
      );
      if (rows.length > 0) plan = rows[0];
    }

    if (!plan && planType) {
      const [rows] = await pool.query(
        "SELECT * FROM subscription_plans WHERE role = ? AND plan_type = ? ORDER BY price ASC LIMIT 1",
        [userRole, planType]
      );
      if (rows.length > 0) plan = rows[0];
    }

    if (!plan) {
      const [rows] = await pool.query(
        "SELECT * FROM subscription_plans WHERE role = ? ORDER BY price ASC LIMIT 1",
        [userRole]
      );
      if (rows.length > 0) plan = rows[0];
    }

    const price = plan ? Number(plan.price) : 199.00;
    const discount = plan ? Number(plan.discount || 0) : 0.00;
    const finalPrice = Math.max(0, price - discount);

    const amount = Math.round(finalPrice * 100); // INR in paise
    const currency = "INR";
    const receipt = `tok_rcpt_${req.userId}_${Date.now()}`;

    const options = {
      amount,
      currency,
      receipt,
    };

    const { razorpay, keyId } = await getRazorpay();
    console.log(`Creating Razorpay order for user ${req.userId} (Plan: ${plan?.plan_id || plan?.id}, Role: ${userRole}): Amount = ₹${finalPrice}`);
    const order = await razorpay.orders.create(options);

    res.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: keyId,
      key_id: keyId,
      planId: plan?.id,
      plan_id: plan?.plan_id,
      name: plan?.name,
      credits: plan?.credits || 10,
      listing_slots: plan?.listing_slots ?? (plan?.plan_type === 'listing_slots' ? plan?.credits : 0),
      enquiry_tokens: plan?.enquiry_tokens ?? (plan?.plan_type === 'enquiry_pack' ? plan?.credits : 0),
      planType: plan?.plan_type || "combo",
    });
  } catch (err) {
    console.error("Razorpay order creation error:", err);
    res.status(500).json({ error: "Failed to initiate payment: " + err.message });
  }
});

// POST /api/payments/verify-subscription
router.post("/verify-subscription", requireAuth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId, plan_id } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing required verification fields." });
    }

    const { keySecret } = await getRazorpay();
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body.toString())
      .digest("hex");

    console.log(`Verifying payment signature for user ${req.userId}...`);
    if (expectedSignature !== razorpay_signature) {
      console.warn("Invalid payment signature verification failed.");
      return res.status(400).json({ error: "Invalid payment signature verification." });
    }

    // Look up plan
    let plan = null;
    const targetId = planId || plan_id;
    if (targetId) {
      const [rows] = await pool.query(
        "SELECT * FROM subscription_plans WHERE id = ? OR plan_id = ?",
        [targetId, targetId]
      );
      if (rows.length > 0) plan = rows[0];
    }

    const [userRows] = await pool.query(
      "SELECT role, enquiry_credits_left, listing_slots_left FROM users WHERE id = ?",
      [req.userId]
    );
    const userRole = (userRows[0]?.role || "user").toLowerCase();

    if (!plan) {
      const [rows] = await pool.query(
        "SELECT * FROM subscription_plans WHERE role = ? ORDER BY price ASC LIMIT 1",
        [userRole]
      );
      if (rows.length > 0) plan = rows[0];
    }

    const listingSlotsToAdd = Number(plan?.listing_slots ?? (plan?.plan_type === 'listing_slots' ? plan?.credits : 0));
    const enquiryTokensToAdd = Number(plan?.enquiry_tokens ?? (plan?.plan_type === 'enquiry_pack' ? plan?.credits : 0));
    const pricePaid = plan ? Math.max(0, Number(plan.price) - Number(plan.discount || 0)) : 0;

    let updatedEnquiry = Number(userRows[0]?.enquiry_credits_left || 0);
    let updatedSlots = Number(userRows[0]?.listing_slots_left || 0);

    if (enquiryTokensToAdd > 0) {
      await pool.query(
        "UPDATE users SET enquiry_credits_left = enquiry_credits_left + ? WHERE id = ?",
        [enquiryTokensToAdd, req.userId]
      );
      updatedEnquiry += enquiryTokensToAdd;
      await pool.query(
        `INSERT INTO credit_transactions 
         (user_id, credit_type, transaction_type, amount_credits, balance_after, price_paid, payment_id, order_id, notes) 
         VALUES (?, 'enquiry', 'purchase', ?, ?, ?, ?, ?, ?)`,
        [req.userId, enquiryTokensToAdd, updatedEnquiry, pricePaid, razorpay_payment_id, razorpay_order_id, `Purchased ${enquiryTokensToAdd} Enquiry Tokens (${plan?.name || plan?.description || ''})`]
      );
    }

    if (listingSlotsToAdd > 0) {
      await pool.query(
        "UPDATE users SET listing_slots_left = listing_slots_left + ? WHERE id = ?",
        [listingSlotsToAdd, req.userId]
      );
      updatedSlots += listingSlotsToAdd;
      await pool.query(
        `INSERT INTO credit_transactions 
         (user_id, credit_type, transaction_type, amount_credits, balance_after, price_paid, payment_id, order_id, notes) 
         VALUES (?, 'listing_slot', 'purchase', ?, ?, ?, ?, ?, ?)`,
        [req.userId, listingSlotsToAdd, updatedSlots, pricePaid, razorpay_payment_id, razorpay_order_id, `Purchased ${listingSlotsToAdd} Active Listing Slots (${plan?.name || plan?.description || ''})`]
      );
    }

    // Keep subscription_status active as a flag
    await pool.query(
      "UPDATE users SET subscription_status = 'active', razorpay_subscription_id = ? WHERE id = ?",
      [razorpay_payment_id, req.userId]
    );

    res.json({
      success: true,
      planType: plan?.plan_type || "combo",
      creditsAdded: enquiryTokensToAdd + listingSlotsToAdd,
      enquiryTokensAdded,
      listingSlotsAdded: listingSlotsToAdd,
      enquiryCreditsLeft: updatedEnquiry,
      listingSlotsLeft: updatedSlots,
    });
  } catch (err) {
    console.error("Subscription verification error:", err);
    res.status(500).json({ error: "Signature verification failed: " + err.message });
  }
});

// POST /api/payments/create-featured-order
router.post("/create-featured-order", requireAuth, async (req, res) => {
  try {
    const { propertyId } = req.body;
    if (!propertyId) {
      return res.status(400).json({ error: "Property ID is required." });
    }

    // Verify property ownership and status
    const [rows] = await pool.query(
      "SELECT owner_id, title, status FROM properties WHERE id = ?",
      [propertyId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Property not found." });
    }
    if (rows[0].owner_id !== req.userId) {
      return res.status(403).json({ error: "You do not own this property listing." });
    }

    // Get featured price from settings
    const [[priceRow]] = await pool.query(
      "SELECT `value` FROM settings WHERE `key` = 'featured_price'"
    );
    const price = priceRow ? Number(priceRow.value) : 299;
    const amount = Math.round(price * 100); // in paise

    const receipt = `feat_rcpt_${propertyId}_${Date.now()}`;
    const options = {
      amount,
      currency: "INR",
      receipt,
    };

    const { razorpay, keyId } = await getRazorpay();
    console.log(`Creating Razorpay featured order for property ${propertyId} (Owner: ${req.userId}): Amount = ₹${price}`);
    const order = await razorpay.orders.create(options);

    res.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: keyId,
      key_id: keyId,
      propertyId,
    });
  } catch (err) {
    console.error("Razorpay featured order creation error:", err);
    res.status(500).json({ error: "Failed to initiate payment: " + err.message });
  }
});

// POST /api/payments/verify-featured-payment
router.post("/verify-featured-payment", requireAuth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, propertyId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !propertyId) {
      return res.status(400).json({ error: "Missing required verification fields." });
    }

    const { keySecret } = await getRazorpay();
    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body.toString())
      .digest("hex");

    console.log(`Verifying featured payment signature for property ${propertyId} by user ${req.userId}...`);
    if (expectedSignature !== razorpay_signature) {
      console.warn("Invalid signature. Verification failed.");
      return res.status(400).json({ error: "Invalid payment signature verification." });
    }

    // Fetch title for logging
    const [[prop]] = await pool.query("SELECT title FROM properties WHERE id = ?", [propertyId]);
    const title = prop ? prop.title : `ID #${propertyId}`;

    // Update property featured status in database
    await pool.query(
      "UPDATE properties SET is_featured = 1 WHERE id = ?",
      [propertyId]
    );

    // Log activity
    const logAction = `Property listing "${title}" (ID: #${propertyId}) promoted to Featured tier via payment.`;
    await pool.query(
      "INSERT INTO activity_logs (user_id, action, category) VALUES (?, ?, 'Properties')",
      [req.userId, logAction]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Featured verification error:", err);
    res.status(500).json({ error: "Signature verification failed: " + err.message });
  }
});

export default router;
