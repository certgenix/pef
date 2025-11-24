import { Resend } from "resend";

/**
 * Email Service Abstraction Layer
 * 
 * TO SWITCH TO SENDGRID:
 * 1. Install SendGrid: npm install @sendgrid/mail
 * 2. Replace the implementation below with SendGrid code
 * 3. Update RESEND_API_KEY secret to SENDGRID_API_KEY
 * 4. Update fromEmail to your verified SendGrid sender
 * 
 * Example SendGrid implementation:
 * 
 * import sgMail from '@sendgrid/mail';
 * 
 * export class EmailService {
 *   private static client: typeof sgMail;
 *   private static fromEmail = 'noreply@yourdomain.com';
 * 
 *   static async initialize() {
 *     const apiKey = process.env.SENDGRID_API_KEY;
 *     if (!apiKey) throw new Error('SENDGRID_API_KEY not set');
 *     sgMail.setApiKey(apiKey);
 *     this.client = sgMail;
 *   }
 * 
 *   static async sendEmail(params: EmailParams): Promise<void> {
 *     await this.client.send({
 *       to: params.to,
 *       from: this.fromEmail,
 *       subject: params.subject,
 *       html: params.html,
 *       replyTo: params.replyTo,
 *     });
 *   }
 * }
 */

export interface EmailParams {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export class EmailService {
  private static client: Resend | null = null;
  private static fromEmail = "onboarding@resend.dev"; // Change this to your verified domain

  /**
   * Initialize the email service
   */
  static async initialize(): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY;
    
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable not set');
    }
    
