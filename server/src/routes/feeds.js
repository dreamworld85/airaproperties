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

// District / City coordinate & region lookup for Meta Commerce Manager location compliance
const LOCATION_FALLBACKS = {
  "bengaluru rural": { lat: 13.2846, lng: 77.6078, region: "Karnataka", postalCode: "562110" },
  "bangalore rural": { lat: 13.2846, lng: 77.6078, region: "Karnataka", postalCode: "562110" },
  "bengaluru": { lat: 12.9716, lng: 77.5946, region: "Karnataka", postalCode: "560001" },
  "bangalore": { lat: 12.9716, lng: 77.5946, region: "Karnataka", postalCode: "560001" },
  "ramanagara": { lat: 12.7209, lng: 77.2799, region: "Karnataka", postalCode: "562159" },
  "mysuru": { lat: 12.2958, lng: 76.6394, region: "Karnataka", postalCode: "570001" },
  "mysore": { lat: 12.2958, lng: 76.6394, region: "Karnataka", postalCode: "570001" },
  "mandya": { lat: 12.5218, lng: 76.8951, region: "Karnataka", postalCode: "571401" },
  "tumakuru": { lat: 13.3379, lng: 77.1173, region: "Karnataka", postalCode: "572101" },
  "kodagu": { lat: 12.3375, lng: 75.8069, region: "Karnataka", postalCode: "571201" },
  "hassan": { lat: 13.0033, lng: 76.1004, region: "Karnataka", postalCode: "573201" },
  "mangaluru": { lat: 12.9141, lng: 74.856, region: "Karnataka", postalCode: "575001" },
  "wayanad": { lat: 11.6854, lng: 76.132, region: "Kerala", postalCode: "673121" },
  "ernakulam": { lat: 9.9816, lng: 76.2999, region: "Kerala", postalCode: "682011" },
  "kochi": { lat: 9.9312, lng: 76.2673, region: "Kerala", postalCode: "682001" },
  "kozhikode": { lat: 11.2588, lng: 75.7804, region: "Kerala", postalCode: "673001" },
  "calicut": { lat: 11.2588, lng: 75.7804, region: "Kerala", postalCode: "673001" },
  "thrissur": { lat: 10.5276, lng: 76.2144, region: "Kerala", postalCode: "680001" },
  "thiruvananthapuram": { lat: 8.5241, lng: 76.9366, region: "Kerala", postalCode: "695001" },
  "trivandrum": { lat: 8.5241, lng: 76.9366, region: "Kerala", postalCode: "695001" },
  "kannur": { lat: 11.8745, lng: 75.3704, region: "Kerala", postalCode: "670001" },
  "kollam": { lat: 8.8932, lng: 76.6141, region: "Kerala", postalCode: "691001" },
  "palakkad": { lat: 10.7867, lng: 76.6548, region: "Kerala", postalCode: "678001" },
  "malappuram": { lat: 11.051, lng: 76.0711, region: "Kerala", postalCode: "676505" },
  "kottayam": { lat: 9.5916, lng: 76.5222, region: "Kerala", postalCode: "686001" },
  "alappuzha": { lat: 9.4981, lng: 76.3388, region: "Kerala", postalCode: "688001" },
  "idukki": { lat: 9.9189, lng: 77.1025, region: "Kerala", postalCode: "685602" },
  "pathanamthitta": { lat: 9.2648, lng: 76.787, region: "Kerala", postalCode: "689645" },
  "kasaragod": { lat: 12.4996, lng: 74.9869, region: "Kerala", postalCode: "671121" },
  "karnataka": { lat: 12.9716, lng: 77.5946, region: "Karnataka", postalCode: "560001" },
  "kerala": { lat: 10.8505, lng: 76.2711, region: "Kerala", postalCode: "682001" },
};

