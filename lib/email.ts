/**
 * Email service for sending password reset links and other notifications
 * Using Resend for email delivery
 */

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send an email using Resend API
 */
export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.error("RESEND_API_KEY is not configured");
    // In development, log the email content instead of throwing
    if (process.env.NODE_ENV === "development") {
      console.log("📧 Email would be sent to:", to);
      console.log("📧 Subject:", subject);
      console.log("📧 HTML:", html);
      return true;
    }
    throw new Error("Email service not configured");
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "MealMuse <noreply@mymealmuse.com>",
        to: [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to send email:", error);
      return false;
    }

    const data = await response.json();
    console.log("Email sent successfully:", data.id);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, resetLink: string): Promise<boolean> {
  const subject = "Reset Your MealMuse Password";
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .logo {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo h1 {
            color: #7A8854;
            font-size: 32px;
            margin: 0;
            font-family: serif;
          }
          .button {
            display: inline-block;
            padding: 14px 28px;
            background: linear-gradient(135deg, #7A8854 0%, #5A6844 100%);
            color: white !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #666;
            text-align: center;
          }
          .warning {
            background-color: #fff3cd;
            border: 1px solid #ffc107;
            border-radius: 4px;
            padding: 12px;
            margin-top: 20px;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <h1>🍳 MealMuse</h1>
          </div>
          
          <h2>Reset Your Password</h2>
          
          <p>Hi there,</p>
          
          <p>We received a request to reset your password for your MealMuse account. Click the button below to create a new password:</p>
          
          <div style="text-align: center;">
            <a href="${resetLink}" class="button">Reset Password</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #7A8854; font-size: 14px;">${resetLink}</p>
          
          <div class="warning">
            <strong>⏰ This link will expire in 1 hour</strong> for security reasons.
          </div>
          
          <p style="margin-top: 30px;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} MealMuse. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(email: string, name?: string): Promise<boolean> {
  const subject = "Welcome to MealMuse! 🎉";
  const displayName = name || "Chef";

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .logo {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo h1 {
            color: #7A8854;
            font-size: 32px;
            margin: 0;
            font-family: serif;
          }
          .button {
            display: inline-block;
            padding: 14px 28px;
            background: linear-gradient(135deg, #7A8854 0%, #5A6844 100%);
            color: white !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
          }
          .feature {
            margin: 20px 0;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 6px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <h1>🍳 MealMuse</h1>
          </div>
          
          <h2>Welcome to MealMuse, ${displayName}!</h2>
          
          <p>We're excited to have you join our culinary community! Get ready to discover, create, and share amazing recipes.</p>
          
          <div class="feature">
            <strong>🔍 Discover</strong> - Browse hundreds of recipes from around the world
          </div>
          
          <div class="feature">
            <strong>✨ Create</strong> - Save and organize your favorite recipes
          </div>
          
          <div class="feature">
            <strong>🤖 AI Chef</strong> - Get personalized recipe suggestions with AI
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXTAUTH_URL || "https://mymealmuse.com"}/recipes" class="button">Start Cooking</a>
          </div>
          
          <p style="margin-top: 30px;">Happy cooking!</p>
          <p>The MealMuse Team</p>
        </div>
      </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
}
