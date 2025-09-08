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

interface ProjectStatusEmailProps {
  clientName: string;
  projectTitle: string;
  previousStatus: string;
  newStatus: string;
  progress: number;
  message?: string;
  milestones?: Array<{
    title: string;
    status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
  }>;
  dashboardUrl: string;
}

export const ProjectStatusEmail = ({ 
  clientName,
  projectTitle,
  previousStatus,
  newStatus,
  progress,
  message,
  milestones,
  dashboardUrl
}: ProjectStatusEmailProps) => {
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return '#00FF00';
      case 'IN_PROGRESS':
        return '#FFC700';
      case 'REVIEW':
        return '#00FFFF';
      case 'PLANNING':
        return '#FF3EA5';
      default:
        return '#999999';
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return '✅';
      case 'IN_PROGRESS':
        return '🚀';
      case 'REVIEW':
        return '👀';
      case 'PLANNING':
        return '📋';
      default:
        return '📊';
    }
  };

  const getMilestoneEmoji = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return '✅';
      case 'IN_PROGRESS':
        return '⏳';
      case 'PENDING':
        return '⏸️';
      default:
        return '📌';
    }
  };

  return (
    <Html>
      <Head />
      <Preview>Project Update: {projectTitle} - Status Changed</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerSection}>
            <div style={logoContainer}>
              <Heading style={logo}>WMX SERVICES</Heading>
            </div>
          </Section>

          {/* Status Update Badge */}
          <Section style={badgeSection}>
            <div style={{
              ...badge,
              backgroundColor: getStatusColor(newStatus),
            }}>
              <Text style={badgeText}>
                {getStatusEmoji(newStatus)} PROJECT UPDATE
              </Text>
            </div>
          </Section>

          {/* Main Content */}
          <Section style={contentSection}>
            <Heading style={heading}>
              Hi {clientName}! 👋
            </Heading>
            
            <Text style={paragraph}>
              Great news! There's been an update on your project:
            </Text>

            {/* Project Card */}
            <div style={projectCard}>
              <Text style={projectTitle}>{projectTitle}</Text>
              
              {/* Status Change */}
              <div style={statusChangeContainer}>
                <div style={statusItem}>
                  <Text style={statusLabel}>Previous Status:</Text>
                  <div style={{
                    ...statusBadge,
                    backgroundColor: getStatusColor(previousStatus),
                  }}>
                    <Text style={statusBadgeText}>
                      {previousStatus.replace('_', ' ')}
                    </Text>
                  </div>
                </div>
                
                <div style={arrow}>→</div>
                
                <div style={statusItem}>
                  <Text style={statusLabel}>New Status:</Text>
                  <div style={{
                    ...statusBadge,
                    backgroundColor: getStatusColor(newStatus),
                  }}>
                    <Text style={statusBadgeText}>
                      {newStatus.replace('_', ' ')}
                    </Text>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={progressSection}>
                <Text style={progressLabel}>Overall Progress: {progress}%</Text>
                <div style={progressBarBackground}>
                  <div style={{
                    ...progressBarFill,
                    width: `${progress}%`,
                  }} />
                </div>
              </div>

              {/* Custom Message */}
              {message && (
                <div style={messageBox}>
                  <Text style={messageText}>📝 {message}</Text>
                </div>
              )}

              {/* Milestones */}
              {milestones && milestones.length > 0 && (
                <div style={milestonesSection}>
                  <Text style={milestonesTitle}>Milestone Progress:</Text>
                  {milestones.map((milestone, index) => (
                    <div key={index} style={milestoneItem}>
                      <span>{getMilestoneEmoji(milestone.status)}</span>
                      <Text style={milestoneText}>
                        {milestone.title} - {milestone.status.replace('_', ' ')}
                      </Text>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Section style={buttonSection}>
              <Button href={dashboardUrl} style={primaryButton}>
                View Project Details
              </Button>
            </Section>

            <Text style={paragraph}>
              {newStatus === 'COMPLETED' 
                ? `🎉 Congratulations! Your project has been completed. Thank you for trusting WMX Services with your digital needs.`
                : newStatus === 'REVIEW'
                ? `Your project is now in review. We'll notify you once we have feedback or when it's ready for the next phase.`
                : `Your project is progressing smoothly. Our team is working hard to deliver excellent results.`}
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Have questions about this update? Reply to this email or contact us at{' '}
              <Link href="mailto:projects@wmx-services.com" style={link}>
                projects@wmx-services.com
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

const projectCard = {
  backgroundColor: '#f8f5f2',
  border: '2px solid #111111',
  padding: '20px',
  marginTop: '24px',
  marginBottom: '24px',
};

const projectTitle = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#111111',
  marginBottom: '16px',
  display: 'block',
};

const statusChangeContainer = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '16px',
  marginBottom: '20px',
};

const statusItem = {
  textAlign: 'center' as const,
};

const statusLabel = {
  fontSize: '12px',
  color: '#666666',
  marginBottom: '8px',
  display: 'block',
};

const statusBadge = {
  display: 'inline-block',
  padding: '6px 12px',
  border: '2px solid #111111',
  boxShadow: '2px 2px 0px #111111',
};

const statusBadgeText = {
  fontSize: '14px',
  fontWeight: '700',
  color: '#111111',
  textTransform: 'uppercase' as const,
  margin: '0',
};

const arrow = {
  fontSize: '24px',
  color: '#111111',
  fontWeight: '700',
};

const progressSection = {
  marginTop: '20px',
  marginBottom: '20px',
};

const progressLabel = {
  fontSize: '14px',
  color: '#111111',
  fontWeight: '600',
  marginBottom: '8px',
  display: 'block',
};

const progressBarBackground = {
  backgroundColor: '#FFFFFF',
  border: '2px solid #111111',
  height: '20px',
  position: 'relative' as const,
};

const progressBarFill = {
  backgroundColor: '#FFC700',
  height: '100%',
  transition: 'width 0.3s ease',
};

const messageBox = {
  backgroundColor: '#FFFFFF',
  border: '2px solid #111111',
  padding: '12px',
  marginTop: '16px',
};

const messageText = {
  fontSize: '14px',
  color: '#333333',
  margin: '0',
};

const milestonesSection = {
  marginTop: '20px',
  paddingTop: '20px',
  borderTop: '2px solid #E0E0E0',
};

const milestonesTitle = {
  fontSize: '16px',
  fontWeight: '700',
  color: '#111111',
  marginBottom: '12px',
  display: 'block',
};

const milestoneItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '8px',
};

const milestoneText = {
  fontSize: '14px',
  color: '#666666',
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

export default ProjectStatusEmail;
