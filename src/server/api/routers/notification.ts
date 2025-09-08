import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const notificationRouter = createTRPCRouter({
  // Get all notifications for current user
  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional().default(20),
        offset: z.number().min(0).optional().default(0),
        unreadOnly: z.boolean().optional().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      const notifications = await ctx.db.notification.findMany({
        where: {
          userId: ctx.session.user.id,
          ...(input.unreadOnly && { isRead: false }),
        },
        orderBy: { createdAt: "desc" },
        take: input.limit,
        skip: input.offset,
      });

      const unreadCount = await ctx.db.notification.count({
        where: {
          userId: ctx.session.user.id,
          isRead: false,
        },
      });

      return {
        notifications,
        unreadCount,
        hasMore: notifications.length === input.limit,
      };
    }),

  // Get unread notification count
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const count = await ctx.db.notification.count({
      where: {
        userId: ctx.session.user.id,
        isRead: false,
      },
    });

    return count;
  }),

  // Mark notification as read
  markAsRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const notification = await ctx.db.notification.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!notification) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Notification not found",
        });
      }

      const updated = await ctx.db.notification.update({
        where: { id: input.id },
        data: { isRead: true },
      });

      return updated;
    }),

  // Mark all notifications as read
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db.notification.updateMany({
      where: {
        userId: ctx.session.user.id,
        isRead: false,
      },
      data: { isRead: true },
    });

    return { success: true };
  }),

  // Delete notification
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const notification = await ctx.db.notification.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!notification) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Notification not found",
        });
      }

      await ctx.db.notification.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Delete all notifications for user
  deleteAll: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db.notification.deleteMany({
      where: {
        userId: ctx.session.user.id,
      },
    });

    return { success: true };
  }),

  // Create notification (admin only)
  create: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        title: z.string().min(1).max(255),
        message: z.string().min(1).max(1000),
        type: z.enum([
          "INFO",
          "SUCCESS", 
          "WARNING",
          "ERROR",
          "PROJECT_UPDATE",
          "MESSAGE",
          "PAYMENT",
          "SYSTEM",
        ]).default("INFO"),
        entityId: z.string().optional(),
        entityType: z.string().optional(),
        actionUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const notification = await ctx.db.notification.create({
        data: {
          userId: input.userId,
          title: input.title,
          message: input.message,
          type: input.type,
          entityId: input.entityId,
          entityType: input.entityType,
          actionUrl: input.actionUrl,
        },
      });

      return notification;
    }),

  // Bulk create notifications (admin only)
  bulkCreate: adminProcedure
    .input(
      z.object({
        userIds: z.array(z.string()),
        title: z.string().min(1).max(255),
        message: z.string().min(1).max(1000),
        type: z.enum([
          "INFO",
          "SUCCESS",
          "WARNING", 
          "ERROR",
          "PROJECT_UPDATE",
          "MESSAGE",
          "PAYMENT",
          "SYSTEM",
        ]).default("INFO"),
        entityId: z.string().optional(),
        entityType: z.string().optional(),
        actionUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const notifications = await ctx.db.notification.createMany({
        data: input.userIds.map((userId) => ({
          userId,
          title: input.title,
          message: input.message,
          type: input.type,
          entityId: input.entityId,
          entityType: input.entityType,
          actionUrl: input.actionUrl,
        })),
      });

      return { count: notifications.count };
    }),
});
