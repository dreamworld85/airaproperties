import { pool } from "../db.js";

export async function checkUserAccess(userId) {
  if (!userId) {
    return {
      hasAccess: false,
      role: "Guest",
      isFreeGranted: false,
      isSubscribed: false,
      hasTrial: false,
      remainingDays: 0,
      enquiryCreditsLeft: 0,
      listingSlotsLeft: 0,
      canPostProperty: false,
    };
  }

  const [rows] = await pool.query(
    "SELECT role, subscription_status, is_free_subscription_granted, enquiry_credits_left, listing_slots_left, created_at FROM users WHERE id = ?",
    [userId]
  );
  if (rows.length === 0) {
    return {
      hasAccess: false,
      role: "Guest",
      isFreeGranted: false,
      isSubscribed: false,
      hasTrial: false,
      remainingDays: 0,
      enquiryCreditsLeft: 0,
      listingSlotsLeft: 0,
      canPostProperty: false,
    };
  }

  const user = rows[0];
  const isFreeGranted = user.is_free_subscription_granted === 1;
  const enquiryCreditsLeft = user.enquiry_credits_left !== null && user.enquiry_credits_left !== undefined 
    ? Number(user.enquiry_credits_left) 
    : 3;
  const listingSlotsLeft = user.listing_slots_left !== null && user.listing_slots_left !== undefined 
    ? Number(user.listing_slots_left) 
    : 2;

  // Contact access: User has remaining enquiry tokens or has free grant
  const hasAccess = isFreeGranted || enquiryCreditsLeft > 0;
  // Lister access: Can create or activate property if listing slots are left or free grant
  const canPostProperty = isFreeGranted || listingSlotsLeft > 0;

  // Count distinct properties unlocked by this user
  const [[clickRow]] = await pool.query(
    "SELECT COUNT(DISTINCT property_id) AS count FROM contact_clicks WHERE user_id = ?",
    [userId]
  );
  const unlockedCount = clickRow ? clickRow.count : 0;

  return {
    hasAccess,
    canPostProperty,
    role: user.role,
    isFreeGranted,
    isSubscribed: isFreeGranted, // no date-based expiry
    hasTrial: false,
    remainingDays: 0,
    enquiryCreditsLeft,
    listingSlotsLeft,
    inquiryCount: unlockedCount,
  };
}
