/**
 * Fast2SMS SMS Utility for AIRA Properties
 * Supports Fast2SMS DLT route with pre-approved template (AIRAPT / 228433)
 * as well as Fast2SMS Smart OTP (dev/otp/send) if FAST2SMS_OTP_ID is configured.
 */

export async function sendOtpSms(phone, otp) {
  const apiKey = process.env.FAST2SMS_API_KEY || "YgjGz8vNbpnye5H6rwIFQ4RdLhBToi3sA0P9VaCOqDmElt2fMWcXNWLUe7T9IlFYhzoSnJqPvsHKjar4";
  const senderId = process.env.FAST2SMS_SENDER_ID || "AIRAPT";
  const dltMessageId = process.env.FAST2SMS_DLT_MESSAGE_ID || "228433";
  const smartOtpId = process.env.FAST2SMS_OTP_ID || null;

  // Extract 10-digit mobile number for Indian SMS
  const digits = String(phone).replace(/\D/g, "");
  const mobile10 = digits.length >= 10 ? digits.slice(-10) : digits;

  if (!mobile10 || mobile10.length !== 10) {
    throw new Error("Please enter a valid 10-digit mobile number");
  }

  console.log(`[SMS OTP] Sending OTP ${otp} to mobile: ${mobile10}`);

  try {
    let response;
    let data;

    if (smartOtpId) {
      // Use Fast2SMS Smart OTP Endpoint
      response = await fetch("https://www.fast2sms.com/dev/otp/send", {
        method: "POST",
        headers: {
          accept: "application/json",
          Authorization: apiKey,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          mobile: mobile10,
          otp_id: smartOtpId,
          otp: String(otp),
          otp_length: String(otp).length,
          otp_expiry: 5,
        }),
      });
      data = await response.json();
    } else {
      // Use Fast2SMS DLT Approved Route
      response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: "dlt",
          sender_id: senderId,
          message: String(dltMessageId),
          variables_values: String(otp),
          numbers: mobile10,
        }),
      });
      data = await response.json();
    }

    console.log("[SMS OTP] Fast2SMS Response:", data);

    const isSuccess = data && (data.return === true || data.status_code === 200 || data.success === true);
    if (!isSuccess) {
      const errMsg = Array.isArray(data?.message) ? data.message.join(", ") : (data?.message || "Failed to send SMS OTP via Fast2SMS");
      console.warn(`[SMS OTP Warning] Fast2SMS API response was not successful: ${errMsg}. Local OTP was: ${otp}`);
      // If production or error is critical, bubble it up; otherwise allow fallback
      return {
        success: false,
        error: errMsg,
        localOtp: otp,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (err) {
    console.error("[SMS OTP Error]:", err);
    throw new Error(err.message || "Failed to send OTP SMS");
  }
}
