import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({ override: true });

export async function sendOtpEmail(toEmail, otpName, otpCode) {
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = Number(process.env.SMTP_PORT) || 465;
  const smtpSecure = process.env.SMTP_SECURE !== "false"; // true for 465, false for 587
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER || "";
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || "";
  const fromAddress = process.env.SMTP_FROM_EMAIL || smtpUser || "no-reply@airaproperties.in";

  console.log(`[OTP Request] Generated OTP for ${toEmail}: ${otpCode}`);

  if (!smtpUser || !smtpPass) {
    console.warn("[Mailer] SMTP_USER or SMTP_PASS not set in environment. Email simulated in console.");
    return { success: true, simulated: true };
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const mailOptions = {
    from: `"Sparrows Real Estate" <${fromAddress}>`,
    to: toEmail,
    subject: "Sparrows - Password Reset OTP Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #FAF8F3;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #0F3D3E; margin: 0;">Sparrows Real Estate</h2>
          <p style="color: #6B7A78; font-size: 14px;">Password Reset Request</p>
        </div>
        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #E8F0EA;">
          <p style="color: #22302E; font-size: 15px; margin-top: 0;">Hello <strong>${otpName || "User"}</strong>,</p>
          <p style="color: #22302E; font-size: 14px;">Use the following 6-digit OTP code to reset your account password:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1B5E4F; background: #E8F0EA; padding: 12px 24px; border-radius: 8px; display: inline-block; margin: 16px 0;">
            ${otpCode}
          </div>
          <p style="color: #6B7A78; font-size: 13px; margin-bottom: 0;">This OTP code will expire in <strong>15 minutes</strong>. Do not share this code with anyone.</p>
        </div>
        <p style="text-align: center; color: #6B7A78; font-size: 12px; margin-top: 20px;">If you did not request a password reset, please ignore this email.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Mailer] OTP email successfully sent to ${toEmail}. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error("[Mailer] Failed to send email via SMTP:", err);
    throw err;
  }
}

export async function sendPropertyRequestEmail(requestData) {
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = Number(process.env.SMTP_PORT) || 465;
  const smtpSecure = process.env.SMTP_SECURE !== "false";
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER || "";
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || "";
  const fromAddress = process.env.SMTP_FROM_EMAIL || smtpUser || "no-reply@airaproperties.in";
  const toEmail = "airapropertiesone@gmail.com";

  if (!smtpUser || !smtpPass) {
    console.warn("[Mailer] SMTP credentials not set. Simulating property request email to:", toEmail);
    return { success: true, simulated: true };
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

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
  } = requestData;

  const mailOptions = {
    from: `"Aira Properties" <${fromAddress}>`,
    to: toEmail,
    subject: `New Property Request: ${request_type || "Enquiry"} - ${full_name} (${preferred_location})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #f8fafc;">
        <div style="text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #0F5B5C;">
          <h2 style="color: #0F5B5C; margin: 0; font-size: 22px;">Aira Properties</h2>
          <p style="color: #64748b; font-size: 14px; margin: 4px 0 0 0;">New Property Request Received</p>
        </div>

        <div style="background-color: #ffffff; padding: 20px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
          <h3 style="color: #1e293b; font-size: 16px; margin: 0 0 12px 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
            👤 Contact Details
          </h3>
          <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; width: 150px;"><strong>Full Name:</strong></td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${full_name || ""}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;"><strong>Phone:</strong></td>
              <td style="padding: 6px 0; color: #0f172a;"><a href="tel:${phone}" style="color: #0F5B5C; text-decoration: none; font-weight: bold;">${phone || ""}</a></td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;"><strong>Email:</strong></td>
              <td style="padding: 6px 0; color: #0f172a;">${email || "Not provided"}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #ffffff; padding: 20px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
          <h3 style="color: #1e293b; font-size: 16px; margin: 0 0 12px 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
            🏡 Property Requirements
          </h3>
          <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; width: 150px;"><strong>Request Type:</strong></td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${request_type || "-"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;"><strong>Property Type:</strong></td>
              <td style="padding: 6px 0; color: #0f172a;">${property_type || "-"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;"><strong>Preferred Location:</strong></td>
              <td style="padding: 6px 0; color: #0F5B5C; font-weight: bold;">${preferred_location || "-"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;"><strong>Bedrooms / Rooms:</strong></td>
              <td style="padding: 6px 0; color: #0f172a;">${bedrooms || "Not specified"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;"><strong>Budget Range:</strong></td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${budget_range || "-"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;"><strong>Move-in / Service Date:</strong></td>
              <td style="padding: 6px 0; color: #0f172a;">${move_in_date || "Flexible / Not specified"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;"><strong>Furnished:</strong></td>
              <td style="padding: 6px 0; color: #0f172a;">${furnished || "-"}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #ffffff; padding: 20px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
          <h3 style="color: #1e293b; font-size: 16px; margin: 0 0 12px 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
            📝 Details & Requirements
          </h3>
          <p style="color: #334155; font-size: 14px; line-height: 1.5; margin: 0 0 12px 0; white-space: pre-line;">
            <strong>What is needed:</strong><br/>
            ${description || "-"}
          </p>
          ${special_requirements ? `
            <p style="color: #334155; font-size: 14px; line-height: 1.5; margin: 0; white-space: pre-line;">
              <strong>Special Requirements:</strong><br/>
              ${special_requirements}
            </p>
          ` : ""}
        </div>

        <div style="background-color: #ffffff; padding: 20px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
          <h3 style="color: #1e293b; font-size: 16px; margin: 0 0 12px 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
            📞 Contact Preference
          </h3>
          <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; width: 150px;"><strong>Preferred Mode:</strong></td>
              <td style="padding: 6px 0; color: #0f172a;">${contact_preference || "Any"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;"><strong>Best Time:</strong></td>
              <td style="padding: 6px 0; color: #0f172a;">${best_time_to_contact || "Anytime"}</td>
            </tr>
          </table>
        </div>

        <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px;">
          This email was generated automatically by Aira Properties (airaproperties.in).
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Mailer] Property request email successfully sent to ${toEmail}. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error("[Mailer] Failed to send property request email:", err);
    return { success: false, error: err.message };
  }
}
