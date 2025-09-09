#!/usr/bin/env node

/**
 * Production Email Testing Script for WMX Services
 * 
 * Usage:
 * node scripts/test-emails-production.js https://your-domain.vercel.app your-test@gmail.com
 */

const https = require('https');

const PRODUCTION_URL = process.argv[2] || 'https://wmxservices.store';
const TEST_EMAIL = process.argv[3] || 'tsagabajinomoto@gmail.com';

console.log('🔍 WMX Services - Production Email Testing');
console.log('==========================================');
console.log(`📧 Production URL: ${PRODUCTION_URL}`);
console.log(`📮 Test Email: ${TEST_EMAIL}`);
console.log('==========================================\n');

const testEndpoints = [
  {
    name: '📧 Welcome Email',
    path: `/api/test/email-system?test=welcome&to=${TEST_EMAIL}`,
    method: 'GET'
  },
  {
    name: '🔐 Verification Code',
    path: `/api/test/email-system?test=verification&to=${TEST_EMAIL}`,
    method: 'GET'
  },
  {
    name: '💬 Chat Notification',
    path: `/api/test/email-system?test=chat-notification&to=${TEST_EMAIL}`,
    method: 'GET'
  },
  {
    name: '📊 Project Status',
    path: `/api/test/email-system?test=project-status&to=${TEST_EMAIL}`,
    method: 'GET'
  },
  {
    name: '🧾 Invoice Reminder',
    path: `/api/test/email-system?test=invoice-reminder&to=${TEST_EMAIL}`,
    method: 'GET'
  },
  {
    name: '💰 Payment Confirmation',
    path: `/api/test/email-system?test=payment-confirmation&to=${TEST_EMAIL}`,
    method: 'GET'
  },
  {
    name: '📋 Queue Status',
    path: `/api/test/email-system?test=queue-status`,
    method: 'GET'
  },
  {
    name: '⚡ Process Queue',
    path: `/api/test/email-system?test=process-queue`,
    method: 'GET'
  }
];

async function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'WMX-Services-Email-Tester/1.0'
      }
    };

    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: jsonBody
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function runTests() {
  const results = [];
  
  for (const test of testEndpoints) {
    console.log(`🧪 Testing: ${test.name}`);
    
    try {
      const startTime = Date.now();
      const result = await makeRequest(`${PRODUCTION_URL}${test.path}`, test.method);
      const duration = Date.now() - startTime;
      
      const success = result.status >= 200 && result.status < 300;
      const status = success ? '✅ PASS' : '❌ FAIL';
      
      console.log(`   ${status} (${result.status}) - ${duration}ms`);
      
      if (result.body && typeof result.body === 'object') {
        if (result.body.error) {
          console.log(`   ❗ Error: ${result.body.error}`);
        } else if (result.body.success) {
          console.log(`   📬 ${result.body.message || 'Email sent successfully'}`);
        }
      }
      
      results.push({
        test: test.name,
        success,
        status: result.status,
        duration,
        error: result.body?.error || null
      });
      
    } catch (error) {
      console.log(`   ❌ FAIL - ${error.message}`);
      results.push({
        test: test.name,
        success: false,
        status: 0,
        duration: 0,
        error: error.message
      });
    }
    
    console.log('');
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Summary
  console.log('📊 TEST SUMMARY');
  console.log('================');
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Passed: ${passed}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);
  
  if (failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   • ${r.test}: ${r.error || `HTTP ${r.status}`}`);
    });
  }
  
  console.log('\n📧 Check your email inbox for test messages!');
  console.log(`📮 Test email: ${TEST_EMAIL}`);
  
  if (passed === results.length) {
    console.log('\n🎉 All email systems are working correctly in production!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some email systems need attention.');
    process.exit(1);
  }
}

// Run the tests
runTests().catch(console.error);
