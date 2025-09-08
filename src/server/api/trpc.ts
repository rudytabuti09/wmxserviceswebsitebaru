import { initTRPC, TRPCError } from "@trpc/server";
import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { type Session } from "next-auth";
import { getServerSession } from "next-auth/next";
import superjson from "superjson";
import { ZodError } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type CreateContextOptions = {
  session: Session | null;
};

const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    db: prisma,
  };
};

export const createTRPCContext = async (opts: FetchCreateContextFnOptions) => {
  const session = await getServerSession(authOptions);
  return createInnerTRPCContext({
    session,
  });
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  // Temporarily disabled transformer for debugging
  // transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

const enforceUserIsAdmin = t.middleware(({ ctx, next }) => {
  console.log("Admin middleware - Session:", ctx.session);
  console.log("Admin middleware - User:", ctx.session?.user);
  
  if (!ctx.session || !ctx.session.user) {
    console.log("Admin middleware - No session or user, throwing UNAUTHORIZED");
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  if (ctx.session.user.role !== "ADMIN") {
    console.log("Admin middleware - User is not admin, throwing FORBIDDEN");
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  
  console.log("Admin middleware - User is admin, proceeding");
  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
export const adminProcedure = t.procedure.use(enforceUserIsAdmin);
