import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "@/server/api/trpc";

export const activityRouter = createTRPCRouter({
  // Get recent activities for the current user (client view)
  getRecentForUser: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(({ ctx, input }) => {
      const { limit = 10, offset = 0 } = input || {};
      
      return ctx.db.activityLog.findMany({
        where: {
          userId: ctx.session.user.id,
        },
        include: {
          project: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip: offset,
      });
    }),

  // Get all activities (admin view)
  getAll: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        userId: z.string().optional(),
        projectId: z.string().optional(),
        type: z.enum([
          "PROJECT_CREATED",
          "PROJECT_UPDATED",
          "PROJECT_STATUS_CHANGED",
          "PROJECT_PROGRESS_UPDATED",
          "PROJECT_COMPLETED",
          "MILESTONE_COMPLETED",
          "MILESTONE_UPDATED",
          "MESSAGE_SENT",
          "MESSAGE_RECEIVED",
          "PAYMENT_RECEIVED",
          "PAYMENT_SENT",
          "INVOICE_CREATED",
          "INVOICE_PAID",
          "USER_REGISTERED",
          "USER_LOGIN",
        ]).optional(),
      }).optional()
    )
    .query(({ ctx, input }) => {
      const { limit = 20, offset = 0, userId, projectId, type } = input || {};
      
      const where: any = {};
      if (userId) where.userId = userId;
      if (projectId) where.projectId = projectId;
      if (type) where.type = type;
      
      return ctx.db.activityLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          project: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip: offset,
      });
    }),

  // Get activity count for dashboard stats
  getCount: protectedProcedure.query(({ ctx }) => {
    return ctx.db.activityLog.count({
      where: {
        userId: ctx.session.user.id,
      },
    });
  }),

  // Get activities for a specific project
  getForProject: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.activityLog.findMany({
        where: {
          projectId: input.projectId,
          ...(ctx.session.user.role === "CLIENT" && {
            userId: ctx.session.user.id,
          }),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 50, // Limit for project-specific activities
      });
    }),
});
