import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface BaseTemplateProps {
  preview: string;
  heading: string;
  children: React.ReactNode;
  footerText?: string;
}

export const BaseTemplate: React.FC<BaseTemplateProps> = ({
  preview,
  heading,
  children,
  footerText = 'This email was sent by WMX Services.',
}) => {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo Header */}
          <Section style={logoContainer}>
            <Heading style={h1}>WMX Services</Heading>
          </Section>

          {/* Main Heading */}
          <Heading style={h2}>{heading}</Heading>

          {/* Content */}
          <Section style={content}>
            {children}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerTextStyle}>{footerText}</Text>
            <Link href="https://wmx-services.com" style={link}>
              Visit WMX Services
            </Link>
            <Text style={footerAddress}>
              © 2025 WMX Services. All rights reserved.
              <br />
              Jl. Example Street No. 123, Jakarta, Indonesia
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// 80s Retro Email Styles
const main = {
  backgroundColor: '#3D52F1', // 80s bright blue background
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  padding: '20px',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  maxWidth: '600px',
  border: '4px solid #111111', // Black border
  boxShadow: '8px 8px 0px #111111', // Hard shadow
};

const logoContainer = {
  textAlign: 'center' as const,
  padding: '30px 20px',
  backgroundColor: '#FFC700', // Bright yellow
  borderBottom: '4px solid #111111',
};

const h1 = {
  color: '#111111',
  fontSize: '32px',
  fontWeight: '900',
  textAlign: 'center' as const,
  margin: '0',
  padding: '0',
  textTransform: 'uppercase' as const,
  letterSpacing: '2px',
  fontFamily: 'Poppins, Inter, sans-serif',
};

const h2 = {
  color: '#111111',
  fontSize: '24px',
  fontWeight: '700',
  textAlign: 'center' as const,
  margin: '30px 0 20px',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
};

const content = {
  padding: '40px',
  backgroundColor: '#ffffff',
};

const footer = {
  borderTop: '4px solid #111111',
  backgroundColor: '#FF3EA5', // Bright pink
  padding: '30px 40px',
  textAlign: 'center' as const,
};

const footerTextStyle = {
  color: '#111111',
  fontSize: '14px',
  fontWeight: '600',
  lineHeight: '24px',
  margin: '0 0 15px 0',
};

const footerAddress = {
  color: '#111111',
  fontSize: '12px',
  fontWeight: '500',
  lineHeight: '20px',
  marginTop: '16px',
};

const link = {
  color: '#111111',
  fontSize: '14px',
  fontWeight: '700',
  textDecoration: 'underline',
  textTransform: 'uppercase' as const,
};
