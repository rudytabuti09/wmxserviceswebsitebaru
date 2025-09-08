# 📧 WMX Services - Email System Guide

Complete guide for the WMX Services Email Notification System.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Setup](#setup)
3. [Email Templates](#email-templates)
4. [Auto-Triggers](#auto-triggers)
5. [Testing](#testing)
6. [Production Deployment](#production-deployment)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The WMX Services email system provides automated email notifications for:

- **Welcome emails** - New user registration
- **Project updates** - Status changes, progress updates
- **Chat notifications** - New messages
- **Invoice reminders** - Due dates and overdue payments
- **Password reset** - Security emails
- **Verification codes** - Email verification

### Features ✨

- **Professional Templates** - 80s retro-themed HTML emails
- **Auto-Triggers** - Automatic sending based on events
- **Queue System** - Batch processing for high volume
- **Fallback Support** - Multiple email providers
- **Rate Limiting** - Prevents spam
- **Logging** - Track all email activity
- **Testing Tools** - Comprehensive test suite

---

## 🚀 Setup

### 1. Environment Configuration

Add to your `.env` file:

```bash
# Email Configuration (Choose ONE)
# Option 1: Resend (Recommended)
RESEND_API_KEY="re_your_api_key_here"
EMAIL_FROM="WMX Services <noreply@wmx-services.dev>"

# Option 2: SendGrid (Alternative)
# SENDGRID_API_KEY="SG.your_sendgrid_api_key"
# EMAIL_FROM="WMX Services <noreply@yourdomain.com>"

# General Settings
EMAIL_ENABLED="true"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional: Cron job authentication
CRON_SECRET="your-secret-token-for-cron-jobs"
```

### 2. Get Resend API Key

1. Visit [resend.com](https://resend.com)
2. Create account and verify email
3. Go to "API Keys" → "Create API Key"
4. Choose "Full Access" permissions
5. Copy the key (format: `re_xxxxxxxxxxxx`)

For development, you can use `@resend.dev` emails for testing.

### 3. Dependencies

The email system uses these packages (already installed):

```json
{
  "resend": "^3.2.0",
  "@react-email/components": "^0.0.17",
  "@react-email/render": "^0.0.15"
}
```

---

## 📨 Email Templates

### Available Templates

| Template | Description | Trigger |
|----------|-------------|---------|
| `welcome.tsx` | Welcome new users | After email verification |
| `verification-code.tsx` | Email verification | User registration |
| `project-status.tsx` | Project updates | Status/progress changes |
| `chat-notification.tsx` | New messages | Chat activity |
| `invoice-reminder.tsx` | Payment reminders | Due dates |
| `password-reset.tsx` | Password recovery | Forgot password |

### Template Locations

```
src/
  emails/
    ├── welcome.tsx
    ├── verification-code.tsx
    ├── project-status.tsx
    ├── chat-notification.tsx
    ├── invoice-reminder.tsx
    └── password-reset.tsx
  lib/
    email/
      ├── services.tsx     # Email functions
      ├── resend.ts        # Resend client
      ├── hooks.ts         # Auto-triggers
      └── templates/
          ├── BaseTemplate.tsx  # Shared layout
          └── styles.ts         # Shared styles
```

### Customizing Templates

All templates use the 80s retro theme with these colors:

```tsx
const RETRO_COLORS = {
  primary: '#3D52F1',     // Bright blue
  accent: '#FFC700',      // Bright yellow
  secondary: '#FF3EA5',   // Bright pink
  success: '#00FF88',     // Bright green
  text: '#111111',        // Black
  background: '#FFFFFF',  // White
}
```

To modify a template:

1. Edit the React component in `src/emails/`
2. Use shared styles from `src/lib/email/templates/styles.ts`
3. Test with the email testing system

---

## ⚡ Auto-Triggers

### User Registration Flow

```typescript
// 1. User signs up → Verification email sent
await sendVerificationCodeEmail({
  to: user.email,
  userName: user.name,
  verificationCode: "123456",
  expiresIn: "10 minutes"
});

// 2. User verifies → Welcome email sent
await sendWelcomeEmail({
  to: user.email,
  userName: user.name,
  userRole: user.role,
  loginUrl: process.env.NEXT_PUBLIC_APP_URL
});
```

### Project Updates

```typescript
// Triggered when project status changes
await sendProjectStatusEmail({
  to: client.email,
  clientName: client.name,
  projectTitle: project.title,
  previousStatus: "PLANNING",
  newStatus: "IN_PROGRESS",
  progress: 25,
  message: "Development has started!",
  milestones: project.milestones,
  dashboardUrl: `/client/projects/${project.id}`
});
```

### Chat Notifications

```typescript
// Triggered when new message is sent
await sendChatNotificationEmail({
  to: recipient.email,
  recipientName: recipient.name,
  senderName: sender.name,
  projectTitle: project.title,
  message: "Your design looks great!",
  timestamp: new Date().toLocaleString(),
  chatUrl: `/client/projects/${project.id}#chat`,
  isAdminSender: sender.role === 'ADMIN'
});
```

### Invoice Reminders

Automated via cron job (`/api/cron/invoice-reminders`):

- **3 days before due date** - Friendly reminder
- **On due date** - Final notice  
- **After due date** - Overdue notice (every 3 days)

---

## 🧪 Testing

### 1. Quick Test Script

```bash
# Test templates only (no emails sent)
node scripts/test-email.js your-email@example.com

# Send actual test emails
node scripts/test-email.js your-email@example.com --send
```

### 2. Programmatic Testing

```typescript
import EmailSystemTester from '@/lib/email/test-email-system';

const tester = new EmailSystemTester({
  testEmail: 'test@example.com',
  skipActualSending: false  // Set to true for dry run
});

const results = await tester.runAllTests();
console.log('Test Results:', results);
```

### 3. Testing Individual Templates

```typescript
import { sendWelcomeEmail } from '@/lib/email/services';

await sendWelcomeEmail({
  to: 'test@example.com',
  userName: 'Test User',
  userRole: 'CLIENT',
  loginUrl: 'http://localhost:3000/auth/signin'
}, { skipIfDisabled: false });
```

### 4. API Route Testing

Test the cron job manually:

```bash
curl -X GET "http://localhost:3000/api/cron/invoice-reminders" \
  -H "Authorization: Bearer your-cron-secret"
```

---

## 🚀 Production Deployment

### 1. Environment Variables

Add these to your Vercel/production environment:

```bash
RESEND_API_KEY="re_your_production_key"
EMAIL_FROM="WMX Services <noreply@yourdomain.com>"
EMAIL_ENABLED="true"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
CRON_SECRET="secure-random-token"
```

### 2. Domain Setup (For Production)

**Option A: Use Resend Domain**
- For development: Use `@resend.dev` (works immediately)
- Limited to 100 emails/day

**Option B: Custom Domain**
1. Add your domain in Resend dashboard
2. Add DNS records as instructed
3. Wait for verification (24-48 hours)
4. Update `EMAIL_FROM` to use your domain

### 3. Cron Jobs

The system includes Vercel Cron configuration:

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/invoice-reminders",
      "schedule": "0 9 * * *"  // Daily at 9 AM UTC
    }
  ]
}
```

**Alternative Cron Options:**
- **GitHub Actions** - Free, reliable
- **cron-job.org** - External service
- **EasyCron** - Paid service with monitoring

### 4. Monitoring

Track email delivery in:
- **Resend Dashboard** - Delivery status, opens, clicks
- **Application Logs** - Console logs, error tracking
- **Database Logs** - `EmailLog` table tracks all sends

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Emails Not Sending

**Check:**
- `RESEND_API_KEY` is correct
- `EMAIL_ENABLED="true"` 
- API key has proper permissions
- Rate limits not exceeded

**Debug:**
```bash
# Test API key manually
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer re_your_key' \
  -H 'Content-Type: application/json' \
  -d '{"from": "onboarding@resend.dev", "to": ["test@example.com"], "subject": "Test", "html": "<p>Test</p>"}'
```

#### 2. Templates Not Rendering

**Check:**
- React Email components are properly imported
- JSX syntax is correct
- No TypeScript errors in templates

**Debug:**
```typescript
import { render } from '@react-email/render';
import WelcomeEmail from '@/emails/welcome';

const html = render(<WelcomeEmail name="Test" loginUrl="#" />);
console.log('Rendered HTML:', html);
```

#### 3. High Bounce Rate

**Check:**
- Email addresses are valid
- Not ending up in spam folder
- SPF/DKIM records configured (for custom domains)

**Solutions:**
- Use double opt-in for email collection
- Include unsubscribe links
- Monitor sender reputation

#### 4. Cron Jobs Not Running

**Check:**
- Vercel plan supports cron jobs
- Cron syntax is correct
- Function timeout limits
- Authentication headers

### Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| 422 | Invalid email format | Validate email addresses |
| 429 | Rate limit exceeded | Implement retry with backoff |
| 400 | Bad request/missing data | Check request payload |
| 401 | Unauthorized | Verify API key |

### Getting Help

1. **Check Logs** - Console output and Vercel function logs
2. **Resend Dashboard** - View email delivery status
3. **Test System** - Use built-in testing tools
4. **Support** - Contact Resend support for API issues

---

## 📊 Email Analytics

### Tracking Metrics

The system automatically tracks:

```typescript
// Database: EmailLog table
{
  userId: string,
  projectId?: string,
  type: 'WELCOME' | 'PROJECT_UPDATE' | 'CHAT_NOTIFICATION' | 'INVOICE_REMINDER',
  recipient: string,
  status: 'SENT' | 'FAILED' | 'DELIVERED' | 'OPENED',
  sentAt: Date,
  openedAt?: Date,
  clickedAt?: Date
}
```

### Available Reports

- **Delivery rates** by email type
- **Open rates** by recipient
- **Click-through rates** for CTAs
- **Failed sends** with error details

---

## 🎯 Best Practices

### Email Content

- ✅ Clear, actionable subject lines
- ✅ Personalized greetings
- ✅ Single call-to-action per email
- ✅ Mobile-responsive design
- ✅ Unsubscribe options

### Technical

- ✅ Use environment variables for configuration
- ✅ Implement proper error handling
- ✅ Log all email activity
- ✅ Test templates in multiple email clients
- ✅ Monitor delivery rates

### Security

- ✅ Never expose API keys client-side
- ✅ Use HTTPS for all email links
- ✅ Validate email addresses
- ✅ Implement rate limiting
- ✅ Secure cron job endpoints

---

## 📚 Additional Resources

- [Resend Documentation](https://resend.com/docs)
- [React Email Documentation](https://react.email/docs)
- [Email Design Best Practices](https://www.campaignmonitor.com/resources/)
- [GDPR Compliance for Emails](https://gdpr.eu/email-marketing/)

---

**🎉 Your WMX Services email system is now ready to deliver professional, automated notifications to your clients!**
