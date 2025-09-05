// Brevo API integration
// Note: This is a simplified version. For production, implement proper Brevo SDK integration.

export interface NewsletterSubscriber {
  email: string;
  firstName?: string;
  lastName?: string;
  attributes?: Record<string, unknown>;
}

export interface TransactionalEmail {
  to: Array<{ email: string; name?: string }>;
  subject: string;
  htmlContent?: string;
  textContent?: string;
  sender?: { email: string; name?: string };
  replyTo?: { email: string; name?: string };
}

class BrevoService {
  private readonly apiKey = process.env.BREVO_API_KEY;
  private readonly senderEmail = process.env.BREVO_SENDER_EMAIL || '';
  private readonly senderName = process.env.BREVO_SENDER_NAME || 'RHS Coding Club';
  private readonly baseUrl = 'https://api.brevo.com/v3';

  /**
   * Subscribe a user to the newsletter
   */
  async subscribeToNewsletter(subscriber: NewsletterSubscriber): Promise<boolean> {
    if (!this.apiKey) {
      console.error('BREVO_API_KEY is not configured');
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/contacts`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': this.apiKey,
        },
        body: JSON.stringify({
          email: subscriber.email,
          attributes: {
            FIRSTNAME: subscriber.firstName || '',
            LASTNAME: subscriber.lastName || '',
            ...subscriber.attributes,
          },
          listIds: [1], // Replace with your actual list ID
          updateEnabled: true,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      return false;
    }
  }

  /**
   * Send a transactional email
   */
  async sendTransactionalEmail(emailData: TransactionalEmail): Promise<boolean> {
    if (!this.apiKey) {
      console.error('BREVO_API_KEY is not configured');
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/smtp/email`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': this.apiKey,
        },
        body: JSON.stringify({
          to: emailData.to,
          subject: emailData.subject,
          htmlContent: emailData.htmlContent,
          textContent: emailData.textContent,
          sender: emailData.sender || {
            email: this.senderEmail,
            name: this.senderName,
          },
          replyTo: emailData.replyTo,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending transactional email:', error);
      return false;
    }
  }

  /**
   * Send welcome email to new members
   */
  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const welcomeEmailData: TransactionalEmail = {
      to: [{ email, name }],
      subject: 'Welcome to RHS Coding Club!',
      htmlContent: `
        <h1>Welcome to RHS Coding Club, ${name}!</h1>
        <p>We're excited to have you join our community of passionate student developers.</p>
        <p>Here's what you can expect:</p>
        <ul>
          <li>Weekly coding workshops and tutorials</li>
          <li>Collaborative project opportunities</li>
          <li>Coding competitions and challenges</li>
          <li>Networking with fellow students and industry professionals</li>
        </ul>
        <p>Our next meeting is this Friday at 3:30 PM in Computer Lab 1. We can't wait to see you there!</p>
        <p>Best regards,<br>The RHS Coding Club Team</p>
      `,
      textContent: `
        Welcome to RHS Coding Club, ${name}!
        
        We're excited to have you join our community of passionate student developers.
        
        Here's what you can expect:
        - Weekly coding workshops and tutorials
        - Collaborative project opportunities
        - Coding competitions and challenges
        - Networking with fellow students and industry professionals
        
        Our next meeting is this Friday at 3:30 PM in Computer Lab 1. We can't wait to see you there!
        
        Best regards,
        The RHS Coding Club Team
      `,
    };

    return this.sendTransactionalEmail(welcomeEmailData);
  }

  /**
   * Send contact form notification
   */
  async sendContactFormNotification(
    senderEmail: string,
    senderName: string,
    subject: string,
    message: string
  ): Promise<boolean> {
    const notificationEmailData: TransactionalEmail = {
      to: [{ email: this.senderEmail, name: this.senderName }],
      subject: `New Contact Form Submission: ${subject}`,
      htmlContent: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Contact Form Submission</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f7; color: #333; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; }
                .header { background-color: #4f46e5; color: #ffffff; padding: 24px; text-align: center; }
                .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
                .content { padding: 32px; }
                .content h2 { font-size: 20px; margin-top: 0; margin-bottom: 16px; color: #4f46e5; }
                .info-table { width: 100%; margin-bottom: 24px; border-collapse: collapse; }
                .info-table td { padding: 8px 0; vertical-align: top; }
                .info-table td:first-child { font-weight: 600; color: #4a5568; width: 80px; }
                .message-box { background-color: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; white-space: pre-wrap; word-wrap: break-word; font-size: 15px; line-height: 1.6; }
                .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; border-top: 1px solid #e2e8f0; }
                a { color: #4f46e5; text-decoration: none; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>New Website Message</h1>
                </div>
                <div class="content">
                    <h2>Submission Details</h2>
                    <table class="info-table">
                        <tr>
                            <td>From:</td>
                            <td>${senderName}</td>
                        </tr>
                        <tr>
                            <td>Email:</td>
                            <td><a href="mailto:${senderEmail}">${senderEmail}</a></td>
                        </tr>
                        <tr>
                            <td>Subject:</td>
                            <td>${subject}</td>
                        </tr>
                    </table>
                    <h2>Message</h2>
                    <div class="message-box">
                        ${message.replace(/\n/g, '<br>')}
                    </div>
                </div>
                <div class="footer">
                    <p>This email was sent from the contact form on the RHS Coding Club website.</p>
                    <p>&copy; ${new Date().getFullYear()} RHS Coding Club. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
      `,
      textContent: `
        New Contact Form Submission
        
        From: ${senderName} (${senderEmail})
        Subject: ${subject}
        
        Message:
        ${message}
      `,
      replyTo: { email: senderEmail, name: senderName },
    };

    return this.sendTransactionalEmail(notificationEmailData);
  }
}

export const brevoService = new BrevoService();
