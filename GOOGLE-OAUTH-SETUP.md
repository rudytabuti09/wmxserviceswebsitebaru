# Google OAuth Setup Guide

## 🔐 Step-by-step Google Cloud Console Setup

### 1. Create/Access Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Create a new project or select existing project:
   - Click on project dropdown (top left)
   - Click "New Project"
   - Name: `WMX Services` (or your preferred name)
   - Click "Create"

### 2. Enable Google+ API (Required for OAuth)
1. In the Google Cloud Console, go to **APIs & Services > Library**
2. Search for "Google+ API" 
3. Click on "Google+ API" and click **"Enable"**

### 3. Configure OAuth Consent Screen
1. Go to **APIs & Services > OAuth consent screen**
2. Choose **"External"** (unless you have Google Workspace)
3. Fill in required information:
   - **App name**: `WMX Services`
   - **User support email**: Your email
   - **App logo**: Upload your logo (optional)
   - **App domain**: 
     - Homepage: `https://your-domain.vercel.app` (production) or `http://localhost:3000` (development)
   - **Authorized domains**: 
     - `your-domain.vercel.app` (production)
     - `localhost` (development)
   - **Developer contact email**: Your email
4. Click **"Save and Continue"**
5. **Scopes**: Click "Add or Remove Scopes"
   - Add these scopes:
     - `userinfo.email`
     - `userinfo.profile`
     - `openid`
6. Click **"Save and Continue"**
7. **Test users**: Add your email for testing
8. Click **"Save and Continue"**

### 4. Create OAuth 2.0 Credentials
1. Go to **APIs & Services > Credentials**
2. Click **"+ Create Credentials"** → **"OAuth 2.0 Client ID"**
3. Choose **"Web application"**
4. Configure the OAuth client:
   - **Name**: `WMX Services Web Client`
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (for development)
     - `https://your-domain.vercel.app` (for production)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google` (for development)
     - `https://your-domain.vercel.app/api/auth/callback/google` (for production)
5. Click **"Create"**

### 5. Copy Credentials
1. After creation, you'll see a modal with:
   - **Client ID**: Copy this value
   - **Client Secret**: Copy this value
2. Keep these secure - you'll need them for environment variables

### 6. Environment Variables
Add these to your `.env.local` (development) and Vercel environment variables (production):

```bash
# Google OAuth
GOOGLE_CLIENT_ID="your-client-id-here.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret-here"
```

## 🔧 Development vs Production Setup

### Development (localhost:3000)
- Authorized JavaScript origins: `http://localhost:3000`
- Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

### Production (Vercel)
- Authorized JavaScript origins: `https://your-app.vercel.app`
- Authorized redirect URI: `https://your-app.vercel.app/api/auth/callback/google`

## ⚠️ Important Notes

1. **OAuth consent screen** must be configured before credentials work
2. **Test users** must be added during development (when app is not verified)
3. **Domain verification** may be required for production
4. **Redirect URIs** must match exactly (including protocol)
5. Keep your **Client Secret** secure and never expose it in client-side code

## 🛠️ Troubleshooting

### Common Issues:
1. **"redirect_uri_mismatch"**: Check your redirect URI matches exactly
2. **"access_blocked"**: App not verified or user not in test users list
3. **"invalid_client"**: Check Client ID and Secret are correct
4. **"unauthorized_client"**: Check authorized domains and origins

### Verification for Production:
For production use with many users, you may need to:
1. Submit your app for Google verification
2. Add privacy policy and terms of service
3. Complete security assessment

## 📋 Checklist
- [ ] Google Cloud project created
- [ ] Google+ API enabled
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 credentials created
- [ ] Client ID and Secret copied
- [ ] Environment variables set
- [ ] Redirect URIs configured for both dev and prod
- [ ] Test users added (for development)
