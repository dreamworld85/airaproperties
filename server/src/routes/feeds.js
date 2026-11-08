import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

// Helper to escape XML special characters
function escapeXml(unsafe) {
  if (unsafe === null || unsafe === undefined) return "";
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Clean text for CDATA or description
function cleanText(text) {
  if (!text) return "";
  return String(text).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "").trim();
}

// Map property type to clean category
function mapMetaPropertyType(rawType) {
  if (!rawType) return "Real Estate > Property";
  const t = rawType.toLowerCase();
  if (t.includes("apartment") || t.includes("flat")) return "Real Estate > Apartment";
  if (t.includes("house") || t.includes("individual")) return "Real Estate > House";
  if (t.includes("villa")) return "Real Estate > Villa";
  if (t.includes("land") || t.includes("plot")) return "Real Estate > Land";
  if (t.includes("commercial") || t.includes("shop") || t.includes("office")) return "Real Estate > Commercial";
  return `Real Estate > ${rawType}`;
}

// Helper: Ensure full public media URL
function getFullMediaUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const clean = url.startsWith("/") ? url.slice(1) : url;
  return `https://api.airaproperties.in/${clean}`;
}

// Helper: Fetch all active properties with media for feeds
async function getActivePropertiesWithMedia() {
  const [properties] = await pool.query(
    `SELECT p.*, u.name as uploader_name, u.phone as uploader_phone
     FROM properties p
     LEFT JOIN users u ON p.owner_id = u.id
     WHERE p.status = 'Active'
     ORDER BY p.created_at DESC`
  );

  if (properties.length === 0) return [];

  const ids = properties.map((p) => p.id);
  const [mediaRows] = await pool.query(
    `SELECT property_id, url FROM property_media 
     WHERE property_id IN (?) 
     ORDER BY sort_order ASC`,
    [ids]
  );

  const mediaMap = {};
  for (const m of mediaRows) {
    if (!mediaMap[m.property_id]) mediaMap[m.property_id] = [];
    mediaMap[m.property_id].push(getFullMediaUrl(m.url));
  }

  return properties.map((p) => ({
    ...p,
    mediaUrls: mediaMap[p.id] || [],
  }));
}

/**
 * GET /api/feeds/facebook-marketplace.xml
 * Standard Meta Commerce Manager Product/Catalog XML Feed (RSS 2.0 with Google namespace)
 * This is the ONLY XML specification officially accepted by Meta Commerce Manager Data Feeds.
 */
router.get("/facebook-marketplace.xml", async (req, res) => {
  try {
    const properties = await getActivePropertiesWithMedia();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n`;
    xml += `  <channel>\n`;
    xml += `    <title>Aira Properties Home Listings</title>\n`;
    xml += `    <link>https://airaproperties.in</link>\n`;
    xml += `    <description>Properties for sale and rent on Aira Properties</description>\n`;

    for (const p of properties) {
      const isRent = String(p.purpose || "").toLowerCase().includes("rent");
      const purposeLabel = isRent ? "For Rent" : "For Sale";
      const productType = mapMetaPropertyType(p.property_type);
      const primaryImage = p.mediaUrls.length > 0 ? p.mediaUrls[0] : "https://airaproperties.in/images/all-properties.svg";
      const priceVal = Math.max(1, Math.round(Number(p.price) || 0));
      const priceFormatted = `${priceVal}.00 INR`;
      const url = `https://airaproperties.in/property/${p.id}`;
      const location = [p.address, p.district, p.state].filter(Boolean).join(", ") || "Kerala, India";
      const contact = p.contact_number || p.whatsapp_number || p.uploader_phone || "+91 9495126132";

      // Build rich description
      const descParts = [
        p.title,
        `Type: ${p.property_type || "Property"} (${purposeLabel})`,
        `Location: ${location}`,
        `Price: ₹${priceVal.toLocaleString("en-IN")}${isRent ? " / month" : ""}`,
      ];
      if (p.bedrooms) descParts.push(`Bedrooms: ${p.bedrooms} BHK`);
      if (p.bathrooms) descParts.push(`Bathrooms: ${p.bathrooms}`);
      if (p.area_sqft) descParts.push(`Built-up Area: ${p.area_sqft} sq.ft`);
      descParts.push(`Contact: ${contact}`);
      if (p.description) {
        descParts.push("\nDetails:\n" + p.description);
      }
      const fullDesc = cleanText(descParts.join("\n"));

      xml += `    <item>\n`;
      xml += `      <g:id>aira_${p.id}</g:id>\n`;
      xml += `      <g:title><![CDATA[${cleanText(p.title).slice(0, 150)}]]></g:title>\n`;
      xml += `      <g:description><![CDATA[${fullDesc.slice(0, 5000)}]]></g:description>\n`;
      xml += `      <g:link>${escapeXml(url)}</g:link>\n`;
      xml += `      <g:image_link>${escapeXml(primaryImage)}</g:image_link>\n`;
      xml += `      <g:brand>AiraProperties</g:brand>\n`;
      xml += `      <g:condition>new</g:condition>\n`;
      xml += `      <g:availability>in stock</g:availability>\n`;
      xml += `      <g:price>${priceFormatted}</g:price>\n`;
      xml += `      <g:product_type><![CDATA[${productType}]]></g:product_type>\n`;
      xml += `      <g:custom_label_0>${escapeXml(purposeLabel)}</g:custom_label_0>\n`;
      xml += `      <g:custom_label_1>${escapeXml(p.district || "Kerala")}</g:custom_label_1>\n`;
      xml += `      <g:custom_label_2>${escapeXml(p.bedrooms ? `${p.bedrooms} BHK` : p.property_type || "Property")}</g:custom_label_2>\n`;
      xml += `      <g:custom_label_3>${escapeXml(p.area_sqft ? `${p.area_sqft} sqft` : "")}</g:custom_label_3>\n`;
      xml += `      <g:custom_label_4>${escapeXml(contact)}</g:custom_label_4>\n`;

      // Up to 10 additional images
      for (let i = 1; i < Math.min(p.mediaUrls.length, 10); i++) {
        xml += `      <g:additional_image_link>${escapeXml(p.mediaUrls[i])}</g:additional_image_link>\n`;
      }

      xml += `    </item>\n`;
    }

    xml += `  </channel>\n`;
    xml += `</rss>`;

    res.set("Content-Type", "application/xml; charset=utf-8");
    res.set("Cache-Control", "public, max-age=180");
    res.send(xml);
  } catch (err) {
    console.error("Facebook Marketplace RSS feed error:", err);
    res.status(500).set("Content-Type", "text/plain").send("Error generating feed: " + err.message);
  }
});

