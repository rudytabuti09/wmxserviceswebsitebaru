# WMX Services - Setup Guide

## 🚨 Fix for CLIENT_FETCH_ERROR

If you're seeing the NextAuth CLIENT_FETCH_ERROR, follow these steps:

### 1. Environment Variables Setup

The error occurs because NextAuth needs specific environment variables. Make sure your `.env` file has:

```env
# NextAuth.js - REQUIRED
NEXTAUTH_SECRET="your-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# GitHub OAuth (optional for development)
GITHUB_CLIENT_ID="your-github-client-id-here"
GITHUB_CLIENT_SECRET="your-github-client-secret-here"
```

### 2. Development Mode (No GitHub OAuth Required)

For development, the app automatically uses a credentials provider when GitHub OAuth is not configured. You can sign in with:

- **Admin User**: `admin@wmx.com`
- **Client User**: `client@wmx.com`

### 3. Database Setup

Before running the application, set up your database:

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init
```

### 4. Start Development Server

```bash
npm run dev
```

### 5. Access the Application

1. Go to `http://localhost:3000`
2. Click "Sign In" 
3. Use the development credentials:
   - Click "🔧 Sign in as Admin" for admin access
   - Click "👤 Sign in as Client" for client access

## 🔧 Production Setup (with GitHub OAuth)

For production, you'll need to:

### 1. Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/applications/new)
2. Create a new OAuth App with:
   - **Application name**: WMX Services
   - **Homepage URL**: `https://yourdomain.com`
   - **Authorization callback URL**: `https://yourdomain.com/api/auth/callback/github`

3. Copy the Client ID and Client Secret to your `.env` file

### 2. Update Environment Variables

```env
GITHUB_CLIENT_ID="your-real-github-client-id"
GITHUB_CLIENT_SECRET="your-real-github-client-secret"
```

### 3. Database Configuration

Update your `DATABASE_URL` for production:

```env
DATABASE_URL="postgresql://username:password@your-db-host:5432/wmx_services"
```

## 🎯 Features Available

### Public Pages
- ✅ Homepage with hero section
- ✅ Portfolio showcase
- ✅ Services page
- ✅ Contact form

### Client Portal (`/client/*`)
- ✅ Dashboard with project overview
- ✅ Project detail with milestone tracking
- ✅ Payment history
- ✅ Real-time chat with admin

### Admin Panel (`/admin/*`)
- ✅ Dashboard with business metrics
- ✅ Project management (CRUD)
- ✅ Portfolio management
- ✅ Chat interface

### Payment Integration
- ✅ Midtrans payment gateway
- ✅ Invoice generation
- ✅ Payment tracking
- ✅ Webhook handling

## 🔍 Troubleshooting

### CLIENT_FETCH_ERROR
- **Cause**: Missing NextAuth environment variables
- **Solution**: Ensure `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are set in `.env`

### Database Connection Error
- **Cause**: PostgreSQL not running or wrong connection string
- **Solution**: Check PostgreSQL service and update `DATABASE_URL`

### Prisma Client Error
- **Cause**: Prisma client not generated or outdated
- **Solution**: Run `npx prisma generate`

### tRPC Error
- **Cause**: Database not migrated or Prisma client issues
- **Solution**: Run `npx prisma migrate dev`

## 📱 Testing the Application

### As Admin User:
1. Sign in as admin
2. Go to `/admin/dashboard`
3. Create projects and portfolio items
4. Manage client communications

### As Client User:
1. Sign in as client
2. Go to `/client/dashboard`
3. View project progress
4. Use chat feature
5. Check payment history

## 🚀 Deployment

The application is ready for deployment to:
- Vercel (recommended)
- Netlify
- Railway
- Any Node.js hosting platform

Make sure to:
1. Set all environment variables
2. Run database migrations
3. Configure GitHub OAuth for production domain
