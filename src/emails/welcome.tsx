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
  Img,
  Hr,
} from '@react-email/components';

interface WelcomeEmailProps {
  name: string;
  loginUrl?: string;
}

export const WelcomeEmail = ({ 
  name, 
  loginUrl = 'http://localhost:3000/auth/signin' 
}: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to WMX Services - Your Digital Journey Starts Here!</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerSection}>
            <div style={logoContainer}>
              <Heading style={logo}>WMX SERVICES</Heading>
            </div>
          </Section>

          {/* Welcome Badge */}
          <Section style={badgeSection}>
            <div style={badge}>
              <Text style={badgeText}>🎉 WELCOME ABOARD!</Text>
            </div>
          </Section>

          {/* Main Content */}
          <Section style={contentSection}>
            <Heading style={heading}>
              Hey {name || 'there'}! 
            </Heading>
            
            <Text style={paragraph}>
              Welcome to <strong style={highlight}>WMX Services</strong>! We're absolutely thrilled to have you join our community of innovators and digital enthusiasts.
            </Text>

            <Text style={paragraph}>
              Your account has been successfully created, and you now have access to:
            </Text>

            <div style={featureList}>
              <div style={featureItem}>
                <span style={featureIcon}>🚀</span>
                <Text style={featureText}>Project Dashboard - Track your projects in real-time</Text>
              </div>
              <div style={featureItem}>
                <span style={featureIcon}>💬</span>
                <Text style={featureText}>Direct Chat - Communicate with our team instantly</Text>
              </div>
              <div style={featureItem}>
                <span style={featureIcon}>📊</span>
                <Text style={featureText}>Progress Tracking - Monitor milestones and deliverables</Text>
              </div>
              <div style={featureItem}>
                <span style={featureIcon}>💳</span>
                <Text style={featureText}>Invoice Management - View and pay invoices seamlessly</Text>
              </div>
            </div>

            <Section style={buttonSection}>
              <Button href={loginUrl} style={primaryButton}>
                Access Your Dashboard
              </Button>
            </Section>

            <Text style={paragraph}>
              Need help getting started? Our team is here to assist you every step of the way.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Have questions? Reply to this email or contact us at{' '}
              <Link href="mailto:support@wmx-services.com" style={link}>
                support@wmx-services.com
              </Link>
            </Text>
            
            <Text style={footerText}>
              WMX Services - Digital Solutions That Drive Growth
            </Text>
            
            <div style={socialLinks}>
              <Link href="#" style={socialLink}>Twitter</Link>
              <Text style={socialSeparator}>•</Text>
              <Link href="#" style={socialLink}>LinkedIn</Link>
              <Text style={socialSeparator}>•</Text>
              <Link href="#" style={socialLink}>GitHub</Link>
            </div>

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
  backgroundColor: '#FFC700',
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

const highlight = {
  color: '#E57C23',
};

const featureList = {
  margin: '24px 0',
  padding: '20px',
  backgroundColor: '#f8f5f2',
  border: '2px solid #111111',
};

const featureItem = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '12px',
};

const featureIcon = {
  fontSize: '20px',
  marginRight: '12px',
};

const featureText = {
  fontSize: '14px',
  color: '#333333',
  margin: '0',
  flex: '1',
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

const socialLinks = {
  margin: '20px 0',
};

const socialLink = {
  color: '#E57C23',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: '500',
};

const socialSeparator = {
  display: 'inline-block',
  margin: '0 10px',
  color: '#999999',
};

const copyright = {
  fontSize: '12px',
  color: '#999999',
  marginTop: '20px',
};

export default WelcomeEmail;
