# Email Notification System Documentation

## 📧 Overview

The WMX Services application includes a comprehensive email notification system that automatically sends emails for various events:
- Welcome emails for new users
- Invoice reminders (before and after due date)
- Project status updates
- Chat message notifications
- Password reset emails

## 🚀 Quick Setup

### 1. Get Resend API Key

1. Sign up at [Resend](https://resend.com)
2. Verify your domain or use `resend.dev` for testing
3. Generate an API key from the dashboard
4. Copy the API key (starts with `re_`)

### 2. Configure Environment Variables

Add these to your `.env` file:

```env
# Required for email functionality
RESEND_API_KEY="re_your_api_key_here"
EMAIL_FROM="WMX Services <noreply@yourdomain.com>"
EMAIL_ENABLED="true"

# Optional: For scheduled invoice reminders
CRON_SECRET="your-secret-for-cron-jobs"
```

### 3. Run Database Migration

After adding the email configuration, run:

```bash
npx prisma migrate dev
npx prisma generate
```

This will create the necessary tables:
- `EmailLog` - Tracks all sent emails
- `PasswordResetToken` - Stores password reset tokens

## 📝 Email Types

### Welcome Email
- **Trigger**: New user registration (OAuth or credentials)
- **Recipient**: New user
- **Content**: Welcome message, login link, feature overview

### Invoice Reminder
- **Trigger**: Scheduled job or manual trigger
- **Timing**: 
  - First reminder: 3 days before due date
  - Overdue reminders: Every 3 days after due date
- **Recipient**: Client
- **Content**: Invoice details, amount due, payment link

### Project Status Update
- **Trigger**: Project status change by admin
- **Recipient**: Project client
- **Content**: Status change, progress update, milestone status

### Chat Notification
- **Trigger**: New chat message when recipient is offline
- **Recipient**: Message recipient (client or admin)
- **Content**: Message preview, sender name, project link

### Password Reset
- **Trigger**: User requests password reset
- **Recipient**: User who requested reset
- **Content**: Reset link (valid for 1 hour)

## 🔧 Implementation Details

### File Structure
```
src/
├── lib/
│   └── email/
│       ├── resend.ts        # Resend client configuration
│       ├── services.tsx     # Email sending functions
│       └── hooks.ts         # Event-triggered email hooks
├── emails/                   # Email templates (React Email)
│   ├── welcome.tsx
│   ├── invoice-reminder.tsx
│   ├── project-status.tsx
│   ├── chat-notification.tsx
│   └── password-reset.tsx
├── app/api/
│   ├── auth/
│   │   ├── forgot-password/  # Password reset request
│   │   └── reset-password/   # Password reset with token
│   ├── cron/
│   │   └── invoice-reminders/ # Scheduled invoice reminders
│   └── test/
│       └── email/            # Email testing endpoint
```

### How It Works

1. **User Registration**: 
   - When a new user signs up, `onUserRegistered()` is called in `auth.ts`
   - Sends welcome email automatically

2. **Project Updates**:
   - Admin updates project status in dashboard
   - If "Notify Client" is checked, email is sent
   - Uses `onProjectStatusChanged()` hook

3. **Chat Messages**:
   - New message triggers `onNewChatMessage()`
   - Checks if recipient is online (last active < 5 minutes)
   - Sends email if recipient is offline

4. **Invoice Reminders**:
   - Scheduled job runs daily at 9 AM (configurable)
   - Checks for invoices needing reminders
   - Sends appropriate reminder emails

5. **Password Reset**:
   - User requests reset via `/auth/forgot-password`
   - Token generated and stored in database
   - Email sent with reset link
   - User clicks link to reset password

## 🧪 Testing Emails

### Test Individual Email Types

Use the test endpoint to send test emails:

```bash
# Test welcome email
curl -X POST http://localhost:3000/api/test/email \
  -H "Content-Type: application/json" \
  -d '{
    "type": "welcome",
    "to": "test@example.com",
    "data": {
      "userName": "John Doe",
      "userRole": "CLIENT"
    }
  }'

# Test invoice reminder
curl -X POST http://localhost:3000/api/test/email \
  -H "Content-Type: application/json" \
  -d '{
    "type": "invoice",
    "to": "test@example.com",
    "data": {
      "clientName": "John Doe",
      "invoiceNumber": "INV-001",
      "amount": 1500,
      "dueDate": "2024-12-31",
      "projectTitle": "Website Development",
      "isOverdue": false
    }
  }'
```

### Test Password Reset Flow

1. Request password reset:
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

2. Check token validity:
```bash
curl http://localhost:3000/api/auth/reset-password?token=YOUR_TOKEN
```

3. Reset password:
```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_TOKEN",
    "password": "newPassword123"
  }'
```

## 📅 Setting Up Scheduled Jobs

### Option 1: Vercel Cron Jobs (Recommended for Vercel deployment)

Create `vercel.json` in your project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/invoice-reminders",
      "schedule": "0 9 * * *"
    }
  ]
}
```

### Option 2: External Cron Service

Use services like:
- [cron-job.org](https://cron-job.org) (Free)
- [EasyCron](https://www.easycron.com)
- [Cronitor](https://cronitor.io)

Set them to call:
```
GET https://yourdomain.com/api/cron/invoice-reminders
Authorization: Bearer YOUR_CRON_SECRET
```

### Option 3: GitHub Actions

Create `.github/workflows/invoice-reminders.yml`:

```yaml
name: Invoice Reminders
on:
  schedule:
    - cron: '0 9 * * *'  # Daily at 9 AM UTC
