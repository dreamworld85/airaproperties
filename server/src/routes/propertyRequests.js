import { Router } from "express";
import { pool } from "../db.js";
import { sendPropertyRequestEmail } from "../utils/mailer.js";

const router = Router();

// Middleware to verify admin login session
function checkAdminSession(req, res, next) {
  const isAdmin = req.headers["x-admin-auth"] === "KeralaRealtyAdminSecretToken2026";
  if (!isAdmin) {
    return res.status(401).json({ message: "Unauthorized admin access." });
  }
  next();
}

// POST /api/property-requests - Submit a new property request (Public: guests or authenticated users)
router.post("/", async (req, res) => {
  try {
    const {
      full_name,
      phone,
      email,
      request_type,
      property_type,
      preferred_location,
      bedrooms,
      budget_range,
      move_in_date,
      furnished,
      description,
      special_requirements,
      contact_preference,
      best_time_to_contact,
      user_id,
    } = req.body;

    if (!full_name || !full_name.trim()) {
      return res.status(400).json({ error: "Full name is required." });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ error: "Phone number is required." });
    }
    if (!preferred_location || !preferred_location.trim()) {
      return res.status(400).json({ error: "Preferred location is required." });
    }
    if (!budget_range || !budget_range.trim()) {
      return res.status(400).json({ error: "Budget range is required." });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ error: "Please describe what you need." });
    }

    const [result] = await pool.query(
      `INSERT INTO property_requests (
        user_id,
        full_name,
        phone,
        email,
        request_type,
        property_type,
        preferred_location,
        bedrooms,
        budget_range,
        move_in_date,
        furnished,
        description,
        special_requirements,
        contact_preference,
        best_time_to_contact,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'New')`,
      [
        user_id || null,
        full_name.trim(),
        phone.trim(),
        (email || "").trim() || null,
        request_type || "Rent",
        property_type || "House",
        preferred_location.trim(),
        bedrooms || null,
        budget_range.trim(),
        move_in_date || null,
        furnished || null,
        description.trim(),
        (special_requirements || "").trim() || null,
        contact_preference || null,
        best_time_to_contact || null,
      ]
    );

    // Send email notification to airapropertiesone@gmail.com asynchronously
    sendPropertyRequestEmail({
      id: result.insertId,
      full_name: full_name.trim(),
      phone: phone.trim(),
      email: (email || "").trim(),
      request_type,
      property_type,
      preferred_location: preferred_location.trim(),
      bedrooms,
      budget_range: budget_range.trim(),
      move_in_date,
      furnished,
      description: description.trim(),
      special_requirements: (special_requirements || "").trim(),
      contact_preference,
      best_time_to_contact,
    }).catch((emailErr) => {
      console.error("[PropertyRequest] Email notification error:", emailErr);
    });

    res.json({
      success: true,
      id: result.insertId,
      message: "Property request submitted successfully! Our team will contact you shortly.",
    });
  } catch (err) {
    console.error("[PropertyRequest] Submit error:", err);
    res.status(500).json({ error: "Failed to submit property request." });
  }
});

// GET /api/property-requests/admin - List all property requests for Admin
router.get("/admin", checkAdminSession, async (req, res) => {
  try {
    const { requestType, location, status, search } = req.query;

    let query = "SELECT * FROM property_requests WHERE 1=1";
    const params = [];

    if (requestType && requestType !== "All") {
      query += " AND request_type = ?";
      params.push(requestType);
    }

    if (location && location.trim() && location !== "All") {
      query += " AND preferred_location LIKE ?";
      params.push(`%${location.trim()}%`);
    }

    if (status && status !== "All") {
      query += " AND status = ?";
      params.push(status);
    }

    if (search && search.trim()) {
      query += " AND (full_name LIKE ? OR phone LIKE ? OR email LIKE ? OR preferred_location LIKE ? OR description LIKE ?)";
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term, term);
    }

    query += " ORDER BY id DESC";

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("[PropertyRequest Admin] List error:", err);
    res.status(500).json({ error: "Failed to load property requests." });
  }
});

// PATCH /api/property-requests/admin/:id/status - Update request status
router.patch("/admin/:id/status", checkAdminSession, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Status is required." });
    }
    await pool.query("UPDATE property_requests SET status = ? WHERE id = ?", [status, req.params.id]);
    res.json({ success: true, message: "Status updated successfully." });
  } catch (err) {
    console.error("[PropertyRequest Admin] Update status error:", err);
    res.status(500).json({ error: "Failed to update status." });
  }
});

// DELETE /api/property-requests/admin/:id - Delete a property request
router.delete("/admin/:id", checkAdminSession, async (req, res) => {
  try {
    await pool.query("DELETE FROM property_requests WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Property request deleted successfully." });
  } catch (err) {
    console.error("[PropertyRequest Admin] Delete error:", err);
    res.status(500).json({ error: "Failed to delete request." });
  }
});

export default router;
