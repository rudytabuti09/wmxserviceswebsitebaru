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

interface ChatNotificationEmailProps {
  recipientName: string;
  senderName: string;
  projectTitle: string;
  message: string;
  timestamp: string;
  chatUrl: string;
  isAdminSender: boolean;
}

export const ChatNotificationEmail = ({ 
  recipientName,
  senderName,
  projectTitle,
  message,
  timestamp,
  chatUrl,
  isAdminSender
}: ChatNotificationEmailProps) => {
  // Truncate message if too long
  const truncateMessage = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Html>
      <Head />
      <Preview>New message from {senderName} about {projectTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerSection}>
            <div style={logoContainer}>
              <Heading style={logo}>WMX SERVICES</Heading>
            </div>
          </Section>

          {/* Notification Badge */}
          <Section style={badgeSection}>
            <div style={badge}>
              <Text style={badgeText}>
                💬 NEW MESSAGE
              </Text>
            </div>
          </Section>

          {/* Main Content */}
          <Section style={contentSection}>
            <Heading style={heading}>
              Hi {recipientName}! 
            </Heading>
            
            <Text style={paragraph}>
              You have a new message in your project chat:
            </Text>

            {/* Message Card */}
            <div style={messageCard}>
              {/* Message Header */}
              <div style={messageHeader}>
                <div style={senderInfo}>
                  <div style={avatarContainer}>
                    <Text style={avatarText}>
                      {senderName.charAt(0).toUpperCase()}
                    </Text>
                  </div>
                  <div>
                    <Text style={senderName}>
                      {senderName} 
                      {isAdminSender && (
                        <span style={roleBadge}> TEAM</span>
                      )}
                    </Text>
                    <Text style={projectName}>
                      Project: {projectTitle}
                    </Text>
                  </div>
                </div>
                <Text style={timestampText}>{timestamp}</Text>
              </div>

              {/* Message Content */}
              <div style={messageContent}>
                <Text style={messageText}>
                  {truncateMessage(message)}
                </Text>
              </div>
            </div>

            <Section style={buttonSection}>
              <Button href={chatUrl} style={primaryButton}>
                View Full Conversation
              </Button>
            </Section>

            <Text style={tipText}>
              💡 <strong>Quick Tip:</strong> You can reply directly in the chat to keep the conversation going. 
              Our {isAdminSender ? 'team' : 'client'} typically responds within 24 hours.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Don't want to receive chat notifications? 
              You can update your preferences in your{' '}
              <Link href={`${chatUrl}/settings`} style={link}>
                account settings
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
  backgroundColor: '#00FFFF',
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

const messageCard = {
  backgroundColor: '#f8f5f2',
  border: '2px solid #111111',
  borderLeft: '4px solid #00FFFF',
  marginTop: '24px',
  marginBottom: '24px',
};

const messageHeader = {
  padding: '16px',
  borderBottom: '1px solid #E0E0E0',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
};

const senderInfo = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const avatarContainer = {
  width: '40px',
  height: '40px',
  backgroundColor: '#FF3EA5',
  border: '2px solid #111111',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const avatarText = {
  color: '#FFFFFF',
  fontSize: '18px',
  fontWeight: '700',
  margin: '0',
};

const senderNameStyle = {
  fontSize: '16px',
  fontWeight: '700',
  color: '#111111',
  margin: '0',
  marginBottom: '4px',
};

const roleBadge = {
  backgroundColor: '#FFC700',
  padding: '2px 6px',
  fontSize: '10px',
  fontWeight: '700',
  marginLeft: '8px',
  border: '1px solid #111111',
};

const projectName = {
  fontSize: '12px',
  color: '#666666',
  margin: '0',
};

const timestampText = {
  fontSize: '12px',
  color: '#999999',
  margin: '0',
};

const messageContent = {
  padding: '20px',
};

const messageText = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#333333',
  margin: '0',
  whiteSpace: 'pre-wrap' as const,
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

const tipText = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#666666',
  backgroundColor: '#f8f5f2',
  padding: '12px',
  border: '1px solid #E0E0E0',
  borderLeft: '3px solid #FFC700',
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

export default ChatNotificationEmail;
