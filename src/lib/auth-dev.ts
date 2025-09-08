import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

// Development-only auth configuration
// This allows you to test the app without setting up GitHub OAuth
export const devAuthOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Development Login",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@wmx.com or client@wmx.com" },
        role: { label: "Role", type: "text", placeholder: "ADMIN or CLIENT" }
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        
        // For development, create/find user based on email
        let user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });
        
        if (!user) {
          const role = credentials.role === "ADMIN" ? "ADMIN" : "CLIENT";
          const name = credentials.email === "admin@wmx.com" ? "Admin User" : "Client User";
          
          user = await prisma.user.create({
            data: {
              email: credentials.email,
              name,
              role: role as "ADMIN" | "CLIENT",
            },
          });
        }
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
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
  },
  secret: process.env.NEXTAUTH_SECRET,
};
