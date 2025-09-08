const { quickEmailTest } = require("../src/lib/email/test-email-system-working.js");

async function main() {
  const testEmail = process.argv[2];
  const actualSend = process.argv[3] === "--send";

  if (!testEmail) {
    console.log("Usage: node scripts/test-email-working.js <email> [--send]");
    process.exit(1);
  }

  try {
    const results = await quickEmailTest(testEmail, actualSend);
    console.log("\n🎉 EMAIL SYSTEM TEST COMPLETED!");
    console.log(`✅ Success Rate: ${results.summary.successRate}`);
  } catch (error) {
    console.error("💥 Test failed:", error.message);
    process.exit(1);
  }
}

main();
