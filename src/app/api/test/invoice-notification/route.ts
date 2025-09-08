import { NextRequest, NextResponse } from 'next/server';
import { sendInvoiceNotificationEmail } from '@/lib/email/services';

export async function POST(request: NextRequest) {
  try {
    // Sample test data for invoice notification
    const testInvoiceData = {
      to: 'test@example.com', // Change this to a real email for testing
      clientName: 'John Doe',
      invoiceNumber: 'INV-TEST-001',
      projectTitle: 'Test Website Development',
      amount: 2500000,
      currency: 'IDR',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 14 days from now
      issuedDate: new Date().toLocaleDateString(),
      description: 'Complete website development including design, frontend, and backend implementation',
      paymentUrl: 'http://localhost:3000/client/payment?invoice=test-123',
      companyName: 'WMX Services',
    };

    console.log('Sending test invoice notification email to:', testInvoiceData.to);
    
    // For now, let's use a direct fallback approach to avoid React Email issues
    const template = getSimpleInvoiceNotificationTemplate(testInvoiceData);
    
    console.log('Using fallback template, attempting to send email...');
    
    const { sendEmail, EMAIL_CONFIG } = await import('@/lib/email/resend');
    
    const result = await sendEmail({
      to: testInvoiceData.to,
      subject: `📄 New Invoice: ${testInvoiceData.invoiceNumber} - ${testInvoiceData.projectTitle}`,
      html: template.html,
      text: template.text,
    });

    console.log('Email send result:', result);

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: `Invoice notification email sent successfully to ${testInvoiceData.to}`,
        data: result.data
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error || 'Failed to send email'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Failed to send test invoice notification email:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

// Simple template function for testing
function getSimpleInvoiceNotificationTemplate(data: {
  clientName: string;
  invoiceNumber: string;
  projectTitle: string;
  amount: number;
  currency: string;
  dueDate: string;
  issuedDate: string;
  description?: string;
  paymentUrl: string;
  companyName?: string;
}) {
  const formatCurrency = (amount: number, currency: string) => {
    const locale = currency === 'IDR' ? 'id-ID' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>New Invoice - ${data.invoiceNumber}</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background-color: #FFC700; padding: 20px; text-align: center; border: 3px solid #111111; margin-bottom: 20px;">
          <h1 style="margin: 0; color: #111111; text-transform: uppercase; font-weight: bold;">WMX Services</h1>
          <p style="margin: 5px 0 0 0; color: #111111; font-weight: bold;">Digital Solutions That Drive Growth</p>
        </div>
        
        <div style="background-color: white; padding: 30px; border: 3px solid #111111; box-shadow: 4px 4px 0px #111111;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #111111; font-size: 28px; margin: 0 0 10px 0;">📄 NEW INVOICE</h1>
            <p style="color: #666; font-size: 16px; margin: 0;">Invoice ${data.invoiceNumber}</p>
          </div>
          
          <p style="font-size: 16px; color: #333;">Dear ${data.clientName},</p>
          
          <p style="font-size: 14px; color: #333; line-height: 1.6;">We hope this email finds you well. We are pleased to send you a new invoice for your project.</p>
          
          <div style="background-color: #f9fafb; border: 2px solid #111111; padding: 20px; margin: 20px 0;">
            <h2 style="color: #111111; font-size: 18px; margin: 0 0 15px 0;">📋 Invoice Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;">Invoice Number:</td>
                <td style="padding: 8px 0; color: #111; font-size: 14px; font-weight: bold;">${data.invoiceNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;">Project:</td>
                <td style="padding: 8px 0; color: #111; font-size: 14px;">${data.projectTitle}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;">Amount:</td>
                <td style="padding: 8px 0; color: #111; font-size: 18px; font-weight: bold;">${formatCurrency(data.amount, data.currency)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;">Issued Date:</td>
                <td style="padding: 8px 0; color: #111; font-size: 14px;">${data.issuedDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;">Due Date:</td>
                <td style="padding: 8px 0; color: #111; font-size: 14px; font-weight: bold;">${data.dueDate}</td>
              </tr>
              ${data.description ? `
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;">Description:</td>
                <td style="padding: 8px 0; color: #111; font-size: 14px;">${data.description}</td>
              </tr>` : ''}
            </table>
          </div>
          
          <div style="background-color: #f0f9ff; border: 2px solid #0ea5e9; padding: 20px; text-align: center; margin: 20px 0;">
            <h2 style="color: #0ea5e9; font-size: 18px; margin: 0 0 15px 0;">💳 Payment Instructions</h2>
            <p style="color: #333; font-size: 14px; margin: 0 0 20px 0;">To make your payment quickly and securely, please click the button below:</p>
            <a href="${data.paymentUrl}" style="display: inline-block; background-color: #FFC700; color: #111111; padding: 15px 30px; text-decoration: none; border: 3px solid #111111; font-weight: bold; text-transform: uppercase; font-size: 16px; box-shadow: 4px 4px 0px #111111;">PAY INVOICE NOW</a>
          </div>
          
          <div style="background-color: #fefce8; border: 2px solid #eab308; padding: 15px; margin: 20px 0;">
            <h3 style="color: #a16207; font-size: 16px; margin: 0 0 10px 0;">ℹ️ Important Information</h3>
            <ul style="margin: 0; padding-left: 20px; color: #333; font-size: 14px;">
              <li>Please keep this email for your records</li>
              <li>Payment is due by <strong>${data.dueDate}</strong></li>
              <li>Late payments may incur additional charges</li>
              <li>Contact us if you have any questions</li>
            </ul>
          </div>
          
          <p style="color: #333; font-size: 14px; line-height: 1.6;">If you have any questions about this invoice, please don't hesitate to contact us.</p>
          
          <p style="color: #333; font-size: 14px;">Best regards,<br><strong>${data.companyName || 'WMX Services'} Team</strong></p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          This is an automated message. Please do not reply to this email.<br>
          © ${new Date().getFullYear()} ${data.companyName || 'WMX Services'}. All rights reserved.
        </div>
      </body>
    </html>
  `;
  
  const text = `
New Invoice from ${data.companyName || 'WMX Services'}

Dear ${data.clientName},

We hope this email finds you well. We are pleased to send you a new invoice for your project.

Invoice Details:
• Invoice Number: ${data.invoiceNumber}
• Project: ${data.projectTitle}
• Amount: ${formatCurrency(data.amount, data.currency)}
• Issued Date: ${data.issuedDate}
• Due Date: ${data.dueDate}
${data.description ? `• Description: ${data.description}` : ''}

To make your payment quickly and securely, please visit our payment portal:
${data.paymentUrl}

You can pay using various methods including bank transfer, credit card, and e-wallet options.

Important Information:
• Please keep this email for your records
• Payment is due by ${data.dueDate}
• Late payments may incur additional charges
• Contact us if you have any questions about this invoice

If you have any questions about this invoice, please don't hesitate to contact us.

Best regards,
${data.companyName || 'WMX Services'} Team

This is an automated message. Please do not reply to this email.
© ${new Date().getFullYear()} ${data.companyName || 'WMX Services'}. All rights reserved.
  `;
  
  return { html, text };
}

export async function GET() {
  return NextResponse.json({
    message: 'Invoice Notification Email Test Endpoint',
    description: 'Use POST method to send a test invoice notification email',
    usage: 'POST /api/test/invoice-notification',
    note: 'Make sure to update the test email address in the code before testing'
  });
}