jobs:
  send-reminders:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger invoice reminders
        run: |
          curl -X GET https://yourdomain.com/api/cron/invoice-reminders \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

## 🔍 Monitoring & Debugging

### Email Logs

All emails are logged in the `EmailLog` table:

```sql
-- View recent email logs
SELECT * FROM "EmailLog" 
ORDER BY "createdAt" DESC 
LIMIT 10;

-- Check failed emails
SELECT * FROM "EmailLog" 
WHERE status = 'FAILED';

-- Email stats by type
SELECT type, status, COUNT(*) 
FROM "EmailLog" 
GROUP BY type, status;
```

### Debug Mode

Enable debug logging by setting:

```env
EMAIL_ENABLED="false"  # Emails won't be sent but will be logged
```

### Common Issues

1. **Emails not sending**
   - Check `RESEND_API_KEY` is set correctly
   - Verify `EMAIL_ENABLED="true"`
   - Check Resend dashboard for API errors

2. **Invoice reminders not working**
   - Ensure cron job is configured
   - Check `lastReminderSent` field in Invoice table
   - Verify invoice has `status` of PENDING or OVERDUE

3. **Password reset not working**
   - Check `PasswordResetToken` table for tokens
   - Verify token expiry (1 hour by default)
   - Ensure user exists with the email

## 🎨 Customizing Email Templates

Email templates are React components in `src/emails/`:

1. Edit the template file (e.g., `welcome.tsx`)
2. Use React Email components from `@react-email/components`
3. Test with the email preview tool:

```bash
npm run email:dev
```

This opens a preview server at `http://localhost:3001`

## 📊 Email Preferences

Users can control their email preferences:

```typescript
// User model includes these fields:
emailNotifications: boolean    // Master toggle
emailInvoices: boolean        // Invoice reminders
emailProjectUpdates: boolean  // Project status updates
emailChatMessages: boolean    // Chat notifications
emailMarketing: boolean       // Marketing emails
```

Respect these preferences in your email sending logic:

```typescript
// Check before sending
if (user.emailNotifications && user.emailInvoices) {
  await sendInvoiceReminderEmail(...);
}
```

## 🔒 Security Considerations

1. **Rate Limiting**: Implement rate limiting on email endpoints
2. **Token Security**: Use crypto-random tokens for password reset
3. **Email Enumeration**: Return same response regardless of email existence
4. **CRON Authentication**: Use secret token for cron job endpoints
5. **Unsubscribe Links**: Include unsubscribe token in marketing emails

## 📚 Additional Resources

- [Resend Documentation](https://resend.com/docs)
- [React Email Components](https://react.email)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [NextAuth Email Provider](https://next-auth.js.org/providers/email)

## 🤝 Support

For issues or questions about the email system:
1. Check the EmailLog table for error messages
2. Review Resend dashboard for API issues
3. Check server logs for detailed error messages
4. Contact the development team with error details
