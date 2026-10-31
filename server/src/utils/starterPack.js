import { pool } from "../db.js";

/**
 * Role-to-Starter-Plan mapping:
 * - Buyer (user): "Starter Pack"
 * - Owner: "Owner Starter"
 * - Broker: "Broker Starter"
 * - Agency: "Agency Starter"
 */
export async function getStarterPackForRole(role = "Buyer") {
  const normalizedRole = (role || "").toLowerCase();

  let targetPlanName = "Starter Pack";
  let targetPlanId = "user_starter_pack";
  let dbRole = "user";

  if (normalizedRole === "owner") {
    targetPlanName = "Owner Starter";
    targetPlanId = "owner_starter_pack";
    dbRole = "owner";
  } else if (normalizedRole === "broker") {
    targetPlanName = "Broker Starter";
    targetPlanId = "broker_standard_pack";
    dbRole = "broker";
  } else if (normalizedRole === "agency") {
    targetPlanName = "Agency Starter";
    targetPlanId = "agency_corporate_pack";
    dbRole = "agency";
  }

  try {
    const [rows] = await pool.query(
      `SELECT id, plan_id, name, role, enquiry_tokens, listing_slots, credits, price, discount
       FROM subscription_plans
       WHERE (LOWER(name) = LOWER(?) OR plan_id = ? OR (role = ? AND LOWER(name) LIKE '%starter%'))
       ORDER BY (LOWER(name) = LOWER(?)) DESC, (plan_id = ?) DESC, id ASC
       LIMIT 1`,
      [targetPlanName, targetPlanId, dbRole, targetPlanName, targetPlanId]
    );

    if (rows && rows.length > 0) {
      const plan = rows[0];
      const enquiryTokens = plan.enquiry_tokens !== null && plan.enquiry_tokens !== undefined
        ? Number(plan.enquiry_tokens)
        : (plan.credits !== null && plan.credits !== undefined ? Number(plan.credits) : 10);
      const listingSlots = plan.listing_slots !== null && plan.listing_slots !== undefined
        ? Number(plan.listing_slots)
        : 0;

      return {
        id: plan.id,
        planId: plan.plan_id || targetPlanId,
        planName: plan.name || targetPlanName,
        role: dbRole,
        enquiryTokens,
        listingSlots,
      };
    }
  } catch (err) {
    console.error(`[StarterPack] Error querying starter pack for role ${role}:`, err.message);
  }

  // Fallbacks if database row missing
  const fallbacks = {
    user: { enquiryTokens: 10, listingSlots: 0, planName: "Starter Pack", planId: "user_starter_pack" },
    owner: { enquiryTokens: 15, listingSlots: 1, planName: "Owner Starter", planId: "owner_starter_pack" },
    broker: { enquiryTokens: 35, listingSlots: 10, planName: "Broker Starter", planId: "broker_standard_pack" },
    agency: { enquiryTokens: 100, listingSlots: 15, planName: "Agency Starter", planId: "agency_corporate_pack" },
  };

  const fb = fallbacks[dbRole] || fallbacks.user;
  return {
    id: null,
    planId: fb.planId,
    planName: fb.planName,
    role: dbRole,
    enquiryTokens: fb.enquiryTokens,
    listingSlots: fb.listingSlots,
  };
}

/**
 * Backward compatibility alias for Buyer starter pack
 */
export async function getStarterPackConfig() {
  return await getStarterPackForRole("Buyer");
}

/**
 * Activates the role-specific starter pack for a user:
 * Sets subscription_status = 'active', initializes/adjusts enquiry tokens and listing slots,
 * and records bonus credit transactions.
 */
export async function activateStarterPlanForUser(userId, role = "Buyer") {
  if (!userId) return null;

  const starter = await getStarterPackForRole(role);
  const normalizedRole = (!role || role.toLowerCase() === "user") ? "Buyer" : role;

  const [userRows] = await pool.query(
    "SELECT id, role, subscription_status, enquiry_credits_left, listing_slots_left FROM users WHERE id = ?",
    [userId]
  );
  if (userRows.length === 0) return null;
  const user = userRows[0];

  const currentEnquiry = user.enquiry_credits_left !== null && user.enquiry_credits_left !== undefined 
    ? Number(user.enquiry_credits_left) 
    : 0;
  const currentSlots = user.listing_slots_left !== null && user.listing_slots_left !== undefined 
    ? Number(user.listing_slots_left) 
    : 0;

  // Balance should be at least the starter pack capacity
  const newEnquiry = Math.max(currentEnquiry, starter.enquiryTokens);
  const newSlots = Math.max(currentSlots, starter.listingSlots);

  await pool.query(
    `UPDATE users 
     SET role = ?,
         subscription_status = 'active',
         enquiry_credits_left = ?,
         listing_slots_left = ?
     WHERE id = ?`,
    [normalizedRole, newEnquiry, newSlots, userId]
  );

  // Check if starter transaction already logged
  const [existingTx] = await pool.query(
    "SELECT id FROM credit_transactions WHERE user_id = ? AND notes LIKE ? LIMIT 1",
    [userId, `%${starter.planName}%`]
  );

  if (existingTx.length === 0) {
    if (starter.enquiryTokens > 0) {
      await pool.query(
        `INSERT INTO credit_transactions (user_id, credit_type, transaction_type, amount_credits, balance_after, notes)
         VALUES (?, 'enquiry', 'bonus', ?, ?, ?)`,
        [userId, starter.enquiryTokens, newEnquiry, `Activated free ${starter.planName} (${normalizedRole})`]
      );
    }
    if (starter.listingSlots > 0) {
      await pool.query(
        `INSERT INTO credit_transactions (user_id, credit_type, transaction_type, amount_credits, balance_after, notes)
         VALUES (?, 'listing_slot', 'bonus', ?, ?, ?)`,
        [userId, starter.listingSlots, newSlots, `Activated free ${starter.planName} (${normalizedRole})`]
      );
    }
  }

  return {
    ...starter,
    activatedEnquiry: newEnquiry,
    activatedSlots: newSlots,
  };
}