    this.client = new Resend(apiKey);
  }

  /**
   * Send an email using Resend
   */
  static async sendEmail(params: EmailParams): Promise<void> {
    if (!this.client) {
      await this.initialize();
    }

    if (!this.client) {
      throw new Error('Email service not initialized');
    }

    await this.client.emails.send({
      from: this.fromEmail,
      to: Array.isArray(params.to) ? params.to : [params.to],
      subject: params.subject,
      html: params.html,
      replyTo: params.replyTo,
    });
  }

  /**
   * Send contact form notification to admin
   */
  static async sendContactFormNotification(data: {
    name: string;
    email: string;
    country: string;
    message: string;
  }): Promise<void> {
    const adminEmail = "abdulmoiz.cloud25@gmail.com"; // TODO: Move to env variable

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px;">
          New Contact Form Submission
        </h2>
        
        <div style="margin: 20px 0; background: #f0f9ff; padding: 15px; border-radius: 5px;">
          <p style="margin: 5px 0;"><strong>Reply To:</strong> <a href="mailto:${data.email}" style="color: #1e40af;">${data.email}</a></p>
        </div>
        
        <div style="margin: 20px 0;">
          <p style="margin: 10px 0;"><strong>Name:</strong> ${data.name}</p>
          <p style="margin: 10px 0;"><strong>Email:</strong> ${data.email}</p>
          <p style="margin: 10px 0;"><strong>Country:</strong> ${data.country}</p>
        </div>
        
        <div style="margin: 20px 0;">
          <p style="margin: 10px 0;"><strong>Message:</strong></p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; white-space: pre-wrap;">
            ${data.message}
          </div>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
          <p>This email was sent from the PEF contact form at ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;

    await this.sendEmail({
      to: adminEmail,
      subject: `New Contact Form Submission from ${data.name}`,
      html,
      replyTo: data.email,
    });
  }

  /**
   * Send contact form confirmation to user
   */
  static async sendContactFormConfirmation(data: {
    name: string;
    email: string;
  }): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px;">
          Thank You for Contacting PEF
        </h2>
        
        <p style="margin: 20px 0;">Dear ${data.name},</p>
        
        <p style="margin: 20px 0;">
          Thank you for reaching out to the Professional Executive Forum. We have received your message 
          and will get back to you as soon as possible.
        </p>
        
        <p style="margin: 20px 0;">
          Our team typically responds within 24-48 hours during business days.
        </p>
        
        <div style="margin: 30px 0; padding: 20px; background: #f0f9ff; border-left: 4px solid #1e40af; border-radius: 5px;">
          <p style="margin: 0; font-weight: bold; color: #1e40af;">What happens next?</p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Our team will review your message</li>
            <li>You'll receive a response within 24-48 hours</li>
            <li>We'll address your inquiry or questions</li>
          </ul>
        </div>
        
        <p style="margin: 20px 0;">
          Best regards,<br/>
          <strong>The PEF Team</strong>
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `;

    await this.sendEmail({
      to: data.email,
      subject: 'Thank You for Contacting PEF',
      html,
    });
  }

  /**
   * Send opportunity submission notification to admin
   */
  static async sendOpportunitySubmissionNotification(data: {
    submitterName: string;
    submitterEmail: string;
    opportunityType: string;
    opportunityTitle: string;
    opportunityId: string;
  }): Promise<void> {
    const adminEmail = "abdulmoiz.cloud25@gmail.com"; // TODO: Move to env variable

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px;">
          New Opportunity Submission - Pending Approval
        </h2>
        
        <div style="margin: 20px 0; background: #fef3c7; padding: 15px; border-radius: 5px; border-left: 4px solid #f59e0b;">
          <p style="margin: 5px 0; color: #92400e;"><strong>⚠️ Action Required:</strong> This opportunity needs your review and approval</p>
        </div>
        
        <div style="margin: 20px 0;">
          <p style="margin: 10px 0;"><strong>Opportunity Type:</strong> ${data.opportunityType.charAt(0).toUpperCase() + data.opportunityType.slice(1)}</p>
          <p style="margin: 10px 0;"><strong>Title:</strong> ${data.opportunityTitle}</p>
          <p style="margin: 10px 0;"><strong>Submitted By:</strong> ${data.submitterName}</p>
          <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${data.submitterEmail}" style="color: #1e40af;">${data.submitterEmail}</a></p>
          <p style="margin: 10px 0;"><strong>Opportunity ID:</strong> ${data.opportunityId}</p>
        </div>
        
        <div style="margin: 30px 0;">
          <a href="${process.env.SITE_URL || 'http://localhost:5000'}/admin/opportunities" 
             style="display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Review in Admin Panel
          </a>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
          <p>This email was sent from PEF at ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;

    await this.sendEmail({
      to: adminEmail,
      subject: `New ${data.opportunityType} Opportunity: ${data.opportunityTitle}`,
      html,
      replyTo: data.submitterEmail,
    });
  }

  /**
   * Send opportunity submission confirmation to submitter
   */
  static async sendOpportunitySubmissionConfirmation(data: {
    submitterName: string;
    submitterEmail: string;
    opportunityType: string;
    opportunityTitle: string;
  }): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px;">
          Your Opportunity Has Been Submitted
        </h2>
        
        <p style="margin: 20px 0;">Dear ${data.submitterName},</p>
        
        <p style="margin: 20px 0;">
          Thank you for submitting your <strong>${data.opportunityType}</strong> opportunity to the Professional Executive Forum.
        </p>
        
        <div style="margin: 20px 0; background: #f0f9ff; padding: 15px; border-radius: 5px;">
          <p style="margin: 5px 0;"><strong>Opportunity Title:</strong></p>
          <p style="margin: 5px 0; font-size: 18px; color: #1e40af;">${data.opportunityTitle}</p>
        </div>
        
        <div style="margin: 30px 0; padding: 20px; background: #f0f9ff; border-left: 4px solid #1e40af; border-radius: 5px;">
          <p style="margin: 0; font-weight: bold; color: #1e40af;">What happens next?</p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Our team will review your submission within 24-48 hours</li>
            <li>We'll verify that it meets our community guidelines</li>
            <li>Once approved, it will be published on the platform</li>
            <li>You'll receive a notification when it goes live</li>
          </ul>
        </div>
        
        <p style="margin: 20px 0;">
          We appreciate your contribution to the PEF community and look forward to helping you connect 
          with the right professionals, investors, or partners.
        </p>
        
        <p style="margin: 20px 0;">
          Best regards,<br/>
          <strong>The PEF Team</strong>
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
          <p>This is an automated message. If you have questions, please contact us through the platform.</p>
        </div>
      </div>
    `;

    await this.sendEmail({
      to: data.submitterEmail,
      subject: `Opportunity Submitted: ${data.opportunityTitle}`,
      html,
    });
  }
}