// Resolve complete, Meta-compliant location data (coordinates, radius, structured address)
function resolveMetaLocation(p) {
  const rawLat = Number(p.latitude);
  const rawLng = Number(p.longitude);
  const hasValidCoords =
    Number.isFinite(rawLat) &&
    Number.isFinite(rawLng) &&
    rawLat !== 0 &&
    rawLng !== 0 &&
    Math.abs(rawLat) <= 90 &&
    Math.abs(rawLng) <= 180;

  const searchText = [p.district, p.address, p.state, p.title]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  let matchedFallback = null;
  for (const [key, coords] of Object.entries(LOCATION_FALLBACKS)) {
    if (searchText.includes(key)) {
      matchedFallback = coords;
      break;
    }
  }
  if (!matchedFallback) {
    matchedFallback = LOCATION_FALLBACKS.kerala;
  }

  const lat = hasValidCoords ? rawLat : matchedFallback.lat;
  const lng = hasValidCoords ? rawLng : matchedFallback.lng;
  const city = cleanText(p.district || matchedFallback.region || "Kerala");
  const region = cleanText(p.state || matchedFallback.region || "Kerala");
  const streetAddress = cleanText(p.address || city);

  // Extract 6-digit Indian PIN code from address if present, else fallback
  const pinMatch = String(p.address || "").match(/\b([1-9]\d{5})\b/);
  const postalCode = pinMatch ? pinMatch[1] : matchedFallback.postalCode;

  const fullAddress =
    [streetAddress, city !== streetAddress ? city : "", region, postalCode, "India"]
      .filter(Boolean)
      .join(", ");

  return {
    lat: Number(lat.toFixed(6)),
    lng: Number(lng.toFixed(6)),
    radiusKm: 25,
    streetAddress,
    city,
    region,
    postalCode,
    country: "IN",
    fullAddress,
  };
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
      const metaLoc = resolveMetaLocation(p);
      const location = metaLoc.fullAddress;
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
      // Complete Meta Commerce Manager location formatting (center point + radius + structured address + postcode)
      xml += `      <g:availability_circle_origin>\n`;
      xml += `        <g:latitude>${metaLoc.lat}</g:latitude>\n`;
      xml += `        <g:longitude>${metaLoc.lng}</g:longitude>\n`;
      xml += `      </g:availability_circle_origin>\n`;
      xml += `      <g:availability_circle_radius>${metaLoc.radiusKm}</g:availability_circle_radius>\n`;
      xml += `      <g:availability_circle_radius_unit>km</g:availability_circle_radius_unit>\n`;
      xml += `      <g:latitude>${metaLoc.lat}</g:latitude>\n`;
      xml += `      <g:longitude>${metaLoc.lng}</g:longitude>\n`;
      xml += `      <g:address><![CDATA[${metaLoc.fullAddress}]]></g:address>\n`;
      xml += `      <g:street_address><![CDATA[${metaLoc.streetAddress}]]></g:street_address>\n`;
      xml += `      <g:city><![CDATA[${metaLoc.city}]]></g:city>\n`;
      xml += `      <g:region><![CDATA[${metaLoc.region}]]></g:region>\n`;
      xml += `      <g:postal_code>${escapeXml(metaLoc.postalCode)}</g:postal_code>\n`;
      xml += `      <g:country>${metaLoc.country}</g:country>\n`;
      xml += `      <g:custom_label_0>${escapeXml(purposeLabel)}</g:custom_label_0>\n`;
      xml += `      <g:custom_label_1>${escapeXml(metaLoc.city)}</g:custom_label_1>\n`;
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
      "address",
      "city",
      "region",
      "postal_code",
      "country",
      "latitude",
      "longitude",
      "availability_circle_origin.latitude",
      "availability_circle_origin.longitude",
      "availability_circle_radius",
      "availability_circle_radius_unit",
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
      const metaLoc = resolveMetaLocation(p);

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
        escapeCsv(metaLoc.fullAddress),
        escapeCsv(metaLoc.city),
        escapeCsv(metaLoc.region),
        escapeCsv(metaLoc.postalCode),
        escapeCsv(metaLoc.country),
        escapeCsv(metaLoc.lat),
        escapeCsv(metaLoc.lng),
        escapeCsv(metaLoc.lat),
        escapeCsv(metaLoc.lng),
        escapeCsv(metaLoc.radiusKm),
        escapeCsv("km"),
        escapeCsv(purposeLabel),
        escapeCsv(metaLoc.city),
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
