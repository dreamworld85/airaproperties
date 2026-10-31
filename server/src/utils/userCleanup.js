import { deleteUploadedFile } from "./fileHelper.js";

/**
 * Permanently deletes a user and ALL associated data from the platform.
 * Includes:
 *  - User tokens and token transactions (credit_transactions)
 *  - User activity logs and audit logs
 *  - All properties uploaded by this user and ALL their related records:
 *      * property media (images, videos) from database & physical disk
 *      * property reviews
 *      * property views
 *      * property enquiries
 *      * property contact clicks
 *      * property saved entries
 *      * property reported listings
 *      * property notifications
 *  - User notifications (sent & received)
 *  - User reviews written
 *  - User enquiries submitted
 *  - User saved properties
 *  - User contact clicks
 *  - User property views
 *  - User role switch requests
 *  - User property requests & service enquiries
 *  - User social accounts
 *  - User phone OTP records
 *  - Physical files: user avatar, agency logo, agency banner, and all property media
 *  - The user account itself
 *
 * @param {import('mysql2/promise').Connection} conn Database transaction connection
 * @param {number|string} userId ID of the user to delete
 * @param {object} options Additional options (e.g. { deletedBy: 'Admin' | 'Self' })
 */
export async function deleteUserCompletely(conn, userId, options = {}) {
  const numericUserId = Number(userId);
  if (!numericUserId || isNaN(numericUserId)) {
    return { success: false, error: "Invalid user ID" };
  }

  // 1. Fetch user data
  const [[user]] = await conn.query(
    "SELECT id, name, email, phone, avatar_url, agency_logo_url, agency_banner_url FROM users WHERE id = ?",
    [numericUserId]
  );
  if (!user) {
    return { success: false, error: "User not found" };
  }

  // 2. Fetch all properties owned / uploaded by this user
  const [properties] = await conn.query(
    "SELECT id, agency_logo_url FROM properties WHERE owner_id = ?",
    [numericUserId]
  );
  const propIds = properties.map((p) => p.id);

  // 3. Fetch all media files for these properties
  let mediaFiles = [];
  if (propIds.length > 0) {
    [mediaFiles] = await conn.query(
      `SELECT url FROM property_media WHERE property_id IN (${propIds.map(() => "?").join(",")})`,
      propIds
    );
  }

  // 4. Collect all physical file paths to delete from disk
  const pathsToDelete = new Set();
  if (user.avatar_url) pathsToDelete.add(user.avatar_url);
  if (user.agency_logo_url) pathsToDelete.add(user.agency_logo_url);
  if (user.agency_banner_url) pathsToDelete.add(user.agency_banner_url);

  for (const p of properties) {
    if (p.agency_logo_url) pathsToDelete.add(p.agency_logo_url);
  }
  for (const m of mediaFiles) {
    if (m.url) pathsToDelete.add(m.url);
  }

  console.log(`[DELETE USER] Starting complete deletion for user #${numericUserId} ("${user.name}")`);
  console.log(`[DELETE USER] Found ${properties.length} properties and ${mediaFiles.length} media files.`);

  // 5. DATABASE DELETIONS

  // A. Delete user tokens & token transactions
  await conn.query("DELETE FROM credit_transactions WHERE user_id = ?", [numericUserId]);

  // B. Delete user activity logs
  await conn.query("DELETE FROM activity_logs WHERE user_id = ?", [numericUserId]);

  // C. Delete notifications referencing user or user's properties
  await conn.query("DELETE FROM notifications WHERE user_id = ? OR sender_id = ?", [numericUserId, numericUserId]);
  if (propIds.length > 0) {
    await conn.query(
      `DELETE FROM notifications WHERE property_id IN (${propIds.map(() => "?").join(",")})`,
      propIds
    );
  }

  // D. Delete role switch requests
  await conn.query("DELETE FROM role_switch_requests WHERE user_id = ?", [numericUserId]);

  // E. Delete enquiries (as visitor OR received on user's uploaded properties)
  await conn.query("DELETE FROM enquiries WHERE visitor_id = ?", [numericUserId]);
  if (propIds.length > 0) {
    await conn.query(
      `DELETE FROM enquiries WHERE property_id IN (${propIds.map(() => "?").join(",")})`,
      propIds
    );
  }

  // F. Delete saved properties (user's saved properties OR other users saving user's properties)
  await conn.query("DELETE FROM saved_properties WHERE user_id = ?", [numericUserId]);
  if (propIds.length > 0) {
    await conn.query(
      `DELETE FROM saved_properties WHERE property_id IN (${propIds.map(() => "?").join(",")})`,
      propIds
    );
  }

  // G. Delete contact clicks (by user OR received on user's properties)
  await conn.query("DELETE FROM contact_clicks WHERE user_id = ?", [numericUserId]);
  if (propIds.length > 0) {
    await conn.query(
      `DELETE FROM contact_clicks WHERE property_id IN (${propIds.map(() => "?").join(",")})`,
      propIds
    );
  }

  // H. Delete property reviews (written by user OR received on user's properties)
  await conn.query("DELETE FROM property_reviews WHERE user_id = ?", [numericUserId]);
  if (propIds.length > 0) {
    await conn.query(
      `DELETE FROM property_reviews WHERE property_id IN (${propIds.map(() => "?").join(",")})`,
      propIds
    );
  }

  // I. Delete property views (by user OR received on user's properties)
  await conn.query("DELETE FROM property_views WHERE visitor_id = ?", [numericUserId]);
  if (propIds.length > 0) {
    await conn.query(
      `DELETE FROM property_views WHERE property_id IN (${propIds.map(() => "?").join(",")})`,
      propIds
    );
  }

  // J. Delete reported listings (reported by user OR against user's properties)
  await conn.query("DELETE FROM reported_listings WHERE reporter_id = ?", [numericUserId]);
  if (propIds.length > 0) {
    await conn.query(
      `DELETE FROM reported_listings WHERE property_id IN (${propIds.map(() => "?").join(",")})`,
      propIds
    );
  }

  // K. Delete property requests & service enquiries made by this user
  await conn.query("DELETE FROM property_requests WHERE user_id = ?", [numericUserId]);
  await conn.query("DELETE FROM service_enquiries WHERE user_id = ?", [numericUserId]);

  // L. Delete social accounts
  await conn.query("DELETE FROM social_accounts WHERE user_id = ?", [numericUserId]);

  // M. Delete phone OTPs
  if (user.phone) {
    await conn.query("DELETE FROM phone_otps WHERE phone = ?", [user.phone]);
  }

  // N. Delete builder leads / inquiries if matching user phone or email
  if (user.phone || user.email) {
    const conditions = [];
    const params = [];
    if (user.phone) {
      conditions.push("phone = ?");
      params.push(user.phone);
    }
    if (user.email) {
      conditions.push("email = ?");
      params.push(user.email);
    }
    const whereClause = conditions.join(" OR ");
    await conn.query(`DELETE FROM builder_leads WHERE ${whereClause}`, params);
    await conn.query(`DELETE FROM builder_inquiries WHERE ${whereClause}`, params);
  }

  // O. Delete all uploaded properties and their property_media rows
  if (propIds.length > 0) {
    await conn.query(
      `DELETE FROM property_media WHERE property_id IN (${propIds.map(() => "?").join(",")})`,
      propIds
    );
    await conn.query("DELETE FROM properties WHERE owner_id = ?", [numericUserId]);
  }

  // P. Finally, delete the user row from users table
  await conn.query("DELETE FROM users WHERE id = ?", [numericUserId]);

  // 6. Record persistent audit log of the deletion (with user_id null so it persists)
  const isSelf = options.deletedBy === "Self";
  const actionLog = isSelf
    ? `User "${user.name}" (ID #${numericUserId}, Email: ${user.email || 'N/A'}, Phone: ${user.phone || 'N/A'}) self-deleted their account along with all ${properties.length} uploaded properties, token balances, and logs.`
    : `User "${user.name}" (ID #${numericUserId}, Email: ${user.email || 'N/A'}, Phone: ${user.phone || 'N/A'}) and all ${properties.length} uploaded properties, token balances, and logs permanently deleted by Admin.`;
  await conn.query("INSERT INTO activity_logs (user_id, action, category) VALUES (null, ?, 'Users')", [actionLog]);

  // 7. Delete physical files from disk
  for (const relativePath of pathsToDelete) {
    if (relativePath) {
      try {
        await deleteUploadedFile(relativePath);
      } catch (fileErr) {
        console.warn(`[DELETE USER] Failed to delete file ${relativePath}:`, fileErr.message);
      }
    }
  }

  console.log(`[DELETE USER] Successfully completed deletion for user #${numericUserId}.`);
  return {
    success: true,
    deletedUserId: numericUserId,
    deletedUserName: user.name,
    propertiesDeleted: properties.length,
    mediaFilesDeleted: mediaFiles.length,
    filesRemovedFromDisk: pathsToDelete.size,
  };
}
