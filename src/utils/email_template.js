// src/utils/emailTemplates.js
/**
 * Returns an HTML template string for OTP emails.
 * @param {Object} params
 * @param {string} [params.name] - recipient display name (optional)
 * @param {string} params.otp - OTP string (e.g. "123456")
 * @param {number} [params.expiryMinutes=10] - minutes until expiry
 */
function otpHtmlTemplate({ name = "", otp, expiryMinutes = 10 }) {
  // Use only first name if full name is provided
  const firstName = name.trim().split(/\s+/)[0] || "";
  const greetingName = firstName ? `Hi ${escapeHtml(firstName)},` : "Hello,";

  // Basic HTML escaping helper
  function escapeHtml(unsafe) {
    if (!unsafe && unsafe !== 0) return "";
    return String(unsafe)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  return `
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your OTP Code</title>
  </head>
  <body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#f6f9fc;color:#111827;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:24px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
            <tr>
              <td style="padding:32px;">
                <h2 style="margin:0 0 16px 0;color:#0b2e59;font-size:20px;font-weight:600;">${greetingName}</h2>
                
                <p style="margin:0 0 24px 0;font-size:14px;color:#374151;">
                  Use the following One-Time Password (OTP) to complete your verification. 
                  This code will expire in <strong>${expiryMinutes} minute${expiryMinutes > 1 ? "s" : ""}</strong>.
                </p>

                <div style="margin:24px 0;padding:18px;background:#f1f5f9;border-radius:6px;text-align:center;display:inline-block;min-width:220px;">
                  <span style="display:block;font-size:30px;letter-spacing:6px;font-weight:700;color:#111827;">${escapeHtml(otp)}</span>
                </div>

                <p style="margin:24px 0 0 0;color:#6b7280;font-size:13px;line-height:1.5;">
                  Please do not share this code with anyone.
                </p>

                <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;" />

                <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
                  Sent by ${escapeHtml(process.env.APP_NAME || "Daftarkhwan")}.<br />
                  &copy; ${new Date().getFullYear()} All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

module.exports = { otpHtmlTemplate };
