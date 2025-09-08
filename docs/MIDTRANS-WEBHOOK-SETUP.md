# Midtrans Webhook Configuration Guide

This guide explains how to set up webhook notifications for automatic payment status updates.

## Why Webhooks Are Important

Without webhooks, your application won't automatically know when payments are completed. Users would need to manually refresh the page or the admin would need to manually check payment status.

## Current Issue

When payments are completed through Midtrans, the invoices remain in "PENDING" status because:
1. Midtrans doesn't know where to send payment notifications
2. The webhook URL is not configured in the Midtrans dashboard

## Solution

### Step 1: Configure Webhook URL in Midtrans Dashboard

1. **Login to Midtrans Dashboard**
   - Go to https://dashboard.midtrans.com/
   - Login with your credentials

2. **Navigate to Settings**
   - Go to **Settings** > **Configuration**
   - Find the **Payment Notification URL** section

3. **Set Webhook URL**
   
   **For Production:**
   ```
   https://yourdomain.com/api/payment/webhook
   ```
   
   **For Development (using ngrok):**
   ```
   https://your-tunnel.ngrok.io/api/payment/webhook
   ```

### Step 2: Development Setup with ngrok

For local development, you need to expose your local server to the internet so Midtrans can send webhooks:

1. **Install ngrok**
   ```bash
   # Visit https://ngrok.com/download and download ngrok
   # Or use package managers:
   npm install -g ngrok
   # or
   brew install ngrok
   ```

2. **Start your development server**
   ```bash
   npm run dev
   # Your app runs on http://localhost:3000
   ```

3. **Expose with ngrok** (in a new terminal)
   ```bash
   ngrok http 3000
   ```

4. **Copy the HTTPS URL**
   ngrok will show output like:
   ```
   Forwarding    https://abc123.ngrok.io -> http://localhost:3000
   ```
   Copy the HTTPS URL: `https://abc123.ngrok.io`

5. **Configure in Midtrans Dashboard**
   Set Payment Notification URL to:
   ```
   https://abc123.ngrok.io/api/payment/webhook
   ```

### Step 3: Test the Webhook

1. **Make a test payment** through your application

2. **Check the server logs** for webhook calls:
   ```bash
   # Look for logs like:
   🚀 Webhook endpoint called at: 2024-01-15T10:30:00.000Z
   📨 Received webhook notification: { ... }
   🔍 Processing webhook for order: WMX-INV-001-... status: settlement
   ```

3. **Verify payment status update**:
   - Payment status should change from "PENDING" to "COMPLETED"
   - Invoice status should change from "PENDING" to "PAID"
   - User should receive payment confirmation email

### Step 4: Manual Test (Optional)

You can test the webhook endpoint manually:

```bash
# Run the test script
node scripts/test-webhook.js
```

Or use curl:
```bash
curl -X POST http://localhost:3000/api/payment/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "WMX-TEST-001",
    "transaction_status": "settlement",
    "gross_amount": "1500000",
    "payment_type": "bank_transfer",
    "status_code": "200",
    "signature_key": "generated-signature"
  }'
```

## Troubleshooting

### 1. Webhook not being called
- ✅ Check if webhook URL is configured in Midtrans dashboard
- ✅ Verify the URL is accessible from the internet (use ngrok for development)
- ✅ Check server logs for incoming requests
- ✅ Test the webhook endpoint manually

### 2. Invalid signature errors
- ✅ Verify MIDTRANS_SERVER_KEY environment variable is correct
- ✅ Check if signature calculation matches Midtrans format

### 3. Payment not found errors
- ✅ Verify that the order_id in webhook matches the midtransOrderId in database
- ✅ Check if payment record was created during payment initialization

### 4. Database update errors
- ✅ Check database connection
- ✅ Verify Prisma schema is up to date
- ✅ Check console logs for specific database errors

## Production Deployment

For production:
1. Use a proper domain with SSL certificate
2. Set webhook URL to: `https://yourdomain.com/api/payment/webhook`
3. Ensure your server is accessible from the internet
4. Monitor webhook calls through server logs or monitoring tools

## Security Notes

- Webhook signatures are verified to ensure requests come from Midtrans
- The webhook endpoint includes proper error handling
- All webhook calls are logged for debugging purposes
