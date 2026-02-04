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

interface CancellationParams {
  email: string;
  name: string;
  ticketNumber: string;
  refundAmount: number;
}

export async function sendCancellationEmail({ email, name, ticketNumber, refundAmount }: CancellationParams): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  const envSender = process.env.BREVO_FROM_EMAIL || "no-reply@example.com";

  let senderName = "Ticket App";
  let senderEmail = envSender;

  if (envSender.includes("<") && envSender.includes(">")) {
    const match = envSender.match(/^(.*)<(.*)>$/);
    if (match) {
      senderName = match[1].trim() || senderName;
      senderEmail = match[2].trim();
    }
  }

  if (!apiKey) return false;

  const apiInstance = new Brevo.TransactionalEmailsApi();
  apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);

  const sendSmtpEmail = new Brevo.SendSmtpEmail();

  sendSmtpEmail.subject = `Ticket Cancelled - Refund Pending`;
  sendSmtpEmail.sender = { name: senderName, email: senderEmail };
  sendSmtpEmail.to = [{ email: email, name: name }];
  sendSmtpEmail.htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #e11d48; padding-bottom: 10px; }
          .info { background: #fff; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .amount { font-size: 24px; font-weight: bold; color: #059669; }
          .footer { font-size: 12px; color: #666; text-align: center; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Ticket Cancelled</h2>
          </div>
          <p>Hello ${name},</p>
          <p>Your ticket cancellation has been processed successfully.</p>
          
          <div class="info">
            <p><strong>Ticket Number:</strong> ${ticketNumber}</p>
            <p><strong>Refund Amount:</strong> <span class="amount">₹${refundAmount}</span></p>
            <p><strong>Status:</strong> Refund Initiated</p>
          </div>

          <p>Please note that the refund amount will be credited to your original payment method within <strong>5 business days</strong>.</p>
          
          <p>If you have any questions, please contact support.</p>
          
          <div class="footer">
            &copy; ${new Date().getFullYear()} Ticket App. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`Cancellation email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending cancellation email:", error);
    return false;
  }
}

export async function sendRefundApprovedEmail({ email, name, ticketNumber, refundAmount }: CancellationParams): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  const envSender = process.env.BREVO_FROM_EMAIL || "no-reply@example.com";

  let senderName = "Ticket App";
  let senderEmail = envSender;

  if (envSender.includes("<") && envSender.includes(">")) {
    const match = envSender.match(/^(.*)<(.*)>$/);
    if (match) {
      senderName = match[1].trim() || senderName;
      senderEmail = match[2].trim();
    }
  }

  if (!apiKey) return false;

  const apiInstance = new Brevo.TransactionalEmailsApi();
  apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);

  const sendSmtpEmail = new Brevo.SendSmtpEmail();

  sendSmtpEmail.subject = `Refund Approved - Ticket ${ticketNumber}`;
  sendSmtpEmail.sender = { name: senderName, email: senderEmail };
  sendSmtpEmail.to = [{ email: email, name: name }];
  sendSmtpEmail.htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #10b981; padding-bottom: 10px; }
          .info { background: #fff; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .amount { font-size: 24px; font-weight: bold; color: #059669; }
          .footer { font-size: 12px; color: #666; text-align: center; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Refund Approved</h2>
          </div>
          <p>Hello ${name},</p>
          <p>Your refund has been approved and processed.</p>

          <div class="info">
            <p><strong>Ticket Number:</strong> ${ticketNumber}</p>
            <p><strong>Refund Amount:</strong> <span class="amount">₹${refundAmount}</span></p>
            <p><strong>Status:</strong> Refund Completed</p>
          </div>

          <p>The refund has been issued to your original payment method.</p>

          <div class="footer">
            &copy; ${new Date().getFullYear()} Ticket App. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`Refund approved email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending refund approved email:", error);
    return false;
  }
}

interface RefundDeclinedParams {
  email: string;
  name: string;
  ticketNumber: string;
  reason: string;
}

export async function sendRefundDeclinedEmail({ email, name, ticketNumber, reason }: RefundDeclinedParams): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  const envSender = process.env.BREVO_FROM_EMAIL || "no-reply@example.com";

  let senderName = "Ticket App";
  let senderEmail = envSender;

  if (envSender.includes("<") && envSender.includes(">")) {
    const match = envSender.match(/^(.*)<(.*)>$/);
    if (match) {
      senderName = match[1].trim() || senderName;
      senderEmail = match[2].trim();
    }
  }

  if (!apiKey) return false;

  const apiInstance = new Brevo.TransactionalEmailsApi();
  apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);

  const sendSmtpEmail = new Brevo.SendSmtpEmail();

  sendSmtpEmail.subject = `Refund Request Declined - Ticket ${ticketNumber}`;
  sendSmtpEmail.sender = { name: senderName, email: senderEmail };
  sendSmtpEmail.to = [{ email: email, name: name }];
  sendSmtpEmail.htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #dc2626; padding-bottom: 10px; }
          .info { background: #fff; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #dc2626; }
          .reason { background: #fee2e2; padding: 12px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #dc2626; }
          .reason-title { font-weight: bold; color: #991b1b; margin-bottom: 8px; }
          .footer { font-size: 12px; color: #666; text-align: center; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Refund Request Declined</h2>
          </div>
          <p>Hello ${name},</p>
          <p>We regret to inform you that your refund request has been declined.</p>

          <div class="info">
            <p><strong>Ticket Number:</strong> ${ticketNumber}</p>
            <p><strong>Status:</strong> Request Declined</p>
          </div>

          <div class="reason">
            <div class="reason-title">Reason for Declination:</div>
            <p>${reason}</p>
          </div>

          <p>If you believe this decision was made in error, please contact our support team for further assistance.</p>

          <div class="footer">
            &copy; ${new Date().getFullYear()} Ticket App. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`Refund declined email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending refund declined email:", error);
    return false;
  }
}
