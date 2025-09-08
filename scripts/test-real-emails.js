console.log("🧪 WMX Services - REAL EMAIL TESTING");
console.log("====================================");

const testEmail = process.argv[2];
if (!testEmail) {
  console.log("Usage: node scripts/test-real-emails.js <email>");
  process.exit(1);
}

console.log(`📧 Test Email: ${testEmail}`);
console.log("");

// Check environment
if (!process.env.RESEND_API_KEY) {
  console.log("❌ RESEND_API_KEY not found!");
  console.log("");
  console.log("🔧 QUICK SETUP:");
  console.log("1. Go to https://resend.com/");
  console.log("2. Create account (free)");
  console.log("3. Get API key from dashboard");
  console.log("4. Add to .env: RESEND_API_KEY=\"re_your_key\"");
  console.log("");
  console.log("📄 See .env.email-setup file for full instructions");
} else {
  console.log("✅ RESEND_API_KEY found!");
  console.log("🚀 Ready to send real emails!");
  console.log("");
  console.log("💡 To test real email sending:");
  console.log("1. npm run dev");
  console.log("2. Sign up a new user (triggers welcome email)");
  console.log("3. Check your email inbox");
  console.log("4. Or manually test through app features");
}
