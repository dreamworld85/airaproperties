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

// Map Aira property types to Meta Home Listings property_type standard
function mapMetaPropertyType(rawType) {
  if (!rawType) return "other";
  const t = rawType.toLowerCase();
  if (t.includes("apartment") || t.includes("flat")) return "apartment";
  if (t.includes("house") || t.includes("individual")) return "single_family";
  if (t.includes("villa")) return "single_family";
  if (t.includes("land") || t.includes("plot")) return "land";
  if (t.includes("commercial") || t.includes("shop") || t.includes("office")) return "commercial";
  return "other";
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
 * Meta Real Estate / Home Listings XML Feed for Meta Commerce Manager
 * Specification: Meta Home Listings Catalog Feed
 */
router.get("/facebook-marketplace.xml", async (req, res) => {
  try {
    const properties = await getActivePropertiesWithMedia();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<listings>\n`;
    xml += `  <title>Aira Properties Real Estate Marketplace Catalog Feed</title>\n`;
    xml += `  <link rel="self" href="https://api.airaproperties.in/api/feeds/facebook-marketplace.xml"/>\n`;

    for (const p of properties) {
      const isRent = String(p.purpose || "").toLowerCase().includes("rent");
      const availability = isRent ? "for_rent" : "for_sale";
      const listingType = isRent ? "for_rent_by_agent" : "for_sale_by_agent";
      const metaPropType = mapMetaPropertyType(p.property_type);
      const primaryImage = p.mediaUrls.length > 0 ? p.mediaUrls[0] : "";
      const priceNum = Math.round(Number(p.price) || 0);
      const url = `https://airaproperties.in/property/${p.id}`;

      xml += `  <listing>\n`;
      xml += `    <home_listing_id>${p.id}</home_listing_id>\n`;
      xml += `    <name><![CDATA[${p.title}]]></name>\n`;
      xml += `    <description><![CDATA[${(p.description || p.title || "").slice(0, 5000)}]]></description>\n`;
      xml += `    <availability>${availability}</availability>\n`;
      xml += `    <property_type>${metaPropType}</property_type>\n`;
      xml += `    <listing_type>${listingType}</listing_type>\n`;
      xml += `    <address format="simple">\n`;
      xml += `      <component name="addr1"><![CDATA[${p.address || p.district || "Kerala"}]]></component>\n`;
      xml += `      <component name="city"><![CDATA[${p.district || "Kerala"}]]></component>\n`;
      xml += `      <component name="region"><![CDATA[${p.state || "Kerala"}]]></component>\n`;
      xml += `      <component name="country">India</component>\n`;
      xml += `      <component name="postal_code">${p.pincode || "673001"}</component>\n`;
      xml += `    </address>\n`;
      xml += `    <price>${priceNum} INR</price>\n`;
      xml += `    <url>${escapeXml(url)}</url>\n`;

      if (primaryImage) {
        xml += `    <image>\n`;
        xml += `      <url>${escapeXml(primaryImage)}</url>\n`;
        xml += `    </image>\n`;
      }

      // Additional images up to 20
      for (let i = 1; i < Math.min(p.mediaUrls.length, 20); i++) {
        xml += `    <additional_image_link>${escapeXml(p.mediaUrls[i])}</additional_image_link>\n`;
      }

      if (p.bedrooms) {
        xml += `    <num_beds>${Number(p.bedrooms)}</num_beds>\n`;
      }
      if (p.bathrooms) {
        xml += `    <num_baths>${Number(p.bathrooms)}</num_baths>\n`;
      }
      if (p.area_sqft) {
        xml += `    <area_size>${Math.round(Number(p.area_sqft))}</area_size>\n`;
        xml += `    <area_unit>sq_ft</area_unit>\n`;
      }
      if (p.latitude) {
        xml += `    <latitude>${p.latitude}</latitude>\n`;
      }
      if (p.longitude) {
        xml += `    <longitude>${p.longitude}</longitude>\n`;
      }

      xml += `  </listing>\n`;
    }

    xml += `</listings>`;

    res.set("Content-Type", "application/xml; charset=utf-8");
    res.set("Cache-Control", "public, max-age=300"); // 5 min cache
    res.send(xml);
  } catch (err) {
    console.error("Facebook Marketplace XML feed error:", err);
    res.status(500).set("Content-Type", "text/plain").send("Error generating feed: " + err.message);
  }
});

/**
 * GET /api/feeds/facebook-marketplace.csv
 * Meta Real Estate CSV Catalog Feed
 */
