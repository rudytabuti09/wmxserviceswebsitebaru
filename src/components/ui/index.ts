// RetroUI Component Library
// Modern-Retro Professional Design System with React Spring Animations

export { RetroButton } from './retro-button';
export { RetroCard } from './retro-card';
export { RetroInput, RetroTextarea } from './retro-input';
export { RetroProgressBar, ProgressBar } from './progress-bar';
export { RetroChatWindow } from './retro-chat';
export { RetroModal } from './retro-modal';
export { VerificationModal } from './verification-modal';
export { RetroTooltip } from './retro-tooltip';
export { RetroLoader, RetroSpinner } from './retro-loader';
export { AuthMascot } from './auth-mascot';
export { PowerUpMascot } from './power-up-mascot';
export { 
  RetroSkeleton,
  RetroSkeletonCard,
  RetroSkeletonTable,
  RetroSkeletonGrid,
  RetroSkeletonProfile,
  RetroSkeletonChat,
  RetroSkeletonDashboard,
  RetroSkeletonForm 
} from './retro-skeleton';
export { 
  RetroAdminLayout,
  RetroBackButton,
  RetroPageHeader,
  RetroAnimations 
} from './retro-admin-layout';
export { RetroBatchUpload } from './retro-batch-upload';

// Enhanced Text Animation Components
export { SplitText, TypeWriter, GradientText } from './split-text';

// Design System Constants - Updated for 80s Neo-Retro Theme
export const RETRO_COLORS = {
  primary: '#FFC700',        // Bright yellow
  secondary: '#FF3EA5',      // Bright pink
  tertiary: '#00FFFF',       // Cyan accent
  background: '#3D52F1',     // Bright blue background
  foreground: '#111111',     // Deep black text
  card: '#FFFFFF',           // White cards
  muted: '#f1f5f9',
} as const;

export const RETRO_FONTS = {
  heading: 'Poppins',        // Bold headings
  body: 'Inter',             // Body text
} as const;

// Component Size Variants
export const RETRO_SIZES = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl',
} as const;

export type RetroSize = keyof typeof RETRO_SIZES;
