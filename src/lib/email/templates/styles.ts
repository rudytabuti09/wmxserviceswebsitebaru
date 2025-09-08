// Shared 80s Retro Email Styles
export const emailStyles = {
  // Common text styles
  greeting: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#111111',
    marginBottom: '16px',
  },

  text: {
    fontSize: '16px',
    lineHeight: '24px',
    color: '#333333',
    marginBottom: '16px',
  },

  helpText: {
    fontSize: '14px',
    lineHeight: '22px',
    color: '#666666',
    marginBottom: '16px',
    fontStyle: 'italic',
  },

  signature: {
    fontSize: '16px',
    lineHeight: '24px',
    color: '#333333',
    marginTop: '32px',
    marginBottom: '0',
  },

  // Section styles
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#111111',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    marginBottom: '16px',
  },

  divider: {
    borderColor: '#111111',
    borderWidth: '2px',
    margin: '32px 0',
  },

  // Button styles
  primaryButton: {
    backgroundColor: '#FFC700', // Bright yellow
    color: '#111111',
    border: '4px solid #111111',
    boxShadow: '6px 6px 0px #111111',
    padding: '16px 32px',
    fontSize: '16px',
    fontWeight: '800',
    textDecoration: 'none',
    display: 'inline-block',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    textAlign: 'center' as const,
  },

  secondaryButton: {
    backgroundColor: '#FF3EA5', // Bright pink
    color: '#111111',
    border: '4px solid #111111',
    boxShadow: '6px 6px 0px #111111',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '700',
    textDecoration: 'none',
    display: 'inline-block',
    textTransform: 'uppercase' as const,
    textAlign: 'center' as const,
  },

  urgentButton: {
    backgroundColor: '#FF3EA5', // Bright pink for urgent
    color: '#FFFFFF',
    border: '4px solid #111111',
    boxShadow: '6px 6px 0px #111111',
    padding: '16px 32px',
    fontSize: '16px',
    fontWeight: '900',
    textDecoration: 'none',
    display: 'inline-block',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    textAlign: 'center' as const,
    animation: 'pulse 2s infinite',
  },

  // Card/Section styles
  card: {
    backgroundColor: '#FFFFFF',
    border: '3px solid #111111',
    boxShadow: '4px 4px 0px #111111',
    padding: '24px',
    marginBottom: '24px',
  },

  urgentCard: {
    backgroundColor: '#FFE4E1',
    border: '3px solid #FF3EA5',
    boxShadow: '4px 4px 0px #FF3EA5',
    padding: '24px',
    marginBottom: '24px',
  },

  infoCard: {
    backgroundColor: '#E6F3FF',
    border: '3px solid #3D52F1',
    boxShadow: '4px 4px 0px #3D52F1',
    padding: '20px',
    marginBottom: '20px',
  },

  // Progress bar styles
  progressBarContainer: {
    backgroundColor: '#FFFFFF',
    border: '3px solid #111111',
    height: '24px',
    margin: '16px 0',
  },

  progressBarFill: {
    backgroundColor: '#FFC700',
    height: '100%',
    transition: 'width 0.3s ease',
    border: 'none',
  },

  // Form styles
  orText: {
    fontSize: '14px',
    color: '#666666',
    textAlign: 'center' as const,
    margin: '16px 0',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
  },

  // Status styles
  statusSuccess: {
    color: '#00FF88',
    fontWeight: '700',
  },

  statusWarning: {
    color: '#FFC700',
    fontWeight: '700',
  },

  statusError: {
    color: '#FF3EA5',
    fontWeight: '700',
  },

  statusInfo: {
    color: '#3D52F1',
    fontWeight: '700',
  },

  // Utility styles
  textCenter: {
    textAlign: 'center' as const,
  },

  textBold: {
    fontWeight: '700',
  },

  textUppercase: {
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
  },

  // Responsive containers
  ctaSection: {
    textAlign: 'center' as const,
    margin: '32px 0',
  },

  buttonContainer: {
    textAlign: 'center' as const,
    margin: '24px 0',
  },
} as const;

// Color constants
export const RETRO_COLORS = {
  primary: '#3D52F1',     // Bright blue
  accent: '#FFC700',      // Bright yellow
  secondary: '#FF3EA5',   // Bright pink
  tertiary: '#00FFFF',    // Cyan
  success: '#00FF88',     // Bright green
  text: '#111111',        // Black
  textLight: '#333333',   // Dark gray
  textMuted: '#666666',   // Gray
  background: '#FFFFFF',  // White
  border: '#111111',      // Black
} as const;

// Typography presets
export const RETRO_TYPOGRAPHY = {
  display: {
    fontSize: '32px',
    fontWeight: '900',
    textTransform: 'uppercase' as const,
    letterSpacing: '2px',
  },
  
  heading: {
    fontSize: '24px',
    fontWeight: '800',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
  },
  
  subheading: {
    fontSize: '18px',
    fontWeight: '700',
    textTransform: 'uppercase' as const,
  },
  
  body: {
    fontSize: '16px',
    lineHeight: '24px',
    fontWeight: '400',
  },
  
  small: {
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: '500',
  },
} as const;
