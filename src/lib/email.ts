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

interface AdminBookingParams {
  email: string;
  name: string;
  ticketNumber: string;
  source: string;
  destination: string;
  travelDate: string | Date;
  busNumber?: string;
  seatNumber: string;
}

export async function sendAdminBookingEmail({
  email,
  name,
  ticketNumber,
  source,
  destination,
  travelDate,
  busNumber,
  seatNumber
}: AdminBookingParams): Promise<boolean> {
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

  const formattedDate = new Date(travelDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const sendSmtpEmail = new Brevo.SendSmtpEmail();

  sendSmtpEmail.subject = `Ticket Confirmed - ${source} to ${destination}`;
  sendSmtpEmail.sender = { name: senderName, email: senderEmail };
  sendSmtpEmail.to = [{ email: email, name: name }];
  sendSmtpEmail.htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f1f5f9; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px 24px; text-align: center; }
          .header h2 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
          .content { padding: 32px 24px; }
          .card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-top: 24px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 12px; }
          .row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
          .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 700; margin-bottom: 4px; }
          .value { font-size: 14px; font-weight: 600; color: #0f172a; }
          .ticket-number { font-family: 'Courier New', monospace; font-size: 16px; background-color: #e2e8f0; padding: 8px 12px; border-radius: 6px; letter-spacing: 1px; color: #334155; display: inline-block; margin-top: 8px; font-weight: bold; }
          .footer { background-color: #f8fafc; padding: 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
          .route { display: flex; align-items: center; justify-content: center; gap: 12px; margin: 24px 0; font-weight: 800; font-size: 18px; color: #0f172a; }
          .arrow { color: #10b981; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Booking Confirmed</h2>
          </div>
          
          <div class="content">
            <p style="margin-top: 0;">Hello <strong>${name}</strong>,</p>
            <p>Your ticket has been successfully booked by the administration team. We are excited to have you on board!</p>
            
            <div class="route">
              ${source} <span class="arrow">→</span> ${destination}
            </div>

            <div class="card">
              <div class="row">
                <div>
                  <div class="label">Passenger</div>
                  <div class="value">${name}</div>
                </div>
                <div style="text-align: right;">
                  <div class="label">Travel Date</div>
                  <div class="value">${formattedDate}</div>
                </div>
              </div>
              
              <div class="row">
                <div>
                  <div class="label">Bus Service</div>
                  <div class="value">${busNumber || 'Standard Service'}</div>
                </div>
                <div style="text-align: right;">
                 <div class="label">Seat Number</div>
                 <div class="value" style="font-size: 18px; color: #10b981;">${seatNumber}</div>
                </div>
              </div>

              <div class="row" style="justify-content: center; border-bottom: none; text-align: center; margin-top: 12px;">
                 <div>
                    <div class="label">Ticket Reference</div>
                    <div class="ticket-number">${ticketNumber}</div>
                 </div>
              </div>
            </div>
            
            <p style="text-align: center; margin-top: 32px; font-size: 13px; color: #64748b;">
              Please show this email or your ticket number at the time of boarding.
            </p>
          </div>
          
          <div class="footer">
            &copy; ${new Date().getFullYear()} Ticket App. All rights reserved.<br>
            Safe Travels!
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`Admin booking confirmation sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending admin booking email:", error);
    return false;
  }
}
