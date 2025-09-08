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

interface PaymentConfirmationEmailProps {
  clientName: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  projectTitle: string;
  paymentMethod?: string;
  paidDate: string;
  dashboardUrl: string;
}

export const PaymentConfirmationEmail = ({ 
  clientName,
  invoiceNumber,
  amount,
  currency = 'IDR',
  projectTitle,
  paymentMethod = 'Online Payment',
  paidDate,
  dashboardUrl
}: PaymentConfirmationEmailProps) => {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Html>
      <Head />
      <Preview>Payment Confirmed - Invoice {invoiceNumber}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerSection}>
            <div style={logoContainer}>
              <Heading style={logo}>WMX SERVICES</Heading>
            </div>
          </Section>

          {/* Success Badge */}
          <Section style={badgeSection}>
            <div style={badge}>
              <Text style={badgeText}>
                ✅ PAYMENT CONFIRMED
              </Text>
            </div>
          </Section>

          {/* Main Content */}
          <Section style={contentSection}>
            <Heading style={heading}>
              Payment Received! 🎉
            </Heading>
            
            <Text style={paragraph}>
              Hi {clientName},
            </Text>
            
            <Text style={paragraph}>
              Great news! We've successfully received your payment. Thank you for your prompt payment!
            </Text>

            {/* Payment Details Card */}
            <div style={paymentCard}>
              <div style={paymentHeader}>
                <Text style={paymentTitle}>PAYMENT DETAILS</Text>
              </div>
              
              <div style={paymentBody}>
                <div style={paymentRow}>
                  <Text style={paymentLabel}>Invoice Number:</Text>
                  <Text style={paymentValue}>{invoiceNumber}</Text>
                </div>
                
                <div style={paymentRow}>
                  <Text style={paymentLabel}>Project:</Text>
                  <Text style={paymentValue}>{projectTitle}</Text>
                </div>
                
                <div style={paymentRow}>
                  <Text style={paymentLabel}>Payment Method:</Text>
                  <Text style={paymentValue}>{paymentMethod}</Text>
                </div>
                
                <div style={paymentRow}>
                  <Text style={paymentLabel}>Payment Date:</Text>
                  <Text style={paymentValue}>{paidDate}</Text>
                </div>
                
                <Hr style={paymentDivider} />
                
                <div style={paymentRow}>
                  <Text style={totalLabel}>Amount Paid:</Text>
                  <Text style={totalValue}>
                    {formatCurrency(amount, currency)}
                  </Text>
                </div>
              </div>
            </div>

            <Section style={buttonSection}>
              <Button href={dashboardUrl} style={primaryButton}>
                View Project Dashboard
              </Button>
            </Section>

            <Text style={paragraph}>
              Your payment has been processed and your project will continue as planned. 
              You'll receive regular updates on the progress of your project.
            </Text>

            <Text style={paragraph}>
              If you have any questions about this payment or your project, 
              please don't hesitate to contact us.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Next Steps */}
          <Section style={nextStepsSection}>
            <Heading style={nextStepsHeading}>What's Next?</Heading>
            <div style={nextStepsList}>
              <div style={nextStepItem}>
                <span style={nextStepIcon}>🚀</span>
                <div>
                  <Text style={nextStepTitle}>Project Continuation</Text>
                  <Text style={nextStepDescription}>
                    Our team will continue working on your project without any interruption
                  </Text>
                </div>
              </div>
              <div style={nextStepItem}>
                <span style={nextStepIcon}>📊</span>
                <div>
                  <Text style={nextStepTitle}>Progress Updates</Text>
                  <Text style={nextStepDescription}>
                    You'll receive regular updates about project milestones and progress
                  </Text>
                </div>
              </div>
              <div style={nextStepItem}>
                <span style={nextStepIcon}>💬</span>
                <div>
                  <Text style={nextStepTitle}>Direct Communication</Text>
                  <Text style={nextStepDescription}>
                    Use your dashboard to communicate directly with our team
                  </Text>
                </div>
              </div>
            </div>
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
              WMX Services - Digital Solutions That Drive Growth
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
  backgroundColor: '#00FF00',
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
  fontSize: '32px',
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

const paymentCard = {
  backgroundColor: '#f8f5f2',
  border: '2px solid #111111',
  marginTop: '24px',
  marginBottom: '24px',
};

const paymentHeader = {
  backgroundColor: '#00FF00',
  padding: '12px',
};

const paymentTitle = {
  color: '#111111',
  fontSize: '14px',
  fontWeight: '700',
  letterSpacing: '1px',
  margin: '0',
};

const paymentBody = {
  padding: '20px',
};

const paymentRow = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '12px',
};

const paymentLabel = {
  fontSize: '14px',
  color: '#666666',
  margin: '0',
};

const paymentValue = {
  fontSize: '14px',
  color: '#111111',
  fontWeight: '500',
  margin: '0',
};

const paymentDivider = {
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

const nextStepsSection = {
  backgroundColor: '#FFFFFF',
  border: '3px solid #111111',
  boxShadow: '4px 4px 0px #111111',
  padding: '30px',
  marginBottom: '30px',
};

const nextStepsHeading = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#111111',
  marginBottom: '20px',
};

const nextStepsList = {
  marginTop: '20px',
};

const nextStepItem = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '15px',
  marginBottom: '20px',
};

const nextStepIcon = {
  fontSize: '24px',
};

const nextStepTitle = {
  fontSize: '16px',
  fontWeight: '700',
  color: '#111111',
  marginBottom: '4px',
};

const nextStepDescription = {
  fontSize: '14px',
  color: '#666666',
  margin: '0',
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

export default PaymentConfirmationEmail;
