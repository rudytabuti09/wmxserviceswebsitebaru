import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "@/server/api/trpc";
import { MilestoneStatus } from "@prisma/client";
import { logMilestoneUpdated, logMilestoneCompleted } from "@/lib/activity/logger";

export const milestoneRouter = createTRPCRouter({
  // Get milestones for a specific project
  getByProject: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const isAdmin = ctx.session.user.role === 'ADMIN';

      // Check if user has access to this project
      const project = await ctx.db.project.findFirst({
        where: {
          id: input.projectId,
          ...(isAdmin ? {} : { clientId: userId }),
        },
      });

      if (!project) {
        throw new Error("Project not found or access denied");
      }

      return await ctx.db.milestone.findMany({
        where: { projectId: input.projectId },
        orderBy: { order: 'asc' },
      });
    }),

  // Create a new milestone (admin only)
  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(1),
        projectId: z.string(),
        order: z.number().default(0),
        status: z.nativeEnum(MilestoneStatus).default('PENDING'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.milestone.create({
        data: {
          title: input.title,
          projectId: input.projectId,
          order: input.order,
          status: input.status,
          deadline: null,
        },
      });
    }),

  // Update milestone (admin only)
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        status: z.nativeEnum(MilestoneStatus).optional(),
        order: z.number().optional(),
        deadline: z.date().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      const userId = ctx.session.user.id;

      // Get current milestone data for activity logging
      const currentMilestone = await ctx.db.milestone.findUnique({
        where: { id },
        include: {
          project: {
            select: {
              title: true,
              clientId: true,
            },
          },
        },
      });

      if (!currentMilestone) {
        throw new Error("Milestone not found");
      }

      // Update the milestone
      const updatedMilestone = await ctx.db.milestone.update({
        where: { id },
        data: updateData,
      });

      // Log activity if status changed
      if (input.status && input.status !== currentMilestone.status) {
        if (input.status === 'COMPLETED') {
          await logMilestoneCompleted(
            userId,
            currentMilestone.projectId,
            currentMilestone.title,
            currentMilestone.project.title
          );
        } else {
          await logMilestoneUpdated(
            userId,
            currentMilestone.projectId,
            currentMilestone.title,
            currentMilestone.status,
            input.status,
            currentMilestone.project.title
          );
        }
      }

      return updatedMilestone;
    }),

  // Update milestone status (admin only)
  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.nativeEnum(MilestoneStatus),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get current milestone data for activity logging
      const currentMilestone = await ctx.db.milestone.findUnique({
        where: { id: input.id },
        include: {
          project: {
            select: {
              title: true,
              clientId: true,
            },
          },
        },
      });

      if (!currentMilestone) {
        throw new Error("Milestone not found");
      }

      // Update the milestone status
      const updatedMilestone = await ctx.db.milestone.update({
        where: { id: input.id },
        data: { status: input.status },
      });

      // Log activity if status changed
      if (input.status !== currentMilestone.status) {
        if (input.status === 'COMPLETED') {
          await logMilestoneCompleted(
            userId,
            currentMilestone.projectId,
            currentMilestone.title,
            currentMilestone.project.title
          );
        } else {
          await logMilestoneUpdated(
            userId,
            currentMilestone.projectId,
            currentMilestone.title,
            currentMilestone.status,
            input.status,
            currentMilestone.project.title
          );
        }
      }

      return updatedMilestone;
    }),

  // Bulk update milestone statuses (admin only)
  bulkUpdateStatus: adminProcedure
    .input(
      z.object({
        milestoneIds: z.array(z.string()),
        status: z.nativeEnum(MilestoneStatus),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get current milestones for activity logging
      const milestones = await ctx.db.milestone.findMany({
        where: { id: { in: input.milestoneIds } },
        include: {
          project: {
            select: {
              title: true,
              clientId: true,
            },
          },
        },
      });

      // Bulk update
      const result = await ctx.db.milestone.updateMany({
        where: { id: { in: input.milestoneIds } },
        data: { status: input.status },
      });

      // Log activities for each milestone
      await Promise.all(
        milestones.map(async (milestone) => {
          if (input.status !== milestone.status) {
            if (input.status === 'COMPLETED') {
              await logMilestoneCompleted(
                userId,
                milestone.projectId,
                milestone.title,
                milestone.project.title
              );
            } else {
              await logMilestoneUpdated(
                userId,
                milestone.projectId,
                milestone.title,
                milestone.status,
                input.status,
                milestone.project.title
              );
            }
          }
        })
      );

      return result;
    }),

  // Delete milestone (admin only)
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.milestone.delete({
        where: { id: input.id },
      });
    }),

  // Reorder milestones (admin only)
  reorder: adminProcedure
    .input(
      z.object({
        projectId: z.string(),
        milestoneIds: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Update order for each milestone
      const updatePromises = input.milestoneIds.map((milestoneId, index) =>
        ctx.db.milestone.update({
          where: { id: milestoneId },
          data: { order: index },
        })
      );

      await Promise.all(updatePromises);
      return { success: true };
    }),

  // Get milestone statistics for a project
  getStats: adminProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const milestones = await ctx.db.milestone.findMany({
        where: { projectId: input.projectId },
        select: { status: true },
      });

      const stats = {
        total: milestones.length,
        completed: milestones.filter(m => m.status === 'COMPLETED').length,
        inProgress: milestones.filter(m => m.status === 'IN_PROGRESS').length,
        pending: milestones.filter(m => m.status === 'PENDING').length,
      };

      return {
        ...stats,
        completionRate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
      };
    }),
});
