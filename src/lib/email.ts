import * as Brevo from "@getbrevo/brevo";

interface SendOtpParams {
  email: string;
  otp: string;
  name?: string;
}

export async function sendOtpEmail({ email, otp, name }: SendOtpParams): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  const envSender = process.env.BREVO_FROM_EMAIL || "no-reply@example.com";

  // Parse "Name <email>" format if present
  let senderName = "Ticket App";
  let senderEmail = envSender;

  if (envSender.includes("<") && envSender.includes(">")) {
    const match = envSender.match(/^(.*)<(.*)>$/);
    if (match) {
      senderName = match[1].trim() || senderName;
      senderEmail = match[2].trim();
    }
  }

  if (!apiKey) {
    console.error("BREVO_API_KEY is not defined in environment variables");
    return false;
  }

  const apiInstance = new Brevo.TransactionalEmailsApi();
  apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);

  const sendSmtpEmail = new Brevo.SendSmtpEmail();

  sendSmtpEmail.subject = "Your Verification Code";
  sendSmtpEmail.sender = { name: senderName, email: senderEmail };
  sendSmtpEmail.to = [{ email: email, name: name || email }];
  sendSmtpEmail.htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; }
          .header { text-align: center; margin-bottom: 20px; }
          .code { font-size: 32px; font-weight: bold; color: #e11d48; text-align: center; letter-spacing: 5px; margin: 20px 0; }
          .footer { font-size: 12px; color: #666; text-align: center; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Verify Your Email</h2>
          </div>
          <p>Hello ${name || "there"},</p>
          <p>Thank you for registering. Please use the following One-Time Password (OTP) to complete your account creation:</p>
          <div class="code">${otp}</div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Ticket App. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`OTP sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending OTP email via Brevo:", error);
    return false;
  }
}
