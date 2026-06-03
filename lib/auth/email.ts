import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendMagicLink(to: string, token: string): Promise<void> {
  const baseUrl = process.env.APP_URL ?? 'http://localhost:3000'
  const link = `${baseUrl}/api/auth/verify?token=${token}`

  if (process.env.NODE_ENV !== 'production') {
    console.log(`\n[MAGIC LINK] ${link}\n`)
  }

  await transporter.sendMail({
    from: `"IRaven" <${process.env.SMTP_FROM}>`,
    to,
    subject: 'Your IRaven admin access link',
    text: `Sign in to IRaven Admin\n\nClick the link below to sign in (expires in 15 minutes):\n\n${link}\n\nIf you did not request this link, ignore this email.`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>IRaven Admin Access</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
    body { margin:0; padding:0; }
    .wordmark-gradient {
      background: linear-gradient(100deg, #4be1ec 0%, #a7d6ff 38%, #cb5eee 78%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#050710;font-family:'Space Grotesk',ui-sans-serif,system-ui,-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;">

  <!-- bg wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#050710" style="background:#050710;">
    <tr>
      <td align="center" style="padding:48px 20px 56px;">

        <!-- content column -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;">

          <!-- ── Brand lockup ── -->
          <tr>
            <td align="center" style="padding-bottom:36px;">
              <!-- Full raven SVG (paths from raven.svg, re-colored inline for email) -->
              <svg width="72" height="72" viewBox="0 0 430 430" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto 16px;">
                <defs>
                  <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#4be1ec"/>
                    <stop offset="52%" stop-color="#7db8f0"/>
                    <stop offset="100%" stop-color="#cb5eee"/>
                  </linearGradient>
                  <radialGradient id="glow-c" cx="38%" cy="38%" r="50%">
                    <stop offset="0%" stop-color="#4be1ec" stop-opacity="0.35"/>
                    <stop offset="100%" stop-color="#4be1ec" stop-opacity="0"/>
                  </radialGradient>
                  <radialGradient id="glow-v" cx="62%" cy="55%" r="46%">
                    <stop offset="0%" stop-color="#cb5eee" stop-opacity="0.28"/>
                    <stop offset="100%" stop-color="#cb5eee" stop-opacity="0"/>
                  </radialGradient>
                </defs>
                <!-- Ambient glow behind the raven -->
                <ellipse cx="185" cy="200" rx="200" ry="180" fill="url(#glow-c)"/>
                <ellipse cx="310" cy="240" rx="170" ry="160" fill="url(#glow-v)"/>
                <!-- Beak / detail — teal, from raven.svg .secondary paths -->
                <path fill="none" stroke="#08A88A" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"
                  d="M337.671 107.184 408 95.387l-12.371-16.018a30 30 0 0 0-21.727-11.594l-45.276-3.049"/>
                <!-- Feet / claws — teal -->
                <path fill="none" stroke="#08A88A" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"
                  transform="translate(229.66 354.762)"
                  d="M-18.232-17.262-32.16-2.924l22.5 23.162h39.32"/>
                <path fill="none" stroke="#08A88A" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"
                  transform="translate(262.16 349.511)"
                  d="m-2.16-20.12-22.5 22.805 22.5 22.804h24.32"/>
                <!-- Main body — brand gradient, from raven.svg .primary paths -->
                <path fill="none" stroke="url(#rg)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"
                  d="M338.31 231.284c7.391 1.955 15.528 1.103 22.672-3.022l-20.934-36.387v.032m-.052-1.11c7.285 3.594 17.442 5.812 28.978-.543l-34.2-59.509m4.272-39.76c-.841-23.183-20.845-41.504-44.485-39.735-18.656 1.396-34.061 15.124-37.588 33.497l-21.757 80.455m99.386-34.485 4.407-35.884a42 42 0 0 0 .037-3.848m-103.83 74.217L22.001 378.417l29.699 4.242a40 40 0 0 0 33.941-11.313l16.734-16.735 139.18-25.414c50.285-9.182 88.444-48.903 96.755-97.913"/>
                <!-- Wings / feathers — brand gradient -->
                <path fill="none" stroke="url(#rg)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"
                  transform="translate(189.672 269.945)"
                  d="m80.676-26.741-40.63 40.63a40 40 0 0 1-43.785 8.59l-15.048-6.326M28.29-30.925l-50.132 50.133a40 40 0 0 1-43.786 8.59l-11.526-4.845"/>
              </svg>
              <!-- Wordmark -->
              <div style="font-family:'Space Grotesk',ui-sans-serif,system-ui,sans-serif;font-size:22px;font-weight:700;letter-spacing:-0.025em;">
                <span class="wordmark-gradient" style="color:#4be1ec;">IR</span><span style="color:#eef2fb;">aven</span>
              </div>
            </td>
          </tr>

          <!-- ── Main panel ── -->
          <tr>
            <td bgcolor="#0b0f1d" style="background:#0b0f1d;border:1px solid rgba(150,170,220,0.18);border-radius:20px;padding:40px 40px 36px;">

              <!-- eyebrow -->
              <p style="margin:0 0 14px;font-family:'Space Grotesk',ui-sans-serif,system-ui,sans-serif;font-size:11.5px;font-weight:500;letter-spacing:0.26em;text-transform:uppercase;color:#4be1ec;">
                Admin Access
              </p>

              <!-- heading -->
              <h1 style="margin:0 0 14px;font-family:'Space Grotesk',ui-sans-serif,system-ui,sans-serif;font-size:26px;font-weight:600;letter-spacing:-0.025em;color:#eef2fb;line-height:1.15;">
                Sign in to<br/>IRaven Admin
              </h1>

              <!-- body -->
              <p style="margin:0 0 28px;font-size:15px;color:#8b95ac;line-height:1.65;">
                Your access link is ready. This link expires in
                <span style="color:#c0c8da;font-weight:500;">15&nbsp;minutes</span>
                and can only be used once.
              </p>

              <!-- hairline divider -->
              <div style="height:1px;background:rgba(150,170,220,0.10);margin-bottom:28px;"></div>

              <!-- CTA button -->
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="border-radius:100px;background:linear-gradient(180deg,#8df0f6,#4be1ec);">
                    <a href="${link}"
                       style="display:inline-block;padding:14px 32px;font-family:'Space Grotesk',ui-sans-serif,system-ui,sans-serif;font-size:15px;font-weight:600;color:#04121a;text-decoration:none;border-radius:100px;letter-spacing:-0.01em;white-space:nowrap;">
                      Sign in to Admin &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- link fallback -->
              <p style="margin:20px 0 0;font-size:12px;color:#5c6680;line-height:1.7;">
                Or copy this link into your browser:<br/>
                <a href="${link}" style="color:#4be1ec;font-family:monospace;font-size:11px;word-break:break-all;text-decoration:none;">${link}</a>
              </p>

            </td>
          </tr>

          <!-- ── Footer chrome ── -->
          <tr>
            <td align="center" style="padding-top:28px;">
              <p style="margin:0 0 8px;font-family:'Space Grotesk',ui-sans-serif,system-ui,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#5c6680;">
                RAVEN://OS &middot; Admin Console
              </p>
              <p style="margin:0;font-size:12px;color:#5c6680;line-height:1.6;">
                If you did not request this link, you can safely ignore this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`,
  })
}
