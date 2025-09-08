# WMX Services Logo and Icons Guide

## Required Icon Sizes

To complete the professional branding setup, you need to create the following icon files in this directory:

### Favicon and Basic Icons
- `favicon.ico` (16x16, 32x32, 48x48) - Main favicon
- `icon-192x192.png` - Standard web icon
- `icon-512x512.png` - High resolution web icon

### PWA Icons (Progressive Web App)
- `icon-72x72.png`
- `icon-96x96.png`
- `icon-128x128.png`
- `icon-144x144.png`
- `icon-152x152.png`
- `icon-384x384.png`

### Apple Icons
- `icon-180x180.png` - Apple touch icon
- `safari-pinned-tab.svg` - Safari pinned tab icon (monochrome)

### Windows Tiles
- `mstile-70x70.png`
- `mstile-150x150.png`
- `mstile-310x310.png`
- `mstile-310x150.png` (wide tile)

### Social Media Images
- `/images/wmx-services-og.png` (1200x630) - OpenGraph image
- `/images/wmx-services-twitter.png` (1200x675) - Twitter card image

## Design Guidelines

### Brand Colors
- **Primary Blue**: #3D52F1
- **Background**: White or #F8FAFC
- **Text**: #111111

### Logo Requirements
1. **Simple and Clean**: The logo should be recognizable at 16x16 pixels
2. **Brand Consistency**: Use the WMX Services brand colors
3. **Professional Look**: Modern, tech-focused design
4. **Scalable**: Should look good from 16x16 to 512x512 pixels

### Recommended Tools
- **Online**: Favicon.io, RealFaviconGenerator.net
- **Design**: Figma, Adobe Illustrator, Canva Pro
- **Free**: GIMP, Inkscape

## Quick Setup

1. Create your main logo design (preferably as SVG)
2. Use favicon generators to create all required sizes
3. Replace the existing `favicon.ico` in `/src/app/`
4. Add all generated icons to this `/public/icons/` directory
5. Create social media images in `/public/images/`

## Current Status
- ✅ Metadata setup complete
- ✅ PWA manifest configured
- ✅ Browser configuration ready
- ❌ Logo files need to be created
- ❌ Social media images need to be created

Once you add the logo files, your website will have:
- Professional favicon in browser tabs
- App icons for mobile devices
- Social media preview images
- PWA support for "Add to Home Screen"
- Windows tile support
