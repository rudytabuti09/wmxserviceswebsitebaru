import React from 'react';
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Link,
  Hr,
} from '@react-email/components';

interface InvoiceReminderEmailProps {
  clientName: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  dueDate: string;
  projectTitle: string;
  paymentUrl: string;
  isOverdue?: boolean;
}

export const InvoiceReminderEmail = ({ 
  clientName,
  invoiceNumber,
  amount,
  currency = 'USD',
  dueDate,
  projectTitle,
  paymentUrl,
  isOverdue = false
}: InvoiceReminderEmailProps) => {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <Html>
      <Head />
      <Preview>
        {isOverdue 
          ? `Overdue Invoice Reminder - ${invoiceNumber}` 
          : `Invoice Payment Reminder - ${invoiceNumber}`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerSection}>
            <div style={logoContainer}>
              <Heading style={logo}>WMX SERVICES</Heading>
            </div>
          </Section>

          {/* Status Badge */}
          <Section style={badgeSection}>
            <div style={{
              ...badge,
              backgroundColor: isOverdue ? '#FF3EA5' : '#FFC700',
            }}>
              <Text style={badgeText}>
                {isOverdue ? '⚠️ OVERDUE NOTICE' : '📧 PAYMENT REMINDER'}
              </Text>
            </div>
          </Section>

          {/* Main Content */}
          <Section style={contentSection}>
            <Heading style={heading}>
              Hi {clientName},
            </Heading>
            
            <Text style={paragraph}>
              {isOverdue 
                ? `This is a friendly reminder that your invoice is now overdue. We'd appreciate your prompt attention to this matter.`
                : `This is a friendly reminder that you have an upcoming payment due for your project with WMX Services.`}
            </Text>

            {/* Invoice Details Card */}
            <div style={invoiceCard}>
              <div style={invoiceHeader}>
                <Text style={invoiceTitle}>INVOICE DETAILS</Text>
              </div>
              
              <div style={invoiceBody}>
                <div style={invoiceRow}>
                  <Text style={invoiceLabel}>Invoice Number:</Text>
                  <Text style={invoiceValue}>{invoiceNumber}</Text>
                </div>
                
                <div style={invoiceRow}>
                  <Text style={invoiceLabel}>Project:</Text>
                  <Text style={invoiceValue}>{projectTitle}</Text>
                </div>
                
                <div style={invoiceRow}>
                  <Text style={invoiceLabel}>Due Date:</Text>
                  <Text style={{
                    ...invoiceValue,
                    color: isOverdue ? '#FF3EA5' : '#111111',
                    fontWeight: isOverdue ? '700' : '500',
                  }}>
                    {dueDate}
                  </Text>
                </div>
                
                <Hr style={invoiceDivider} />
                
                <div style={invoiceRow}>
                  <Text style={totalLabel}>Total Amount:</Text>
                  <Text style={totalValue}>
                    {formatCurrency(amount, currency)}
                  </Text>
                </div>
              </div>
            </div>

            <Section style={buttonSection}>
              <Button href={paymentUrl} style={primaryButton}>
                Pay Invoice Now
              </Button>
            </Section>

            <Text style={paragraph}>
              {isOverdue 
                ? `To avoid any service interruptions, please make your payment as soon as possible.`
                : `Making your payment on time helps us maintain the quality of service you expect from us.`}
            </Text>

            <Text style={paragraph}>
              If you have already made this payment, please disregard this reminder. 
              If you have any questions about this invoice, please don't hesitate to contact us.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Need help? Contact us at{' '}
              <Link href="mailto:billing@wmx-services.com" style={link}>
                billing@wmx-services.com
              </Link>
            </Text>
            
            <Text style={footerText}>
              Or view your invoice in the client portal at{' '}
              <Link href={paymentUrl} style={link}>
                your dashboard
              </Link>
            </Text>

            <Text style={copyright}>
              © {new Date().getFullYear()} WMX Services. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#f8f5f2',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '600px',
};

const headerSection = {
  marginBottom: '30px',
};

const logoContainer = {
  textAlign: 'center' as const,
  padding: '20px',
  backgroundColor: '#3D52F1',
  border: '3px solid #111111',
  boxShadow: '4px 4px 0px #111111',
};

const logo = {
  color: '#FFFFFF',
  fontSize: '28px',
  fontWeight: '800',
  letterSpacing: '2px',
  margin: '0',
  textShadow: '2px 2px 0px #111111',
};

const badgeSection = {
  textAlign: 'center' as const,
  marginBottom: '30px',
};

const badge = {
  display: 'inline-block',
  border: '3px solid #111111',
  boxShadow: '3px 3px 0px #111111',
  padding: '8px 20px',
};

const badgeText = {
  margin: '0',
  fontSize: '14px',
  fontWeight: '700',
  color: '#111111',
  letterSpacing: '1px',
};

const contentSection = {
  backgroundColor: '#FFFFFF',
  border: '3px solid #111111',
  boxShadow: '4px 4px 0px #111111',
  padding: '30px',
  marginBottom: '30px',
};

const heading = {
  fontSize: '28px',
  fontWeight: '700',
  color: '#111111',
  marginBottom: '20px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#333333',
  marginBottom: '16px',
};

const invoiceCard = {
  backgroundColor: '#f8f5f2',
  border: '2px solid #111111',
  marginTop: '24px',
  marginBottom: '24px',
};

const invoiceHeader = {
  backgroundColor: '#111111',
  padding: '12px',
};

const invoiceTitle = {
  color: '#FFFFFF',
  fontSize: '14px',
  fontWeight: '700',
  letterSpacing: '1px',
  margin: '0',
};

const invoiceBody = {
  padding: '20px',
};

const invoiceRow = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '12px',
};

const invoiceLabel = {
  fontSize: '14px',
  color: '#666666',
  margin: '0',
};

const invoiceValue = {
  fontSize: '14px',
  color: '#111111',
  fontWeight: '500',
  margin: '0',
};

const invoiceDivider = {
  borderColor: '#E0E0E0',
  margin: '16px 0',
};

const totalLabel = {
  fontSize: '16px',
  color: '#111111',
  fontWeight: '700',
  margin: '0',
};

const totalValue = {
  fontSize: '20px',
  color: '#E57C23',
  fontWeight: '800',
  margin: '0',
};

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const primaryButton = {
  backgroundColor: '#FFC700',
  color: '#111111',
  border: '3px solid #111111',
  boxShadow: '4px 4px 0px #111111',
  padding: '14px 28px',
  fontSize: '16px',
  fontWeight: '700',
  textDecoration: 'none',
  display: 'inline-block',
  textTransform: 'uppercase' as const,
};

const divider = {
  borderColor: '#E0E0E0',
  margin: '30px 0',
};

const footer = {
  textAlign: 'center' as const,
};

const footerText = {
  fontSize: '14px',
  color: '#666666',
  marginBottom: '8px',
};

const link = {
  color: '#E57C23',
  textDecoration: 'underline',
};

const copyright = {
  fontSize: '12px',
  color: '#999999',
  marginTop: '20px',
};

export default InvoiceReminderEmail;
