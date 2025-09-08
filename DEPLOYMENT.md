# WMX Services - Vercel Deployment Guide

## 🚀 Pre-Deployment Checklist

✅ Build passes locally (`npm run build`)  
✅ Environment variables configured  
✅ Database schema migrated  
✅ External services setup (Database, OAuth, Email, etc.)  

---

## 📋 Required Environment Variables

Set these in your Vercel dashboard under **Settings > Environment Variables**:

### Core Configuration
```bash
# Database (Required)
DATABASE_URL="postgresql://user:pass@host:port/dbname"

# NextAuth (Required)
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="your-generated-secret-key"

# OAuth Provider (Choose one)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
# OR
GOOGLE_CLIENT_ID="your-google-client-id" 
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Email Service (Required for auth)
```bash
# Option 1: Resend (Recommended)
RESEND_API_KEY="re_xxxxxxxxxx"
EMAIL_FROM="noreply@yourdomain.com"

# Option 2: Gmail SMTP
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-16-char-app-password"
EMAIL_FROM="WMX Services <noreply@yourdomain.com>"
```

### Payment Gateway (Optional)
```bash
MIDTRANS_SERVER_KEY="your-server-key"
MIDTRANS_CLIENT_KEY="your-client-key"
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="your-client-key"
MIDTRANS_IS_PRODUCTION="false"
```

### File Storage (Optional)
```bash
R2_ACCOUNT_ID="your-r2-account-id"
R2_ACCESS_KEY_ID="your-access-key"
R2_SECRET_ACCESS_KEY="your-secret-key"
R2_BUCKET_NAME="wmx-uploads"
R2_PUBLIC_URL="https://your-r2-domain.com"
```

### Additional
```bash
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
CSRF_SECRET="your-csrf-secret"
```

---

## 🗄️ Database Setup

### Option 1: Vercel Postgres (Recommended)
1. Go to Vercel Dashboard → Storage → Create Database
2. Choose **Postgres**
3. Copy connection string to `DATABASE_URL`

### Option 2: External Database (Railway, PlanetScale, etc.)
1. Create PostgreSQL database on your preferred platform
2. Copy connection string to `DATABASE_URL`

---

## 🔐 OAuth Setup

### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create **New OAuth App**:
   - Application name: `WMX Services`
   - Homepage URL: `https://your-app.vercel.app`
   - Authorization callback URL: `https://your-app.vercel.app/api/auth/callback/github`
3. Copy Client ID & Client Secret to Vercel env vars

### Google OAuth (Alternative)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project → Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs: `https://your-app.vercel.app/api/auth/callback/google`

---

## 📧 Email Service Setup

### Resend (Recommended)
1. Sign up at [Resend](https://resend.com/)
2. Verify your domain (or use `resend.dev` for testing)
3. Generate API key from dashboard
4. Add to Vercel: `RESEND_API_KEY`

---

## 🚀 Deployment Steps

### Method 1: Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Method 2: GitHub Integration
1. Push code to GitHub repository
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click **Import Project**
4. Select your GitHub repository
5. Configure environment variables
6. Deploy

---

## 🔧 Post-Deployment Setup

### 1. Run Database Migrations
```bash
# Using Vercel CLI
vercel env pull .env.local
npx prisma migrate deploy

# Or add to vercel.json build command (already configured)
```

### 2. Update OAuth Callback URLs
Update your OAuth providers with production URLs:
- GitHub: `https://your-app.vercel.app/api/auth/callback/github`
- Google: `https://your-app.vercel.app/api/auth/callback/google`

### 3. Configure Payment Webhooks (if using Midtrans)
1. Go to Midtrans Dashboard → Settings → Configuration
2. Set Payment Notification URL: `https://your-app.vercel.app/api/payment/webhook`

### 4. Test Critical Flows
- [ ] Authentication (sign in/up)
- [ ] Database connection
- [ ] Email sending
- [ ] File uploads (if configured)
- [ ] Payment processing (if configured)

---

## 🛠️ Troubleshooting

### Build Failures
- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Verify database connection string

### Authentication Issues
- Verify NEXTAUTH_URL matches your domain
- Check OAuth callback URLs
- Ensure NEXTAUTH_SECRET is set

### Database Issues
- Verify DATABASE_URL connection string
- Check if migrations ran successfully
- Ensure database is accessible from Vercel

### Email Issues
- Verify email service credentials
- Check EMAIL_FROM domain is verified
- Test with a simple test email

---

## 📊 Monitoring & Analytics

### Optional: Add Analytics
```bash
# Google Analytics
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"

# Vercel Analytics (automatic with Vercel Pro)
```

### Optional: Error Monitoring
```bash
# Sentry
SENTRY_DSN="your-sentry-dsn"
```

---

## 🎯 Performance Optimization

The project is pre-configured with:
- ✅ Next.js 15 with App Router
- ✅ Image optimization
- ✅ Bundle optimization
- ✅ Function timeout configuration
- ✅ Edge runtime where applicable

---

## 🆘 Support

If you encounter issues:
1. Check Vercel build/function logs
2. Verify all environment variables
3. Test locally with production environment variables
4. Check external service (database, email, etc.) status

---

## 📝 Additional Notes

- The app uses PostgreSQL - ensure your database provider is compatible
- File uploads require R2/S3 configuration
- Payment features require Midtrans setup
- Cron jobs are configured for invoice reminders (Vercel Pro required)
- Security headers and CSP are pre-configured
