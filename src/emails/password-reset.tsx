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

interface PasswordResetEmailProps {
  name: string;
  resetUrl: string;
  expirationTime?: string;
}

export const PasswordResetEmail = ({ 
  name, 
  resetUrl,
  expirationTime = '1 hour'
}: PasswordResetEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Reset your WMX Services password - Action required</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerSection}>
            <div style={logoContainer}>
              <Heading style={logo}>WMX SERVICES</Heading>
            </div>
          </Section>

          {/* Security Badge */}
          <Section style={badgeSection}>
            <div style={badge}>
              <Text style={badgeText}>🔒 PASSWORD RESET</Text>
            </div>
          </Section>

          {/* Main Content */}
          <Section style={contentSection}>
            <Heading style={heading}>
              Hi {name}! 
            </Heading>
            
            <Text style={paragraph}>
              We received a request to reset your password for your WMX Services account. 
              Don't worry - we've got you covered! 🚀
            </Text>

            {/* Security Info Card */}
            <div style={securityCard}>
              <Text style={securityTitle}>🔐 SECURITY NOTICE</Text>
              <Text style={securityText}>
                This password reset link is valid for <strong>{expirationTime}</strong> only. 
                If you didn't request this reset, please ignore this email - your account remains secure.
              </Text>
            </div>

            <Text style={paragraph}>
              Ready to create a new password? Click the button below to get started:
            </Text>

            <Section style={buttonSection}>
              <Button href={resetUrl} style={primaryButton}>
                Reset My Password
              </Button>
            </Section>

            {/* Alternative Link */}
            <div style={alternativeSection}>
              <Text style={alternativeText}>
                Button not working? Copy and paste this link into your browser:
              </Text>
              <Text style={linkText}>
                <Link href={resetUrl} style={rawLink}>
                  {resetUrl}
                </Link>
              </Text>
            </div>

            {/* Security Tips */}
            <div style={tipsCard}>
              <Text style={tipsTitle}>💡 PASSWORD TIPS</Text>
              <Text style={tipsItem}>• Use at least 8 characters</Text>
              <Text style={tipsItem}>• Include uppercase and lowercase letters</Text>
              <Text style={tipsItem}>• Add numbers and special characters</Text>
              <Text style={tipsItem}>• Avoid common words or personal info</Text>
            </div>

            <Text style={paragraph}>
              Having trouble? Our support team is here to help! Just reply to this email 
              and we'll get you back on track.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              This email was sent because a password reset was requested for your account. 
              If you didn't make this request, you can safely ignore this email.
            </Text>
            
            <Text style={footerText}>
              For security questions, contact us at{' '}
              <Link href="mailto:security@wmx-services.com" style={link}>
                security@wmx-services.com
              </Link>
            </Text>

            <div style={socialLinks}>
              <Link href="#" style={socialLink}>Twitter</Link>
              <Text style={socialSeparator}>•</Text>
              <Link href="#" style={socialLink}>LinkedIn</Link>
              <Text style={socialSeparator}>•</Text>
              <Link href="#" style={socialLink}>Website</Link>
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
  backgroundColor: '#FF3EA5',
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

const securityCard = {
  backgroundColor: '#FFE4E1',
  border: '2px solid #FF3EA5',
  boxShadow: '2px 2px 0px #FF3EA5',
  padding: '16px',
  marginTop: '24px',
  marginBottom: '24px',
};

const securityTitle = {
  fontSize: '14px',
  fontWeight: '700',
  color: '#111111',
  marginBottom: '8px',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
};

const securityText = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#333333',
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

const alternativeSection = {
  backgroundColor: '#f8f5f2',
  padding: '16px',
  border: '1px solid #E0E0E0',
  marginTop: '24px',
  marginBottom: '24px',
};

const alternativeText = {
  fontSize: '14px',
  color: '#666666',
  marginBottom: '8px',
};

const linkText = {
  fontSize: '12px',
  wordBreak: 'break-all' as const,
};

const rawLink = {
  color: '#3D52F1',
  textDecoration: 'underline',
};

const tipsCard = {
  backgroundColor: '#E6F3FF',
  border: '2px solid #3D52F1',
  boxShadow: '2px 2px 0px #3D52F1',
  padding: '16px',
  marginTop: '24px',
  marginBottom: '24px',
};

const tipsTitle = {
  fontSize: '14px',
  fontWeight: '700',
  color: '#111111',
  marginBottom: '12px',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
};

const tipsItem = {
  fontSize: '14px',
  color: '#333333',
  marginBottom: '4px',
  display: 'block',
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

export default PasswordResetEmail;
