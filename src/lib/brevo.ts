// Brevo API integration
// Note: This is a simplified version. For production, implement proper Brevo SDK integration.

export interface NewsletterSubscriber {
  email: string;
  firstName?: string;
  lastName?: string;
  attributes?: Record<string, any>;
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
        <h1>New Contact Form Submission</h1>
        <p><strong>From:</strong> ${senderName} (${senderEmail})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
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
