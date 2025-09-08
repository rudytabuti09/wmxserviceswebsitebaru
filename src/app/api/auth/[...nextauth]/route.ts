import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { devAuthOptions } from "@/lib/auth-dev";

// Check if we have valid OAuth or Email credentials
const hasValidAuth = 
  // Check for Resend email provider
  (process.env.RESEND_API_KEY && process.env.EMAIL_FROM) ||
  // Check for GitHub OAuth
  (process.env.GITHUB_CLIENT_ID && 
   process.env.GITHUB_CLIENT_SECRET && 
   !process.env.GITHUB_CLIENT_ID.includes("your-github")) ||
  // Check for Google OAuth
  (process.env.GOOGLE_CLIENT_ID && 
   process.env.GOOGLE_CLIENT_SECRET && 
   process.env.GOOGLE_CLIENT_ID !== "");

// Use full auth options if any provider is configured, otherwise use dev auth
const handler = NextAuth(hasValidAuth ? authOptions : devAuthOptions);

export { handler as GET, handler as POST };
