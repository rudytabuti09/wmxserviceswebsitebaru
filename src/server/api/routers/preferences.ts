import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const preferencesRouter = createTRPCRouter({
  // Get current user's email preferences
  getEmailPreferences: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        emailNotifications: true,
        emailInvoices: true,
        emailProjectUpdates: true,
        emailChatMessages: true,
        emailMarketing: true,
        unsubscribeToken: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return user;
  }),

  // Update email preferences
  updateEmailPreferences: protectedProcedure
    .input(
      z.object({
        emailNotifications: z.boolean().optional(),
        emailInvoices: z.boolean().optional(),
        emailProjectUpdates: z.boolean().optional(),
        emailChatMessages: z.boolean().optional(),
        emailMarketing: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updatedUser = await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: input,
        select: {
          emailNotifications: true,
          emailInvoices: true,
          emailProjectUpdates: true,
          emailChatMessages: true,
          emailMarketing: true,
        },
      });

      return {
        success: true,
        preferences: updatedUser,
      };
    }),

  // Unsubscribe from all emails using token
  unsubscribeWithToken: publicProcedure
    .input(
      z.object({
        token: z.string(),
        type: z.enum(["all", "marketing", "notifications"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { unsubscribeToken: input.token },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invalid unsubscribe token",
        });
      }

      let updateData: any = {};

      switch (input.type) {
        case "marketing":
          updateData.emailMarketing = false;
          break;
        case "notifications":
          updateData.emailNotifications = false;
          updateData.emailChatMessages = false;
          updateData.emailProjectUpdates = false;
          break;
        case "all":
        default:
          updateData.emailNotifications = false;
          updateData.emailInvoices = false;
          updateData.emailProjectUpdates = false;
          updateData.emailChatMessages = false;
          updateData.emailMarketing = false;
          break;
      }

      await ctx.db.user.update({
        where: { id: user.id },
        data: updateData,
      });

      return {
        success: true,
        message: input.type === "all" 
          ? "You have been unsubscribed from all emails"
          : `You have been unsubscribed from ${input.type} emails`,
      };
    }),

  // Generate new unsubscribe token
  regenerateUnsubscribeToken: protectedProcedure.mutation(async ({ ctx }) => {
    const { unsubscribeToken } = await ctx.db.user.update({
      where: { id: ctx.session.user.id },
      data: {
        unsubscribeToken: require('crypto').randomBytes(32).toString('hex'),
      },
      select: {
        unsubscribeToken: true,
      },
    });

    return {
      success: true,
      unsubscribeToken,
    };
  }),

  // Get email logs for current user
  getEmailLogs: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const [logs, total] = await ctx.db.$transaction([
        ctx.db.emailLog.findMany({
          where: {
            userId: ctx.session.user.id,
          },
          orderBy: { createdAt: "desc" },
          take: input.limit,
          skip: input.offset,
        }),
        ctx.db.emailLog.count({
          where: {
            userId: ctx.session.user.id,
          },
        }),
      ]);

      return {
        logs,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),
});
