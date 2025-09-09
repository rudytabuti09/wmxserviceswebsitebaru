# WMX Services - Professional Screenshots

## Required Screenshots for PWA Manifest

To make your PWA appear more professional in app stores and installation prompts, add the following screenshots:

### 1. Desktop Screenshot (`screenshot-desktop.png`)
- **Dimensions**: 1280x720 pixels
- **Content**: Homepage or main dashboard view on desktop
- **Format**: PNG
- **Description**: Should showcase the professional design and key features

### 2. Mobile Screenshot (`screenshot-mobile.png`) 
- **Dimensions**: 390x844 pixels (iPhone 14 dimensions)
- **Content**: Mobile-responsive homepage or key feature
- **Format**: PNG
- **Description**: Should demonstrate mobile-first design and usability

## How to Create Screenshots

### Method 1: Browser Screenshot
1. Open your deployed website in browser
2. Set viewport to exact dimensions above
3. Take screenshot of homepage
4. Save as PNG with exact filenames above

### Method 2: Professional Tools
- Use tools like **Responsive Design Mode** in browser dev tools
- **Figma** or **Sketch** for designed screenshots
- **Screenshot apps** with precise dimension controls

### Method 3: Automated (Recommended)
```bash
# Using Playwright or Puppeteer
npm install playwright
# Create script to generate screenshots automatically
```

## Current Status
🔄 **Screenshots needed** - Remove the `screenshots` section from manifest.json until ready

## Impact on Professional Appearance
✅ **With Screenshots**: 
- Appears in app store style installation prompts
- Shows preview of your app before installation
- Increases user confidence and conversion rates

❌ **Without Screenshots**:
- Basic installation prompt only
- No visual preview of your application
- Still functional, just less appealing

## Next Steps
1. **Create screenshots** using methods above
2. **Add files** to this `/public/images/` directory
3. **Test PWA installation** on mobile and desktop
4. **Verify appearance** in browser installation prompts
