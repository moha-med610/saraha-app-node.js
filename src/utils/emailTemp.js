export const otpEmailTemplate = ({ userName, otpCode, expiryMinutes }) => {
  return `
<!DOCTYPE html>
<html lang="ar">
<head>
  <meta charset="UTF-8" />
</head>
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial; direction:rtl; align="center">
  <table width="100%">
    <tr>
      <td align="center" style="padding:40px 0;">
        <table width="600" style="background:#fff; border-radius:8px;">
          <tr>
            <td style="background:#0d6efd; padding:20px; color:#fff; text-align:center;">
              <h2>رمز التحقق (OTP)</h2>
            </td>
          </tr>
          <tr>
            <td style="padding:30px; color:#333;">
              <p>مرحبًا <strong>${userName}</strong>،</p>
              <p>رمز التحقق الخاص بك هو:</p>

              <div style="text-align:center; margin:20px 0;">
                <span style="font-size:24px; letter-spacing:4px; font-weight:bold;">
                  ${otpCode}
                </span>
              </div>

              <p>الرمز صالح لمدة <strong>${expiryMinutes} دقائق</strong>.</p>
              <p style="color:#777;">إذا لم تطلب هذا الرمز، تجاهل الرسالة.</p>
            </td>
          </tr>
          <tr>
            <td style="background:#f1f1f1; padding:15px; text-align:center; font-size:12px;">
              © ${new Date().getFullYear()} Your Company
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};

export const resetPasswordEmailTemplate = ({ resetLink, userName, email }) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset Your Password</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f4f5;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .wrapper {
      width: 100%;
      padding: 40px 16px;
      box-sizing: border-box;
    }
    .container {
      max-width: 560px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e4e4e7;
    }
    .header {
      background: #1a1a2e;
      padding: 24px 32px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .logo-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #4f46e5;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .logo-name {
      color: #ffffff;
      font-size: 16px;
      font-weight: 500;
      letter-spacing: 0.3px;
    }
    .body {
      padding: 32px 32px 16px;
    }
    .meta {
      font-size: 13px;
      color: #71717a;
      margin: 0 0 16px;
    }
    .meta strong {
      color: #18181b;
      font-weight: 500;
    }
    .divider {
      border: none;
      border-top: 1px solid #e4e4e7;
      margin: 0 0 24px;
    }
    .greeting {
      font-size: 14px;
      color: #71717a;
      margin: 0 0 12px;
    }
    .greeting strong {
      color: #18181b;
    }
    .message {
      font-size: 14px;
      color: #71717a;
      margin: 0 0 28px;
      line-height: 1.6;
    }
    .cta-wrapper {
      text-align: center;
      margin: 0 0 28px;
    }
    .cta-button {
      display: inline-block;
      background: #4f46e5;
      color: #ffffff;
      padding: 13px 36px;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 500;
      text-decoration: none;
      letter-spacing: 0.2px;
    }
    .link-box {
      background: #f4f4f5;
      border-radius: 8px;
      padding: 14px 18px;
      margin: 0 0 20px;
    }
    .link-label {
      font-size: 11px;
      font-weight: 500;
      color: #71717a;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      margin: 0 0 6px;
    }
    .link-url {
      font-size: 12px;
      color: #4f46e5;
      word-break: break-all;
      font-family: 'Courier New', Courier, monospace;
      margin: 0;
    }
    .warning {
      border-left: 2px solid #f59e0b;
      background: #fef3c7;
      padding: 12px 16px;
      border-radius: 0 8px 8px 0;
      margin-bottom: 24px;
    }
    .warning p {
      margin: 0;
      font-size: 13px;
      color: #92400e;
      line-height: 1.5;
    }
    .security {
      font-size: 13px;
      color: #71717a;
      margin: 0 0 24px;
      line-height: 1.6;
    }
    .security strong {
      color: #18181b;
    }
    .footer {
      border-top: 1px solid #e4e4e7;
      padding: 20px 32px;
      text-align: center;
    }
    .footer p {
      margin: 0;
      font-size: 12px;
      color: #71717a;
    }
    .footer a {
      color: #71717a;
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }
    .footer .address {
      margin-top: 6px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">

      <!-- Header -->
      <div class="header">
        <div class="logo-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <span class="logo-name">Saraha App</span>
      </div>

      <!-- Body -->
      <div class="body">

        <p class="meta">
          To: <strong>${email}</strong>
          &nbsp;&nbsp;|&nbsp;&nbsp;
          Subject: <strong>Reset your password</strong>
        </p>

        <hr class="divider">

        <p class="greeting">Hi <strong>${userName}</strong>,</p>

        <p class="message">
          We received a request to reset the password for your account.
          Click the button below to choose a new password.
        </p>

        <!-- CTA Button -->
        <div class="cta-wrapper">
          <a href="${resetLink}" class="cta-button">Reset my password</a>
        </div>

        <!-- Fallback Link -->
        <div class="link-box">
          <p class="link-label">Or copy this link</p>
          <p class="link-url">${resetLink}</p>
        </div>

        <!-- Warning -->
        <div class="warning">
          <p>
            This link expires in <strong>10 minutes</strong>. If you did not request a
            password reset, you can safely ignore this email.
          </p>
        </div>

      </div>

      <!-- Footer -->
      <div class="footer">
        <p>
          © ${new Date().getFullYear()} Saraha App. All rights reserved.;
        </p>
      </div>

    </div>
  </div>
</body>
</html>`;
};
