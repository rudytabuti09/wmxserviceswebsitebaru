import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
  Img,
} from '@react-email/components';

interface InvoiceNotificationEmailProps {
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
  companyLogo?: string;
}

export default function InvoiceNotificationEmail({
  clientName = 'Valued Client',
  invoiceNumber = 'INV-001',
  projectTitle = 'Project',
  amount = 0,
  currency = 'IDR',
  dueDate = new Date().toLocaleDateString(),
  issuedDate = new Date().toLocaleDateString(),
  description = '',
  paymentUrl = '#',
  companyName = 'WMX Services',
  companyLogo = '',
}: InvoiceNotificationEmailProps) {
  const formatCurrency = (amount: number, currency: string) => {
    const locale = currency === 'IDR' ? 'id-ID' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(amount);
  };

  return (
    <Html>
      <Head />
      <Preview>New Invoice from {companyName} - {invoiceNumber}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            {companyLogo && (
              <Img
                src={companyLogo}
                width="120"
                height="40"
                alt={companyName}
                style={logo}
              />
            )}
            <Text style={headerTitle}>{companyName}</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Text style={greeting}>Dear {clientName},</Text>
            
            <Text style={mainText}>
              We hope this email finds you well. We are pleased to send you a new invoice for your project.
            </Text>

            {/* Invoice Details Card */}
            <Section style={invoiceCard}>
              <Text style={cardTitle}>📄 Invoice Details</Text>
              
              <table style={detailsTable}>
                <tr>
                  <td style={labelCell}>Invoice Number:</td>
                  <td style={valueCell}><strong>{invoiceNumber}</strong></td>
                </tr>
                <tr>
                  <td style={labelCell}>Project:</td>
                  <td style={valueCell}>{projectTitle}</td>
                </tr>
                <tr>
                  <td style={labelCell}>Amount:</td>
                  <td style={valueCell}>
                    <span style={amountStyle}>{formatCurrency(amount, currency)}</span>
                  </td>
                </tr>
                <tr>
                  <td style={labelCell}>Issued Date:</td>
                  <td style={valueCell}>{issuedDate}</td>
                </tr>
                <tr>
                  <td style={labelCell}>Due Date:</td>
                  <td style={valueCell}><strong style={dueDateStyle}>{dueDate}</strong></td>
                </tr>
                {description && (
                  <tr>
                    <td style={labelCell}>Description:</td>
                    <td style={valueCell}>{description}</td>
                  </tr>
                )}
              </table>
            </Section>

            {/* Payment Instructions */}
            <Section style={paymentSection}>
              <Text style={paymentTitle}>💳 Payment Instructions</Text>
              <Text style={paymentText}>
                To make your payment quickly and securely, please click the button below to access our payment portal:
              </Text>
              
              <Section style={buttonSection}>
                <Link href={paymentUrl} style={paymentButton}>
                  Pay Invoice Now
                </Link>
              </Section>
              
              <Text style={paymentNote}>
                You can pay using various methods including bank transfer, credit card, and e-wallet options.
              </Text>
            </Section>

            {/* Additional Information */}
            <Section style={infoSection}>
              <Text style={infoTitle}>ℹ️ Important Information</Text>
              <ul style={infoList}>
                <li style={infoItem}>Please keep this email for your records</li>
                <li style={infoItem}>Payment is due by <strong>{dueDate}</strong></li>
                <li style={infoItem}>Late payments may incur additional charges</li>
                <li style={infoItem}>Contact us if you have any questions about this invoice</li>
              </ul>
            </Section>

            <Hr style={divider} />

            {/* Footer */}
            <Text style={footer}>
              If you have any questions about this invoice, please don't hesitate to contact us.
            </Text>
            
            <Text style={signature}>
              Best regards,<br />
              <strong>{companyName} Team</strong>
            </Text>
          </Section>

          {/* Bottom Footer */}
          <Section style={bottomFooter}>
            <Text style={bottomFooterText}>
              This is an automated message. Please do not reply to this email.
              <br />
              © 2024 {companyName}. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f8fafc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '20px 30px',
  textAlign: 'center' as const,
  borderBottom: '3px solid #111111',
  backgroundColor: '#FFC700',
};

const logo = {
  margin: '0 auto 10px',
};

const headerTitle = {
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
  color: '#111111',
  textTransform: 'uppercase' as const,
};

const content = {
  padding: '30px',
};

const greeting = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#111111',
  marginBottom: '20px',
};

const mainText = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#374151',
  marginBottom: '30px',
};

const invoiceCard = {
  backgroundColor: '#f9fafb',
  border: '2px solid #111111',
  borderRadius: '0px',
  padding: '20px',
  marginBottom: '30px',
  boxShadow: '4px 4px 0px #111111',
};

const cardTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#111111',
  margin: '0 0 15px 0',
  textAlign: 'center' as const,
};

const detailsTable = {
  width: '100%',
  borderCollapse: 'collapse' as const,
};

const labelCell = {
  padding: '8px 0',
  fontSize: '14px',
  color: '#6b7280',
  verticalAlign: 'top' as const,
  width: '40%',
};

const valueCell = {
  padding: '8px 0',
  fontSize: '14px',
  color: '#111111',
  verticalAlign: 'top' as const,
};

const amountStyle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#00FF00',
  backgroundColor: '#111111',
  padding: '4px 8px',
  borderRadius: '0px',
};

const dueDateStyle = {
  color: '#FF3EA5',
};

const paymentSection = {
  backgroundColor: '#f0f9ff',
  border: '2px solid #0ea5e9',
  padding: '20px',
  marginBottom: '30px',
  textAlign: 'center' as const,
};

const paymentTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#0ea5e9',
  margin: '0 0 15px 0',
};

const paymentText = {
  fontSize: '14px',
  color: '#374151',
  marginBottom: '20px',
};

const buttonSection = {
  textAlign: 'center' as const,
  margin: '20px 0',
};

const paymentButton = {
  backgroundColor: '#FFC700',
  color: '#111111',
  padding: '12px 30px',
  textDecoration: 'none',
  border: '3px solid #111111',
  fontWeight: 'bold',
  fontSize: '16px',
  textTransform: 'uppercase' as const,
  display: 'inline-block',
  boxShadow: '4px 4px 0px #111111',
};

const paymentNote = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '15px 0 0 0',
};

const infoSection = {
  backgroundColor: '#fefce8',
  border: '2px solid #eab308',
  padding: '20px',
  marginBottom: '30px',
};

const infoTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#a16207',
  margin: '0 0 15px 0',
};

const infoList = {
  margin: '0',
  paddingLeft: '20px',
};

const infoItem = {
  fontSize: '14px',
  color: '#374151',
  marginBottom: '5px',
};

const divider = {
  borderColor: '#e5e7eb',
  margin: '30px 0',
};

const footer = {
  fontSize: '14px',
  color: '#6b7280',
  marginBottom: '20px',
};

const signature = {
  fontSize: '14px',
  color: '#111111',
};

const bottomFooter = {
  textAlign: 'center' as const,
  padding: '20px 30px',
  borderTop: '1px solid #e5e7eb',
  backgroundColor: '#f9fafb',
};

const bottomFooterText = {
  fontSize: '12px',
  color: '#9ca3af',
  margin: '0',
};
