const crypto = require('crypto');

// Simulate a Midtrans webhook notification
const testWebhook = async () => {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || 'your-server-key';
  const orderId = 'WMX-INV-001-1234567890'; // Example order ID
  const statusCode = '200';
  const grossAmount = '1500000';
  
  // Create signature as Midtrans would
  const signature = crypto
    .createHash('sha512')
    .update(orderId + statusCode + grossAmount + serverKey)
    .digest('hex');
  
  const webhookData = {
    order_id: orderId,
    status_code: statusCode,
    gross_amount: grossAmount,
    payment_type: 'bank_transfer',
    transaction_time: new Date().toISOString(),
    transaction_status: 'settlement', // or 'pending', 'capture', etc.
    transaction_id: 'test-txn-' + Date.now(),
    status_message: 'Transaction is success',
    merchant_id: 'test-merchant',
    signature_key: signature,
    fraud_status: 'accept'
  };
  
  console.log('Testing webhook with payload:');
  console.log(JSON.stringify(webhookData, null, 2));
  
  try {
    const response = await fetch('http://localhost:3000/api/payment/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Veritrans-Client'
      },
      body: JSON.stringify(webhookData)
    });
    
    const result = await response.text();
    console.log('\nWebhook response status:', response.status);
    console.log('Webhook response:', result);
    
    if (!response.ok) {
      console.error('❌ Webhook test failed');
    } else {
      console.log('✅ Webhook test successful');
    }
  } catch (error) {
    console.error('❌ Webhook test error:', error.message);
  }
};

// Run the test
testWebhook();