/**
 * GET /api/feeds/facebook-marketplace.csv
 * Standard Meta Commerce Manager Product/Catalog CSV Feed
 */
router.get("/facebook-marketplace.csv", async (req, res) => {
  try {
    const properties = await getActivePropertiesWithMedia();

    const headers = [
      "id",
      "title",
      "description",
      "availability",
      "condition",
      "price",
      "link",
      "image_link",
      "brand",
      "product_type",
      "custom_label_0",
      "custom_label_1",
      "custom_label_2",
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""').replace(/\r?\n/g, " ").trim();
      return `"${str}"`;
    };

    const rows = [headers.join(",")];

    for (const p of properties) {
      const isRent = String(p.purpose || "").toLowerCase().includes("rent");
      const purposeLabel = isRent ? "For Rent" : "For Sale";
      const productType = mapMetaPropertyType(p.property_type);
      const primaryImage = p.mediaUrls.length > 0 ? p.mediaUrls[0] : "https://airaproperties.in/images/all-properties.svg";
      const priceVal = Math.max(1, Math.round(Number(p.price) || 0));
      const priceFormatted = `${priceVal}.00 INR`;
      const url = `https://airaproperties.in/property/${p.id}`;

      const row = [
        escapeCsv(`aira_${p.id}`),
        escapeCsv(cleanText(p.title).slice(0, 150)),
        escapeCsv(cleanText(p.description || p.title || "").slice(0, 5000)),
        escapeCsv("in stock"),
        escapeCsv("new"),
        escapeCsv(priceFormatted),
        escapeCsv(url),
        escapeCsv(primaryImage),
        escapeCsv("AiraProperties"),
        escapeCsv(productType),
        escapeCsv(purposeLabel),
        escapeCsv(p.district || "Kerala"),
        escapeCsv(p.bedrooms ? `${p.bedrooms} BHK` : ""),
      ];
      rows.push(row.join(","));
    }

    res.set("Content-Type", "text/csv; charset=utf-8");
    res.set("Content-Disposition", 'attachment; filename="facebook-marketplace.csv"');
    res.set("Cache-Control", "public, max-age=180");
    res.send(rows.join("\n"));
  } catch (err) {
    console.error("Facebook Marketplace CSV feed error:", err);
    res.status(500).send("Error generating CSV: " + err.message);
  }
});

/**
 * GET /api/feeds/status
 */
