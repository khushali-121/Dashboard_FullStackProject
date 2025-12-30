module.exports = function otpEmailTemplate(otp) {
  return `
  <!DOCTYPE html>
  <html>
  <body style="background:#f4f6f8;font-family:Arial;padding:30px;">
    <div style="max-width:600px;margin:auto;background:#fff;border-radius:8px;overflow:hidden;">
      
      <div style="background:#2563eb;color:#fff;padding:20px;text-align:center;">
        <h2>UMS Security</h2>
      </div>

      <div style="padding:30px;color:#333;">
        <p>You requested to reset your password.</p>

        <p style="text-align:center;font-size:28px;font-weight:bold;letter-spacing:6px;color:#2563eb;">
          ${otp}
        </p>

        <p>This OTP is valid for <strong>2 minutes</strong>.</p>

        <p>If you did not request this, please ignore this email.</p>

        <p>— UMS Team</p>
      </div>

      <div style="background:#f1f5f9;text-align:center;padding:10px;font-size:12px;color:#777;">
        © ${new Date().getFullYear()} UMS
      </div>
    </div>
  </body>
  </html>
  `;
};
