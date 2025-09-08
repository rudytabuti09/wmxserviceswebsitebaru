# WMX Services Design System
## 80s Neo-Retro Digital Theme

### 🎨 Design Philosophy
The WMX Services design system embodies a **Bold 80s Neo-Retro Digital** aesthetic that combines vibrant colors, sharp geometric shapes, and nostalgic gaming elements with modern functionality. The design creates an energetic, memorable experience that stands out while maintaining excellent usability.

---

## 📋 Design Specifications

### Color Palette
```css
/* 80s Vibrant Color System */
--color-background: #3D52F1      /* Bright blue background */
--color-primary: #FFC700         /* Bright yellow accent */
--color-secondary: #FF3EA5       /* Bright pink secondary */
--color-tertiary: #00FFFF        /* Cyan accent */
--color-text: #111111            /* Deep black text */
--color-card: #FFFFFF            /* White for cards */
--color-border: #111111          /* Black borders */
--color-grid: rgba(255, 199, 0, 0.1) /* Grid pattern overlay */

/* Hover & Active States */
--color-primary-hover: #FFD700   /* Golden yellow on hover */
--color-secondary-hover: #FF69B4 /* Hot pink on hover */
--color-background-alt: #1A1F4E  /* Darker blue variant */

/* Shadow System */
--shadow-default: 4px 4px 0px #111111
--shadow-hover: 6px 6px 0px #111111
--shadow-active: 2px 2px 0px #111111
```

### Typography
```css
/* Primary Font - Headings */
font-family: 'Poppins', sans-serif
/* Usage: All headings, titles, display text, and buttons */
/* Weight: 700, 800, 900 for bold impact */

/* Secondary Font - Body */
font-family: 'Inter', ui-sans-serif, system-ui
/* Usage: Body text, descriptions, UI elements */
/* Weight: 400, 500, 600 for readability */

/* Text Styling */
text-transform: uppercase  /* For headings and buttons */
letter-spacing: 2px       /* For increased readability */
```

### Typography Scale
- **Display**: `text-6xl lg:text-8xl` (96px-128px) - Hero headings
- **Heading XL**: `text-5xl lg:text-6xl` (60px-96px) - Section headings
- **Heading LG**: `text-4xl lg:text-5xl` (48px-60px) - Sub-headings
- **Heading MD**: `text-3xl lg:text-4xl` (36px-48px) - Card titles
- **Heading SM**: `text-2xl lg:text-3xl` (24px-36px) - Small headings
- **Body XL**: `text-xl lg:text-2xl` (20px-24px) - Lead paragraphs
- **Body LG**: `text-lg lg:text-xl` (18px-20px) - Large body text
- **Body Base**: `text-base lg:text-lg` (16px-18px) - Default body text

---

## 🧩 Component Library

### RetroButton
80s-style button component with hard shadows and bold colors.

**Variants:**
- `primary` - Yellow accent (#FFC700) with black border
- `secondary` - Pink accent (#FF3EA5) with black border
- `outline` - White background with black border

**Features:**
- No border-radius (sharp corners)
- Black border (2px solid #111111)
- Hard shadow (4px 4px 0px #111111)
- Hover effect: translate(-2px, -2px) with deeper shadow
- Text in uppercase with bold weight
- Transform animation on hover

### RetroCard
80s-style card component with hard edges and bold borders.

**Features:**
- Pure white background (#FFFFFF)
- No border-radius (sharp corners)
- Black border (2px solid #111111)
- Hard shadow (6px 6px 0px #111111)
- Hover: translate(-3px, -3px) with pink border
- Configurable padding (sm: 16px, md: 24px, lg: 32px)

### RetroInput & RetroTextarea
Form input components with 80s styling.

**Features:**
- White background with black border
- No border-radius
- Focus: yellow border (#FFC700) with glow
- Black text (#111111)
- Uppercase labels with bold weight

### RetroProgressBar
Progress indicator with vibrant 80s colors.

**Features:**
- Yellow fill (#FFC700) on gray background
- Black border around bar
- Animated fill transitions
- Optional percentage display in bold
- Size variants (sm, md, lg)

### RetroChatWindow
Chat interface component for client communication.

**Features:**
- Bubble differentiation (user vs. other)
- Timestamp display
- Message composition area
- Responsive design

### Additional Components
- **RetroModal** - Overlay dialogs
- **RetroTooltip** - Contextual information
- **RetroLoader** - Loading animations
- **RetroSpinner** - Minimal loading indicator

---

## 🎯 Layout Guidelines

### Spacing System
```css
/* Section Padding */
.section-padding { @apply py-28; }

/* Container Spacing */
.container-spacing { @apply px-6 sm:px-8 lg:px-12; }

/* Content Max Width */
.content-max-width { @apply max-w-5xl mx-auto; }
.text-max-width { @apply max-w-3xl mx-auto; }
```

### Grid System
- **Mobile**: Single column layouts
- **Tablet**: 2-column grids for content
- **Desktop**: 3-column grids for services/features

### Responsive Breakpoints
- `sm`: 640px - Tablet portrait
- `md`: 768px - Tablet landscape
- `lg`: 1024px - Desktop
- `xl`: 1280px - Large desktop

---

## ✨ Design Principles

### 1. **Bold Geometric Shapes**
- Sharp corners and edges (no border-radius)
- Hard drop shadows for depth
- Grid patterns and geometric backgrounds
- Strong black borders on all elements

### 2. **Vibrant Color Contrast**
- High-contrast color combinations
- Bright primary colors (Yellow, Pink, Cyan)
- Black borders for definition
- White cards on blue background

### 3. **Typography Impact**
- Uppercase text for headings and buttons
- Bold weights (700-900) for emphasis
- Poppins for powerful headings
- Letter-spacing for retro feel

### 4. **Dynamic Interactions**
- Transform animations on hover
- Color shifts between states
- Shadow depth changes
- Instant visual feedback

### 5. **Nostalgic Elements**
- Grid pattern overlays
- Pixelated or geometric decorations
- Glitch and glow effects
- Retro gaming references

---

## 🔧 Utility Classes

### Typography Utilities
```css
.heading-display   /* Display headings */
.heading-xl        /* Extra large headings */
.heading-lg        /* Large headings */
.heading-md        /* Medium headings */
.heading-sm        /* Small headings */
.body-xl           /* Extra large body text */
.body-lg           /* Large body text */
.body-base         /* Base body text */
```

### Effect Utilities
```css
.retro-glow        /* Subtle glow effect */
.retro-hover       /* Hover transform */
.retro-focus       /* Focus ring styles */
```

### Layout Utilities
```css
.section-padding   /* Standard section padding */
.container-spacing /* Container horizontal padding */
.content-max-width /* Content area max-width */
.text-max-width    /* Text content max-width */
```

---

## 📱 Responsive Design

The design system is **mobile-first** with progressive enhancement:

1. **Mobile (320px+)**: Single column, stacked elements
2. **Tablet (768px+)**: Two-column layouts, enhanced spacing
3. **Desktop (1024px+)**: Three-column grids, full features
4. **Large (1280px+)**: Maximum content width, optimal viewing

---

## 🚀 Implementation

Import components from the centralized UI library:

```typescript
import {
  RetroButton,
  RetroCard,
  RetroInput,
  RetroProgressBar,
  RetroChatWindow,
  RetroModal,
  RETRO_COLORS,
  RETRO_FONTS
} from '@/components/ui';
```

This ensures consistency across the entire application and makes maintenance easier.

---

*This design system creates a cohesive, professional, and modern-retro aesthetic that builds trust and enhances user experience.*
