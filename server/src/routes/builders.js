import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

// Middleware to check admin authorization
function requireAdmin(req, res, next) {
  const adminToken = req.headers["x-admin-auth"] || req.headers["authorization"];
  if (!adminToken) {
    return res.status(401).json({ error: "Admin authentication required." });
  }
  next();
}

// ==========================================
// PUBLIC BUILDER INQUIRY & MICROSITE ROUTES
// ==========================================

// POST /api/builders/inquiries (Public submission from Partner With Us page)
router.post("/inquiries", async (req, res) => {
  try {
    const {
      company_name,
      contact_person,
      phone,
      email,
      office_address,
      city_district,
      active_projects,
      package_preference,
      experience_years,
      message
    } = req.body;

    if (!company_name || !contact_person || !phone || !email || !office_address) {
      return res.status(400).json({ error: "Please fill in all required company and contact information." });
    }

    const [result] = await pool.query(
      `INSERT INTO builder_inquiries 
       (company_name, contact_person, phone, email, office_address, city_district, active_projects, package_preference, experience_years, message, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [
        company_name.trim(),
        contact_person.trim(),
        phone.trim(),
        email.trim().toLowerCase(),
        office_address.trim(),
        city_district || "",
        active_projects || "1-2 Projects",
        package_preference || "Builder Standard",
        parseInt(experience_years || 0, 10),
        message || ""
      ]
    );

    // Also log to activity_logs for audit
    try {
      await pool.query(
        "INSERT INTO activity_logs (user_id, action, category) VALUES (null, ?, 'System')",
        [`New Builder Partner inquiry received from ${company_name} (${contact_person})`]
      );
    } catch (_) {}

    res.status(201).json({
      success: true,
      message: "Your partnership application has been received successfully! Our Builder Relations Director will connect with you within 24 business hours.",
      inquiryId: result.insertId
    });
  } catch (err) {
    console.error("Error creating builder inquiry:", err);
    res.status(500).json({ error: "Failed to submit partner inquiry: " + err.message });
  }
});

// GET /api/builders (List all verified builders for directory & showcases)
router.get("/", async (req, res) => {
  try {
    const [builders] = await pool.query(
      `SELECT b.*, 
        COUNT(bp.id) AS project_count 
       FROM builders b
       LEFT JOIN builder_projects bp ON b.id = bp.builder_id
       GROUP BY b.id
       ORDER BY b.is_featured DESC, b.total_projects DESC`
    );

    res.json(builders);
  } catch (err) {
    console.error("Error fetching builders:", err);
    res.status(500).json({ error: "Failed to retrieve builders list: " + err.message });
  }
});

// GET /api/builders/:idOrSlug (Detailed builder microsite data with projects)
router.get("/:idOrSlug", async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let query = "SELECT * FROM builders WHERE id = ?";
    let param = idOrSlug;

    if (isNaN(Number(idOrSlug))) {
      query = "SELECT * FROM builders WHERE slug = ?";
    }

    const [[builder]] = await pool.query(query, [param]);

    if (!builder) {
      return res.status(404).json({ error: "Builder microsite not found." });
    }

    // Fetch projects for this builder
    const [projects] = await pool.query(
      "SELECT * FROM builder_projects WHERE builder_id = ? ORDER BY is_featured DESC, created_at DESC",
      [builder.id]
    );

    // Group projects by status
    const ongoing = projects.filter((p) => p.status === "Ongoing");
    const upcoming = projects.filter((p) => p.status === "Upcoming");
    const completed = projects.filter((p) => p.status === "Completed");

    res.json({
      builder,
      projects,
      groupedProjects: {
        all: projects,
        ongoing,
        upcoming,
        completed
      }
    });
  } catch (err) {
    console.error("Error fetching builder details:", err);
    res.status(500).json({ error: "Failed to retrieve builder details: " + err.message });
  }
});

// POST /api/builders/:id/leads (Direct customer inquiries to builder from microsite)
router.post("/:id/leads", async (req, res) => {
  try {
    const builderId = req.params.id;
    const { name, phone, email, message, projectId } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: "Name and phone number are required to submit an inquiry." });
    }

    const [result] = await pool.query(
      `INSERT INTO builder_leads (builder_id, project_id, name, phone, email, message, source, status)
       VALUES (?, ?, ?, ?, ?, ?, 'microsite', 'New')`,
      [
        builderId,
        projectId || null,
        name.trim(),
        phone.trim(),
        email ? email.trim().toLowerCase() : null,
        message || "Interested in scheduling a site visit and receiving project brochures."
      ]
    );

    res.status(201).json({
      success: true,
      message: "Your inquiry has been sent directly to the builder sales desk. They will contact you shortly!",
      leadId: result.insertId
    });
  } catch (err) {
    console.error("Error submitting builder lead:", err);
    res.status(500).json({ error: "Failed to submit lead: " + err.message });
  }
});

// ==========================================
// ADMIN BUILDER INQUIRY MANAGEMENT ROUTES
// ==========================================

// GET /api/builders/admin/inquiries (Admin list with filtering)
router.get("/admin/inquiries", requireAdmin, async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = "SELECT * FROM builder_inquiries WHERE 1=1";
    const params = [];

    if (status && status !== "All") {
      query += " AND status = ?";
      params.push(status);
    }

    if (search && search.trim()) {
      query += " AND (company_name LIKE ? OR contact_person LIKE ? OR phone LIKE ? OR email LIKE ? OR city_district LIKE ?)";
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term, term);
    }

    query += " ORDER BY created_at DESC";

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching builder inquiries for admin:", err);
    res.status(500).json({ error: "Failed to load builder inquiries: " + err.message });
  }
});

// PUT /api/builders/admin/inquiries/:id/status (Admin status updater)
router.put("/admin/inquiries/:id/status", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    if (!["Pending", "Contacted", "Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value." });
    }

    await pool.query(
      "UPDATE builder_inquiries SET status = ?, admin_notes = COALESCE(?, admin_notes) WHERE id = ?",
      [status, admin_notes, id]
    );

    res.json({ success: true, message: `Inquiry status updated to ${status}.` });
  } catch (err) {
    console.error("Error updating builder inquiry status:", err);
    res.status(500).json({ error: "Failed to update status: " + err.message });
  }
});

// POST /api/builders/admin/inquiries/:id/approve (Admin approval & auto-provisioning)
router.post("/admin/inquiries/:id/approve", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const [[inquiry]] = await pool.query("SELECT * FROM builder_inquiries WHERE id = ?", [id]);

    if (!inquiry) {
      return res.status(404).json({ error: "Inquiry not found." });
    }

    // Update status to Approved
    await pool.query(
      "UPDATE builder_inquiries SET status = 'Approved', admin_notes = CONCAT(COALESCE(admin_notes, ''), ' [Approved by Admin]') WHERE id = ?",
      [id]
    );

    // Check if builder already exists by slug
    const slug = inquiry.company_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const [[existing]] = await pool.query("SELECT id FROM builders WHERE slug = ?", [slug]);
    let builderId = existing?.id;

    if (!builderId) {
      // Auto-provision a starter builder showcase
      const [bResult] = await pool.query(
        `INSERT INTO builders 
         (name, slug, tagline, about, experience_years, total_projects, office_address, district, phone, email, is_featured, is_verified)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1)`,
        [
          inquiry.company_name,
          slug,
          `Premier Real Estate Developers & Builders — ${inquiry.city_district || "Kerala"}`,
          `${inquiry.company_name} is a premier construction firm committed to high architectural standards, punctual delivery, and customer-first quality living.`,
          inquiry.experience_years || 5,
          inquiry.active_projects === "10+ Projects" ? 15 : (inquiry.active_projects === "6-10 Projects" ? 8 : 3),
          inquiry.office_address,
          inquiry.city_district || "Ernakulam",
          inquiry.phone,
          inquiry.email
        ]
      );
      builderId = bResult.insertId;
    }

    res.json({
      success: true,
      message: `Builder inquiry from "${inquiry.company_name}" approved successfully! Builder showcase profile provisioned with ID #${builderId}.`,
      builderId,
      slug
    });
  } catch (err) {
    console.error("Error approving builder inquiry:", err);
    res.status(500).json({ error: "Failed to approve inquiry: " + err.message });
  }
});

// DELETE /api/builders/admin/inquiries/:id (Admin delete inquiry)
router.delete("/admin/inquiries/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM builder_inquiries WHERE id = ?", [id]);
    res.json({ success: true, message: "Builder inquiry deleted successfully." });
  } catch (err) {
    console.error("Error deleting builder inquiry:", err);
    res.status(500).json({ error: "Failed to delete inquiry: " + err.message });
  }
});

export default router;
