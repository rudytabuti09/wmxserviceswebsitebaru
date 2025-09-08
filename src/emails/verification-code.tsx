import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Img,
  Hr,
  Preview,
  Heading,
} from '@react-email/components';

interface VerificationCodeEmailProps {
  userName?: string;
  verificationCode: string;
  expiresIn?: string; // e.g., "10 minutes"
}

export const VerificationCodeEmail: React.FC<VerificationCodeEmailProps> = ({
  userName = 'there',
  verificationCode,
  expiresIn = '10 minutes',
}) => {
  const previewText = `Your verification code is ${verificationCode}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with retro styling */}
          <Section style={header}>
            <Heading style={h1}>WMX SERVICES</Heading>
            <Text style={tagline}>DIGITAL AGENCY</Text>
          </Section>

          <Section style={content}>
            <Heading as="h2" style={h2}>
              Verify Your Email Address
            </Heading>
            
            <Text style={text}>
              Hi {userName},
            </Text>
            
            <Text style={text}>
              Welcome to WMX Services! Please use the verification code below to complete your signup:
            </Text>

            {/* Verification Code Box */}
            <Section style={codeContainer}>
              <Text style={codeText}>{verificationCode}</Text>
            </Section>

            <Text style={smallText}>
              This code will expire in {expiresIn}. If you didn't request this code, please ignore this email.
            </Text>

            <Hr style={hr} />

            <Text style={footerText}>
              Having trouble? Contact our support team at support@wmx-services.com
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerCopy}>
              © {new Date().getFullYear()} WMX Services. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Retro 80s-inspired email styles
const main = {
  backgroundColor: '#f0f0f0',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  borderRadius: '8px',
  border: '3px solid #111111',
  boxShadow: '6px 6px 0px #111111',
  overflow: 'hidden',
  maxWidth: '600px',
};

const header = {
  backgroundColor: '#3D52F1', // Bright blue from the retro theme
  padding: '30px 40px',
  textAlign: 'center' as const,
};

const h1 = {
  color: '#FFC700', // Yellow from retro theme
  fontSize: '32px',
  fontWeight: '800',
  letterSpacing: '2px',
  margin: '0',
  textTransform: 'uppercase' as const,
  textShadow: '3px 3px 0px rgba(0,0,0,0.2)',
};

const tagline = {
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  letterSpacing: '3px',
  margin: '8px 0 0',
  textTransform: 'uppercase' as const,
};

const content = {
  padding: '40px',
};

const h2 = {
  color: '#111111',
  fontSize: '24px',
  fontWeight: '700',
  lineHeight: '1.3',
  margin: '0 0 20px',
};

const text = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 20px',
};

const codeContainer = {
  backgroundColor: '#FFC700', // Yellow background
  border: '3px solid #111111',
  borderRadius: '8px',
  margin: '30px 0',
  padding: '20px',
  textAlign: 'center' as const,
  boxShadow: '4px 4px 0px #FF3EA5', // Pink shadow for retro effect
};

const codeText = {
  color: '#111111',
  fontSize: '36px',
  fontWeight: '800',
  letterSpacing: '8px',
  margin: '0',
  fontFamily: 'Monaco, Consolas, "Courier New", monospace',
};

const smallText = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '20px 0',
};

const hr = {
  borderColor: '#e0e0e0',
  margin: '30px 0',
};

const footerText = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0',
};

const footer = {
  borderTop: '3px solid #111111',
  backgroundColor: '#f8f8f8',
  padding: '20px 40px',
  textAlign: 'center' as const,
};

const footerCopy = {
  color: '#999999',
  fontSize: '12px',
  margin: '0',
};

export default VerificationCodeEmail;
