import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/lib/email/resend";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // OAuth Providers
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "placeholder",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "placeholder",
      allowDangerousEmailAccountLinking: true,
    }),
    
    // Email Magic Link Provider (Using Resend)
    EmailProvider({
      from: process.env.EMAIL_FROM || "WMX Services <noreply@wmx-services.dev>",
      sendVerificationRequest: async ({ identifier: email, url, provider }) => {
        try {
          const { host } = new URL(url);
          await sendEmail({
            to: email,
            from: provider.from,
            subject: `Sign in to ${host}`,
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; background-color: #f8f5f2; padding: 40px 20px;">
                  <div style="max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #3D52F1; border: 3px solid #111111; box-shadow: 4px 4px 0px #111111; padding: 20px; text-align: center; margin-bottom: 30px;">
                      <h1 style="color: #FFFFFF; font-size: 28px; font-weight: 800; letter-spacing: 2px; margin: 0; text-shadow: 2px 2px 0px #111111;">WMX SERVICES</h1>
                    </div>
                    
                    <div style="background-color: #FFFFFF; border: 3px solid #111111; box-shadow: 4px 4px 0px #111111; padding: 30px;">
                      <h2 style="font-size: 24px; font-weight: 700; color: #111111; margin-bottom: 20px;">Sign In Request</h2>
                      
                      <p style="font-size: 16px; line-height: 24px; color: #333333; margin-bottom: 16px;">
                        Hello! You requested to sign in to <strong>WMX Services</strong>.
                      </p>
                      
                      <p style="font-size: 16px; line-height: 24px; color: #333333; margin-bottom: 30px;">
                        Click the button below to sign in. This link will expire in 24 hours.
                      </p>
                      
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${url}" style="display: inline-block; background-color: #FFC700; color: #111111; border: 3px solid #111111; box-shadow: 3px 3px 0px #111111; padding: 12px 30px; font-family: 'Poppins', sans-serif; font-size: 16px; font-weight: 700; text-transform: uppercase; text-decoration: none; letter-spacing: 1px;">
                          Sign In to WMX Services
                        </a>
                      </div>
                      
                      <p style="font-size: 14px; color: #666666; margin-top: 30px;">
                        If you didn't request this email, you can safely ignore it.
                      </p>
                      
                      <hr style="border: 0; border-top: 2px solid #111111; margin: 30px 0;">
                      
                      <p style="font-size: 12px; color: #999999; text-align: center;">
                        Or copy and paste this URL into your browser:<br>
                        <span style="color: #3D52F1; word-break: break-all;">${url}</span>
                      </p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px;">
                      <p style="font-size: 14px; color: #666666;">
                        WMX Services - Digital Solutions That Drive Growth
                      </p>
                      <p style="font-size: 12px; color: #999999;">
                        © ${new Date().getFullYear()} WMX Services. All rights reserved.
                      </p>
                    </div>
                  </div>
                </body>
              </html>
            `,
            text: `Sign in to ${host}\n\nClick the link below to sign in:\n${url}\n\nIf you didn't request this email, you can safely ignore it.`,
          });
        } catch (error) {
          console.error('Failed to send verification email:', error);
          throw new Error('Failed to send verification email');
        }
      },
    }),
    
    // Credentials Provider (Email + Password)
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle successful magic link sign in
      if (account?.provider === "email") {
        // Update last login time
        await prisma.user.update({
          where: { email: user.email! },
          data: { lastActiveAt: new Date() },
        }).catch(err => console.error('Failed to update last active:', err));
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Redirect to dashboard after successful sign in
      if (url.startsWith(baseUrl)) {
        // Check if user is signing in (has callback in URL)
        if (url.includes('/api/auth/callback')) {
          return `${baseUrl}/admin/dashboard`;
        }
        return url;
      }
      return baseUrl;
    },
    async jwt({ token, user, account, trigger }) {
      // When user first signs in
      if (user && account) {
        // When user signs in, check if they exist in database
        let dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });
        
        // If user doesn't exist, create them
        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name,
              image: user.image,
              role: "CLIENT", // Default role
            },
          });
          
          // Send welcome email for new users
          // Import at the top of the file: import { onUserRegistered } from './email/hooks';
          const { onUserRegistered } = await import('./email/hooks');
          await onUserRegistered(dbUser.id).catch(err => 
            console.error('Failed to send welcome email:', err)
          );
        }
        
        token.role = dbUser.role;
        token.id = dbUser.id;
        token.email = dbUser.email;
      } 
      // Always refresh role from database on subsequent requests
      else if (token?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: {
            id: true,
            role: true,
          },
        });
        
        if (dbUser) {
          token.role = dbUser.role;
          token.id = dbUser.id;
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-request",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development" && process.env.NEXTAUTH_DEBUG === "true",
};
