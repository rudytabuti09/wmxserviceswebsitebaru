// RetroUI Component Library
// Modern-Retro Professional Design System

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

// Design System Constants
export const RETRO_COLORS = {
  primary: '#E57C23',
  background: '#F8F5F2',
  foreground: '#333333',
  card: '#FFFFFF',
  muted: '#f1f5f9',
} as const;

export const RETRO_FONTS = {
  serif: 'Playfair Display',
  sans: 'Inter',
} as const;

// Component Size Variants
export const RETRO_SIZES = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl',
} as const;

export type RetroSize = keyof typeof RETRO_SIZES;
