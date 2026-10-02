import { pool } from "./db.js";

export async function seedPlans() {
  try {
    const [existing] = await pool.query("SELECT COUNT(*) AS count FROM subscription_plans");
    if (existing[0].count > 0) {
      console.log(`Unified subscription plans catalog already initialized (${existing[0].count} plans). Preserving admin settings.`);
      return;
    }

    console.log("Enforcing unified token & listing slot plans initial seed...");

    const plans = [
      // Normal Users (Buyers / Seekers) -> Unified Plans (Enquiry Tokens + Listing Slots)
      {
        plan_id: "user_starter_pack",
        name: "Starter Pack",
        role: "user",
        plan_type: "combo",
        credits: 10,
        listing_slots: 2,
        enquiry_tokens: 10,
        price: 199.00,
        discount: 0.00,
        duration_months: 0,
        description: "10 Enquiry Tokens + 2 Active Listing Slots. Never expires!",
        features: [
          "10 Direct Owner/Broker Contact Unlocks",
          "2 Active Concurrent Listing Slots",
          "WhatsApp Direct Chat Shortcuts",
          "Permanent Access to Unlocked Listings",
          "100% Reusable Slots (credited back when Sold/Inactive)",
          "Zero Expiry — Tokens & slots valid forever"
        ]
      },
      {
        plan_id: "user_standard_pack",
        name: "Standard Pack",
        role: "user",
        plan_type: "combo",
        credits: 25,
        listing_slots: 5,
        enquiry_tokens: 25,
        price: 399.00,
        discount: 50.00,
        duration_months: 0,
        description: "25 Enquiry Tokens + 5 Active Listing Slots. Most popular choice!",
        features: [
          "25 Direct Owner/Broker Contact Unlocks",
          "5 Active Concurrent Listing Slots",
          "WhatsApp Direct Chat Shortcuts",
          "Permanent Access to Unlocked Listings",
          "100% Reusable Slots (credited back when Sold/Inactive)",
          "Zero Expiry — Valid forever until used",
          "Save ₹50 with package discount"
        ]
      },
      {
        plan_id: "user_premium_pack",
        name: "Premium Pack",
        role: "user",
        plan_type: "combo",
        credits: 60,
        listing_slots: 10,
        enquiry_tokens: 60,
        price: 799.00,
        discount: 150.00,
        duration_months: 0,
        description: "60 Enquiry Tokens + 10 Active Listing Slots. Best value for active seekers & investors.",
        features: [
          "60 Direct Owner/Broker Contact Unlocks",
          "10 Active Concurrent Listing Slots",
          "WhatsApp Direct Chat Shortcuts",
          "Permanent Access to Unlocked Listings",
          "100% Reusable Slots (credited back when Sold/Inactive)",
          "Zero Expiry — Valid forever until used",
          "Priority Customer Support Assistance",
          "Save ₹150 with our biggest discount"
        ]
      },

      // Owners -> Unified Plans (Listing Slots + Enquiry Tokens)
      {
        plan_id: "owner_starter_pack",
        name: "Owner Starter",
        role: "owner",
        plan_type: "combo",
        credits: 5,
        listing_slots: 5,
        enquiry_tokens: 15,
        price: 499.00,
        discount: 0.00,
        duration_months: 0,
        description: "5 Active Listing Slots + 15 Enquiry Tokens. Ideal for individual owners.",
        features: [
          "5 Active Concurrent Listing Slots",
          "15 Direct Contact Unlock Tokens",
          "100% Reusable Slots (credited back when Sold or Inactive)",
          "Direct Owner Phone & WhatsApp Leads",
          "Zero Expiry — Valid forever until used"
        ]
      },
      {
        plan_id: "owner_growth_pack",
        name: "Owner Growth",
        role: "owner",
        plan_type: "combo",
        credits: 10,
        listing_slots: 10,
        enquiry_tokens: 30,
        price: 899.00,
        discount: 100.00,
        duration_months: 0,
        description: "10 Active Listing Slots + 30 Enquiry Tokens. For owners with multiple properties.",
        features: [
          "10 Active Concurrent Listing Slots",
          "30 Direct Contact Unlock Tokens",
          "100% Reusable Slots (credited back when Sold or Inactive)",
          "Direct Owner Phone & WhatsApp Leads",
          "Priority Search Listing Visibility",
          "Save ₹100 with package discount"
        ]
      },
      {
        plan_id: "owner_portfolio_pack",
        name: "Owner Portfolio",
        role: "owner",
        plan_type: "combo",
        credits: 25,
        listing_slots: 25,
        enquiry_tokens: 60,
        price: 1699.00,
        discount: 200.00,
        duration_months: 0,
        description: "25 Active Listing Slots + 60 Enquiry Tokens. Complete portfolio coverage.",
        features: [
          "25 Active Concurrent Listing Slots",
          "60 Direct Contact Unlock Tokens",
          "100% Reusable Slots (credited back when Sold or Inactive)",
          "Direct Owner Phone & WhatsApp Leads",
          "Priority Search Placement Across Feed",
          "Save ₹200 with best portfolio discount"
        ]
      },

      // Brokers -> Unified Plans (Listing Slots + Enquiry Tokens)
      {
        plan_id: "broker_standard_pack",
        name: "Broker Standard",
        role: "broker",
        plan_type: "combo",
        credits: 10,
        listing_slots: 10,
        enquiry_tokens: 35,
        price: 899.00,
        discount: 50.00,
        duration_months: 0,
        description: "10 Active Listing Slots + 35 Enquiry Tokens. Essential broker toolkit.",
        features: [
          "10 Active Concurrent Listing Slots",
          "35 Direct Client Phone Unlock Tokens",
          "100% Reusable Slots (credited back when Sold or Inactive)",
          "Direct Broker Contact & WhatsApp Leads",
          "Verified Broker Badge on Listings",
          "Zero Expiration on Slots & Tokens"
        ]
      },
      {
        plan_id: "broker_pro_pack",
        name: "Broker Pro",
        role: "broker",
        plan_type: "combo",
        credits: 25,
        listing_slots: 25,
        enquiry_tokens: 80,
        price: 1699.00,
        discount: 150.00,
        duration_months: 0,
        description: "25 Active Listing Slots + 80 Enquiry Tokens. High-volume broker deals.",
        features: [
          "25 Active Concurrent Listing Slots",
          "80 Direct Client Phone Unlock Tokens",
          "100% Reusable Slots (credited back when Sold or Inactive)",
          "Direct Broker Contact & WhatsApp Leads",
          "Priority Listing Placement in Search",
          "Save ₹150 with volume savings"
        ]
      },
      {
        plan_id: "broker_enterprise_pack",
        name: "Broker Enterprise",
        role: "broker",
        plan_type: "combo",
        credits: 50,
        listing_slots: 50,
        enquiry_tokens: 150,
        price: 2899.00,
        discount: 300.00,
        duration_months: 0,
        description: "50 Active Listing Slots + 150 Enquiry Tokens. Maximum power for independent brokers.",
        features: [
          "50 Active Concurrent Listing Slots",
          "150 Direct Client Phone Unlock Tokens",
          "100% Reusable Slots (credited back when Sold or Inactive)",
          "Direct Broker Contact & WhatsApp Leads",
          "Priority Search Ranking & Top Feeds",
          "Save ₹300 with enterprise discount"
        ]
      },

      // Agencies -> Unified Plans (Listing Slots + Enquiry Tokens)
      {
        plan_id: "agency_corporate_pack",
        name: "Agency Corporate",
        role: "agency",
        plan_type: "combo",
        credits: 25,
        listing_slots: 25,
        enquiry_tokens: 100,
        price: 2499.00,
        discount: 200.00,
        duration_months: 0,
        description: "25 Active Listing Slots + 100 Enquiry Tokens. Full agency brand exposure.",
        features: [
          "25 Active Concurrent Listing Slots",
          "100 Direct Client Phone Unlock Tokens",
          "100% Reusable Slots (credited back when Sold or Inactive)",
          "Agency Corporate Branding & Logo on Listings",
          "Dedicated Agency Profile Page",
          "Zero Expiration on Slots & Tokens"
        ]
      },
      {
        plan_id: "agency_business_pack",
        name: "Agency Business",
        role: "agency",
        plan_type: "combo",
        credits: 50,
        listing_slots: 50,
        enquiry_tokens: 250,
        price: 4499.00,
        discount: 400.00,
        duration_months: 0,
        description: "50 Active Listing Slots + 250 Enquiry Tokens. For mid-sized real estate firms.",
        features: [
          "50 Active Concurrent Listing Slots",
          "250 Direct Client Phone Unlock Tokens",
          "100% Reusable Slots (credited back when Sold or Inactive)",
          "Agency Corporate Branding & Logo on Listings",
          "Dedicated Agency Profile Page",
          "Priority Search Placement Across Kerala",
          "Save ₹400 with business package"
        ]
      },
      {
        plan_id: "agency_dominator_pack",
        name: "Agency Dominator",
        role: "agency",
        plan_type: "combo",
        credits: 100,
        listing_slots: 100,
        enquiry_tokens: 500,
        price: 7499.00,
        discount: 700.00,
        duration_months: 0,
        description: "100 Active Listing Slots + 500 Enquiry Tokens. Complete market domination package.",
        features: [
          "100 Active Concurrent Listing Slots",
          "500 Direct Client Phone Unlock Tokens",
          "100% Reusable Slots (credited back when Sold or Inactive)",
          "Agency Corporate Branding & Logo on Listings",
          "Dedicated Agency Profile Page",
          "Highest Priority Search Placement Across Kerala",
          "VIP Account Manager Support",
          "Save ₹700 with dominator package"
        ]
      },

      // Builders & Developers -> Showcase & Project Packages
      {
        plan_id: "builder_launchpad",
        name: "Builder Launchpad",
        role: "builder",
        plan_type: "combo",
        credits: 5,
        listing_slots: 10,
        enquiry_tokens: 150,
        price: 9999.00,
        discount: 1000.00,
        duration_months: 12,
        description: "10 Project Units + 150 High-Intent Buyer Leads. Ideal for boutique builders.",
        features: [
          "Up to 10 Active Project Units / Layouts",
          "150 Verified High-Intent Buyer Leads",
          "Dedicated Builder Microsite Page",
          "Direct Inquiries to Builder WhatsApp & Email",
          "RERA Verification Badge on Projects",
          "Brochure Download & Floor Plan Showcase",
          "1 Year Validity with Dedicated Support"
        ]
      },
      {
        plan_id: "builder_elite",
        name: "Builder Elite Showcase",
        role: "builder",
        plan_type: "combo",
        credits: 15,
        listing_slots: 25,
        enquiry_tokens: 400,
        price: 24999.00,
        discount: 3000.00,
        duration_months: 12,
        description: "25 Project Units + 400 Buyer Leads + Featured Developer Spotlight across Kerala.",
        features: [
          "Up to 25 Active Project Units / Towers",
          "400 Verified High-Intent Buyer Leads",
          "Prominent Developer Spotlight on Homepage & Search",
          "Custom Branded Builder Microsite with Video Walkthroughs",
          "Direct Lead Capture CRM Integration",
          "Priority Search Ranking Across Kerala",
          "Quarterly Investor Email & Push Notification Spotlight",
          "Dedicated Key Account Manager"
        ]
      },
      {
        plan_id: "builder_enterprise",
        name: "Builder Enterprise Conglomerate",
        role: "builder",
        plan_type: "combo",
        credits: 50,
        listing_slots: 100,
        enquiry_tokens: 1200,
        price: 49999.00,
        discount: 5000.00,
        duration_months: 12,
        description: "100 Units + 1,200 High-Intent Leads + Full Platform Domination & Exclusive Banners.",
        features: [
          "100 Active Units Across Multiple Ongoing Projects",
          "1,200 Verified High-Intent Buyer Leads",
          "Permanent Top-Tier Developer Banner Placement",
          "Exclusive Full-Featured Microsite with Custom Domain Options",
          "Unlimited Floor Plan & 3D Walkthrough Embeds",
          "High-Priority NRI Investor Blast Campaigns",
          "Zero Expiration on Unused Lead Tokens",
          "24/7 VIP Executive Relationship Manager"
        ]
      }
    ];

    for (const p of plans) {
      await pool.query(
        `INSERT INTO subscription_plans 
         (plan_id, name, role, plan_type, credits, listing_slots, enquiry_tokens, price, discount, duration_months, description, features)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.plan_id,
          p.name,
          p.role,
          p.plan_type,
          p.credits,
          p.listing_slots,
          p.enquiry_tokens,
          p.price,
          p.discount,
          p.duration_months,
          p.description,
          JSON.stringify(p.features)
        ]
      );
    }

    console.log("Unified token & listing slot plans catalog successfully synchronized (12 combo packages).");
  } catch (err) {
    console.error("Error seeding unified subscription plans:", err.message);
  }
}
