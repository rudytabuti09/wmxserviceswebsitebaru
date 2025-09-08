# Authentication Providers Setup Guide

WMX Services sekarang mendukung multiple authentication methods untuk memberikan pengalaman login yang lebih user-friendly.

## 📋 Supported Authentication Methods

1. **Google OAuth** (Recommended) - Most users have Google accounts
2. **GitHub OAuth** - Good for developer-focused apps
3. **Email + Password** - Traditional signup/signin
4. **Magic Link** - Passwordless email authentication

## 🚀 Quick Setup

### Step 1: Generate NextAuth Secret

```bash
# Generate a secure secret key
openssl rand -base64 32
```

Add to your `.env.local`:
```env
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

### Step 2: Choose Your Providers

## 🔐 Provider Setup Instructions

### Google OAuth Setup

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Create a new project or select existing

2. **Enable APIs**
   - Go to "APIs & Services" → "Library"
   - Search and enable "Google+ API"

3. **Create OAuth Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Add Authorized redirect URIs:
     ```
     http://localhost:3000/api/auth/callback/google
     https://yourdomain.com/api/auth/callback/google
     ```

4. **Add to Environment Variables**
   ```env
   GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```

### GitHub OAuth Setup

1. **Create GitHub OAuth App**
   - Go to: https://github.com/settings/developers
   - Click "New OAuth App"

2. **Configure Application**
   ```
   Application name: WMX Services
   Homepage URL: http://localhost:3000
   Authorization callback URL: http://localhost:3000/api/auth/callback/github
   ```

3. **Add to Environment Variables**
   ```env
   GITHUB_CLIENT_ID="your-client-id"
   GITHUB_CLIENT_SECRET="your-client-secret"
   ```

### Email Provider Setup (Magic Links)

#### Option 1: Gmail (Development)

1. **Enable 2-Factor Authentication**
   - Go to: https://myaccount.google.com/security

2. **Generate App Password**
   - Visit: https://myaccount.google.com/apppasswords
   - Select "Mail" and generate password

3. **Configure Environment**
   ```env
   EMAIL_SERVER_HOST="smtp.gmail.com"
   EMAIL_SERVER_PORT="587"
   EMAIL_SERVER_USER="your-email@gmail.com"
   EMAIL_SERVER_PASSWORD="your-16-char-app-password"
   EMAIL_FROM="WMX Services <your-email@gmail.com>"
   ```

#### Option 2: SendGrid (Production)

1. **Create SendGrid Account**
   - Sign up at: https://sendgrid.com/

2. **Generate API Key**
   - Go to Settings → API Keys
   - Create Full Access key

3. **Configure Environment**
   ```env
   EMAIL_SERVER_HOST="smtp.sendgrid.net"
   EMAIL_SERVER_PORT="587"
   EMAIL_SERVER_USER="apikey"
   EMAIL_SERVER_PASSWORD="SG.your-api-key"
   EMAIL_FROM="WMX Services <noreply@yourdomain.com>"
   ```

## 🔧 Database Migration

After setting up providers, run migration to add password field:

```bash
# Generate Prisma client
npx prisma generate

# Run migration
npx prisma migrate dev --name add-password-field

# Optional: Seed admin user
npm run db:seed
```

## 🎨 Sign-In Page Features

The new sign-in page (`/auth/signin`) includes:

- ✅ **Google Sign-In** - One-click with Google account
- ✅ **GitHub Sign-In** - Perfect for developers
- ✅ **Email/Password** - Traditional authentication
- ✅ **Sign Up** - New user registration
- ✅ **Magic Link** - Passwordless login via email
- ✅ **Remember Me** - Session persistence
- ✅ **Error Handling** - User-friendly error messages
- ✅ **Loading States** - Visual feedback during authentication

## 🛡️ Security Features

- **Password Hashing**: Using bcrypt with salt rounds
- **CSRF Protection**: Built-in with NextAuth
- **Secure Sessions**: JWT with encryption
- **Rate Limiting**: Prevent brute force (add middleware if needed)
- **Email Verification**: For magic links
- **OAuth State**: Prevent CSRF in OAuth flow

## 📝 Usage Examples

### Sign Up New User

```javascript
// POST /api/auth/signup
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe" // optional
}
```

### Sign In with Credentials

```javascript
signIn("credentials", {
  email: "user@example.com",
  password: "securepassword123",
  redirect: false
});
```

### Sign In with OAuth

```javascript
// Google
signIn("google", { callbackUrl: "/dashboard" });

// GitHub
signIn("github", { callbackUrl: "/dashboard" });
```

### Send Magic Link

```javascript
signIn("email", {
  email: "user@example.com",
  redirect: false
});
```

## 🐛 Troubleshooting

### Google OAuth Issues
- **Error: redirect_uri_mismatch**
  - Check that callback URL exactly matches in Google Console
  - Include both http and https versions

### Email Not Sending
- **Gmail**: Make sure using App Password, not regular password
- **Check spam folder**
- **Verify SMTP settings**

### Database Issues
- Run `npx prisma generate` after schema changes
- Ensure DATABASE_URL is correct
- Check if password field exists in User model

### Session Not Persisting
- Check NEXTAUTH_SECRET is set
- Clear browser cookies
- Verify NEXTAUTH_URL matches your domain

## 🚀 Production Checklist

- [ ] Use strong NEXTAUTH_SECRET (32+ characters)
- [ ] Update NEXTAUTH_URL to production domain
- [ ] Use production OAuth redirect URLs
- [ ] Set up proper email service (not Gmail)
- [ ] Enable HTTPS
- [ ] Configure rate limiting
- [ ] Set up monitoring/logging
- [ ] Test all auth methods
- [ ] Review security headers

## 📚 Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth Guide](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [SendGrid Setup](https://docs.sendgrid.com/for-developers/sending-email/quickstart-nodejs)

## 💡 Tips

1. **Start with one provider** (Google recommended)
2. **Test locally first** before deploying
3. **Keep secrets secure** - never commit to git
4. **Monitor failed logins** for security
5. **Provide fallback options** if one provider fails

---

Need help? Check the `/debug/session` page to debug authentication issues.
