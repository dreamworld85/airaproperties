import { pool } from "../db.js";

/**
 * Dynamically queries the configured 'Starter Pack' from subscription_plans.
 * Admin can adjust the Starter Pack's enquiry_tokens and listing_slots in the Subscription admin panel.
 */
export async function getStarterPackConfig() {
  try {
    const [rows] = await pool.query(
      `SELECT enquiry_tokens, listing_slots, credits 
       FROM subscription_plans 
       WHERE plan_id = 'user_starter_pack' 
          OR LOWER(name) LIKE '%starter%' 
       ORDER BY (plan_id = 'user_starter_pack') DESC, id ASC 
       LIMIT 1`
    );

    if (rows && rows.length > 0) {
      const plan = rows[0];
      const enquiryTokens = plan.enquiry_tokens !== null && plan.enquiry_tokens !== undefined 
        ? Number(plan.enquiry_tokens) 
        : (plan.credits !== null && plan.credits !== undefined ? Number(plan.credits) : 10);
      const listingSlots = plan.listing_slots !== null && plan.listing_slots !== undefined 
        ? Number(plan.listing_slots) 
        : 2;
      return { enquiryTokens, listingSlots };
    }
  } catch (err) {
    console.error("[StarterPack] Error querying starter pack from subscription_plans:", err.message);
  }

  // Sensible fallback matching default seed
  return { enquiryTokens: 10, listingSlots: 2 };
}
