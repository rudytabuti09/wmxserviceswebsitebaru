#!/usr/bin/env node

/**
 * Simple test script for Email System
 * Run with: node scripts/test-email.js your-email@example.com
 */

const { quickEmailTest } = require('../src/lib/email/test-email-system.js');

async function main() {
  const testEmail = process.argv[2];
  const actualSend = process.argv[3] === '--send';

  if (!testEmail) {
    console.log('Usage: node scripts/test-email.js <test-email> [--send]');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/test-email.js test@example.com       # Dry run (template testing only)');
    console.log('  node scripts/test-email.js test@example.com --send  # Actually send emails');
    process.exit(1);
  }

  console.log('🧪 WMX Services - Email System Test');
  console.log('=====================================');
  console.log(`📧 Test Email: ${testEmail}`);
  console.log(`📤 Send Mode: ${actualSend ? 'REAL EMAILS' : 'DRY RUN'}`);
  console.log('');

  try {
    const results = await quickEmailTest(testEmail, actualSend);
    
    if (results.success) {
      console.log('');
      console.log('🎉 SUCCESS! All email tests passed.');
      console.log(`✅ Tests passed: ${results.summary.passedTests}/${results.summary.totalTests}`);
    } else {
      console.log('');
      console.log('⚠️ WARNING! Some tests failed.');
      console.log(`❌ Tests failed: ${results.summary.failedTests}/${results.summary.totalTests}`);
      console.log('');
      console.log('Failed tests:');
      Object.entries(results.results).forEach(([name, result]) => {
        if (result.status === 'FAILED') {
          console.log(`  - ${name}: ${result.error}`);
        }
      });
    }

    if (!actualSend) {
      console.log('');
      console.log('💡 TIP: Run with --send flag to actually send test emails');
      console.log('Make sure to configure RESEND_API_KEY in your .env file first!');
    }

  } catch (error) {
    console.error('💥 TEST SCRIPT ERROR:', error.message);
    process.exit(1);
  }
}

main();