router.get("/facebook-marketplace.csv", async (req, res) => {
  try {
    const properties = await getActivePropertiesWithMedia();

    const headers = [
      "home_listing_id",
      "name",
      "description",
      "availability",
      "property_type",
      "listing_type",
      "address.addr1",
      "address.city",
      "address.region",
      "address.country",
      "address.postal_code",
      "price",
      "url",
      "image[0].url",
      "num_beds",
      "num_baths",
      "area_size",
      "area_unit",
      "latitude",
      "longitude",
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""').replace(/\r?\n/g, " ");
      return `"${str}"`;
    };

    const rows = [headers.join(",")];

    for (const p of properties) {
      const isRent = String(p.purpose || "").toLowerCase().includes("rent");
      const availability = isRent ? "for_rent" : "for_sale";
      const listingType = isRent ? "for_rent_by_agent" : "for_sale_by_agent";
      const metaPropType = mapMetaPropertyType(p.property_type);
      const primaryImage = p.mediaUrls.length > 0 ? p.mediaUrls[0] : "";
      const priceStr = `${Math.round(Number(p.price) || 0)} INR`;
      const url = `https://airaproperties.in/property/${p.id}`;

      const row = [
        escapeCsv(p.id),
        escapeCsv(p.title),
        escapeCsv((p.description || p.title || "").slice(0, 5000)),
        escapeCsv(availability),
        escapeCsv(metaPropType),
        escapeCsv(listingType),
        escapeCsv(p.address || p.district || "Kerala"),
        escapeCsv(p.district || "Kerala"),
        escapeCsv(p.state || "Kerala"),
        escapeCsv("India"),
        escapeCsv(p.pincode || "673001"),
        escapeCsv(priceStr),
        escapeCsv(url),
        escapeCsv(primaryImage),
        escapeCsv(p.bedrooms || ""),
        escapeCsv(p.bathrooms || ""),
        escapeCsv(p.area_sqft || ""),
        escapeCsv(p.area_sqft ? "sq_ft" : ""),
        escapeCsv(p.latitude || ""),
        escapeCsv(p.longitude || ""),
      ];
      rows.push(row.join(","));
    }

    res.set("Content-Type", "text/csv; charset=utf-8");
    res.set("Content-Disposition", 'attachment; filename="facebook-marketplace.csv"');
    res.set("Cache-Control", "public, max-age=300");
    res.send(rows.join("\n"));
  } catch (err) {
    console.error("Facebook Marketplace CSV feed error:", err);
    res.status(500).send("Error generating CSV: " + err.message);
  }
});

/**
 * GET /api/feeds/status
 * Check Facebook Marketplace feed status, total listings, and auto-sync state
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
        "2. Select or create your Real Estate Catalog (home_listings)",
        "3. Go to Data Sources -> Add Items -> Data Feed",
        "4. Choose 'Scheduled Feed' and paste: https://api.airaproperties.in/api/feeds/facebook-marketplace.xml",
        "5. Meta will automatically sync all active properties to Facebook Marketplace every hour/day!",
      ],
    });
  } catch (err) {
    console.error("Feed status error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/feeds/toggle-auto-sync
 * Toggle automated marketplace sync setting in settings table
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
 * Prepares complete formatted Facebook Marketplace listing data for 1-click publishing
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

    // Check if Meta Catalog ID & Token are configured for direct Graph API Batch Push
    let directCatalogResult = null;
    const [tokenRow] = await pool.query("SELECT `value` FROM settings WHERE `key` = 'facebook_page_access_token'");
    const [catalogIdRow] = await pool.query("SELECT `value` FROM settings WHERE `key` = 'facebook_catalog_id'");
    const catalogId = catalogIdRow[0]?.value;
    const accessToken = tokenRow[0]?.value;

    if (catalogId && accessToken && mediaUrls.length > 0) {
      try {
        const batchPayload = {
          item_type: "PRODUCT_ITEM",
          requests: [
            {
              method: "CREATE",
              data: {
                id: `aira_property_${p.id}`,
                title: p.title,
                description: formattedDescription,
                price: `${pPrice} INR`,
                link: listingUrl,
                image_link: mediaUrls[0],
                availability: isRent ? "for_rent" : "for_sale",
                brand: "AiraProperties",
                partner_product_location: locationStr,
                partner_attribute_data: {
                  property_type: mapMetaPropertyType(p.property_type),
                  bed_bath: `${p.bedrooms || 1}_${p.bathrooms || 1}`,
                  area_size: `${p.area_sqft || 0}SQFT`,
                },
              },
            },
          ],
        };

        const batchRes = await fetch(
          `https://graph.facebook.com/v21.0/${catalogId}/items_batch`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(batchPayload),
          }
        );
        const batchData = await batchRes.json();
        directCatalogResult = batchData;
      } catch (catErr) {
        console.warn("Direct Meta Catalog push note:", catErr.message);
      }
    }

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
      directCatalogResult,
    });
  } catch (err) {
    console.error("Push FB Marketplace error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