router.get("/status", async (req, res) => {
  try {
    const [[countRow]] = await pool.query(
      "SELECT COUNT(*) as total FROM properties WHERE status = 'Active'"
    );

    const [syncRow] = await pool.query(
      "SELECT `value` FROM settings WHERE `key` = 'fb_marketplace_auto_sync'"
    );
    const [catalogIdRow] = await pool.query(
      "SELECT `value` FROM settings WHERE `key` = 'facebook_catalog_id'"
    );

    const autoSync = syncRow.length > 0 && (syncRow[0].value === "true" || syncRow[0].value === "1");
    const catalogId = catalogIdRow.length > 0 ? catalogIdRow[0].value : null;

    res.json({
      success: true,
      totalActiveListings: countRow ? countRow.total : 0,
      feedUrlXml: "https://api.airaproperties.in/api/feeds/facebook-marketplace.xml",
      feedUrlCsv: "https://api.airaproperties.in/api/feeds/facebook-marketplace.csv",
      autoSync,
      catalogId,
      instructions: [
        "1. Open Meta Commerce Manager: https://business.facebook.com/commerce",
        "2. Select your Catalogue (Aira Properties Home Listings)",
        "3. Go to Catalogue -> Data Sources -> Add Items -> Data Feed",
        "4. Choose 'Scheduled Feed' and paste: https://api.airaproperties.in/api/feeds/facebook-marketplace.xml",
        "5. Meta will automatically sync all active listings into your Catalogue and Marketplace!",
      ],
    });
  } catch (err) {
    console.error("Feed status error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/feeds/toggle-auto-sync
 */
router.post("/toggle-auto-sync", async (req, res) => {
  try {
    const adminToken = req.headers["x-admin-auth"] || req.headers["authorization"];
    const expected = process.env.ADMIN_SECRET_TOKEN || "KeralaRealtyAdminSecretToken2026";
    if (adminToken !== expected && adminToken !== `Bearer ${expected}`) {
      return res.status(401).json({ error: "Unauthorized admin" });
    }

    const [existing] = await pool.query(
      "SELECT `value` FROM settings WHERE `key` = 'fb_marketplace_auto_sync'"
    );

    let newVal = "1";
    if (existing.length > 0) {
      newVal = (existing[0].value === "1" || existing[0].value === "true") ? "0" : "1";
      await pool.query(
        "UPDATE settings SET `value` = ? WHERE `key` = 'fb_marketplace_auto_sync'",
        [newVal]
      );
    } else {
      await pool.query(
        "INSERT INTO settings (`key`, `value`) VALUES ('fb_marketplace_auto_sync', '1')"
      );
    }

    res.json({
      success: true,
      autoSync: newVal === "1",
      message: newVal === "1" ? "Automated Marketplace sync ENABLED" : "Automated Marketplace sync DISABLED",
    });
  } catch (err) {
    console.error("Toggle auto-sync error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/feeds/push/:id
 */
router.post("/push/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [[p]] = await pool.query(
      `SELECT p.*, u.name as uploader_name, u.phone as uploader_phone
       FROM properties p
       LEFT JOIN users u ON p.owner_id = u.id
       WHERE p.id = ?`,
      [id]
    );

    if (!p) {
      return res.status(404).json({ error: "Property not found" });
    }

    const [mediaRows] = await pool.query(
      `SELECT url FROM property_media WHERE property_id = ? ORDER BY sort_order ASC`,
      [id]
    );
    const mediaUrls = mediaRows.map((m) => getFullMediaUrl(m.url));

    const isRent = String(p.purpose || "").toLowerCase().includes("rent");
    const marketplaceCreateUrl = isRent
      ? "https://www.facebook.com/marketplace/create/rental"
      : "https://www.facebook.com/marketplace/create/property-for-sale";

    const pType = p.property_type || "Property";
    const pPrice = Number(p.price) || 0;
    const formattedPrice = pPrice ? `₹${pPrice.toLocaleString("en-IN")}` : "Price on Request";
    const locationStr = [p.address, p.district, p.state].filter(Boolean).join(", ");
    const contact = p.contact_number || p.whatsapp_number || p.uploader_phone || "+91 9495126132";
    const listingUrl = `https://airaproperties.in/property/${p.id}`;

    const specs = [];
    if (p.bedrooms) specs.push(`${p.bedrooms} BHK`);
    if (p.bathrooms) specs.push(`${p.bathrooms} Bathrooms`);
    if (p.area_sqft) specs.push(`${p.area_sqft} sq.ft`);

    const formattedDescription = [
      p.title,
      `Property Type: ${pType} (${isRent ? "For Rent" : "For Sale"})`,
      `Price: ${formattedPrice}${isRent ? " / month" : ""}`,
      specs.length > 0 ? `Specifications: ${specs.join(" • ")}` : null,
      `Location: ${locationStr}`,
      contact ? `Contact / WhatsApp: ${contact}` : null,
      "",
      p.description ? p.description : null,
      "",
      `View verified listing on Aira Properties:`,
      listingUrl,
    ]
      .filter((line) => line !== null)
      .join("\n");

    res.json({
      success: true,
      marketplaceCreateUrl,
      property: {
        id: p.id,
        title: p.title,
        price: pPrice,
        formattedPrice,
        isRent,
        propertyType: pType,
        bedrooms: p.bedrooms || "",
        bathrooms: p.bathrooms || "",
        areaSqft: p.area_sqft || "",
        location: locationStr,
        district: p.district || "",
        description: formattedDescription,
        listingUrl,
        images: mediaUrls,
      },
    });
  } catch (err) {
    console.error("Push FB Marketplace error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
