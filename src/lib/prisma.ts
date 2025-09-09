import { PrismaClient } from "@prisma/client";
// import { withOptimize } from "@prisma/extension-optimize";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create Prisma Client (Optimize temporarily disabled due to API key conflict)
const createPrismaClient = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ['error', 'warn'] : ['error'],
  });
  
  // TODO: Fix API key conflict between Accelerate and Optimize
  // The current OPTIMIZE_API_KEY is not compatible with the Accelerate setup
  // if (process.env.OPTIMIZE_API_KEY) {
  //   return client.$extends(
  //     withOptimize({ apiKey: process.env.OPTIMIZE_API_KEY })
  //   );
  // }
  
  return client;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
