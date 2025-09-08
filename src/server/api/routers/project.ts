import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "@/server/api/trpc";
import { sendProjectStatusEmail, sendInvoiceReminderEmail } from "@/lib/email/services";
import { 
  logProjectCreated, 
  logProjectStatusChanged, 
  logProjectProgressUpdated, 
  logProjectCompleted, 
  logMilestoneUpdated, 
  logMilestoneCompleted 
} from "@/lib/activity/logger";

export const projectRouter = createTRPCRouter({
  getForClient: protectedProcedure.query(({ ctx }) => {
    return ctx.db.project.findMany({
      where: {
        clientId: ctx.session.user.id,
      },
      include: {
        milestones: {
          orderBy: { order: "asc" },
        },
      },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.project.findFirst({
        where: {
          id: input.id,
          ...(ctx.session.user.role === "CLIENT" && {
            clientId: ctx.session.user.id,
          }),
        },
        include: {
          milestones: {
            orderBy: { order: "asc" },
          },
          client: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });
    }),

  getAll: adminProcedure.query(({ ctx }) => {
    return ctx.db.project.findMany({
      include: {
        client: {
          select: {
            name: true,
            email: true,
          },
        },
        milestones: {
          orderBy: { order: "asc" },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  }),

  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        clientId: z.string(),
        milestones: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.create({
        data: {
          title: input.title,
          description: input.description,
          clientId: input.clientId,
        },
      });

      if (input.milestones && input.milestones.length > 0) {
        await ctx.db.milestone.createMany({
          data: input.milestones.map((title, index) => ({
            title,
            projectId: project.id,
            order: index,
          })),
        });
      }

      // Log project creation activity
      logProjectCreated(input.clientId, project.id, project.title).catch(error => {
        console.error("Failed to log project creation:", error);
      });

      return project;
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        progress: z.number().min(0).max(100).optional(),
        status: z.enum(["PLANNING", "IN_PROGRESS", "REVIEW", "COMPLETED"]).optional(),
        demoUrl: z.string().url().optional().or(z.literal("")),
        notifyClient: z.boolean().optional(),
        message: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, notifyClient, message, ...data } = input;
      
      // Get current project state before update
      const currentProject = await ctx.db.project.findUnique({
        where: { id },
        include: {
          client: true,
          milestones: {
            orderBy: { order: "asc" },
          },
        },
      });
      
      if (!currentProject) {
        throw new Error("Project not found");
      }
      
      // Update the project
      const updatedProject = await ctx.db.project.update({
        where: { id },
        data,
      });
      
      // Send email notification if status changed and notifyClient is true
      if (notifyClient && input.status && input.status !== currentProject.status && currentProject.client.email) {
        sendProjectStatusEmail({
          to: currentProject.client.email,
          clientName: currentProject.client.name || "Valued Client",
          projectTitle: updatedProject.title,
          previousStatus: currentProject.status,
          newStatus: input.status,
          progress: updatedProject.progress,
          message,
          milestones: currentProject.milestones.map(m => ({
            title: m.title,
            status: m.status,
          })),
          dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/client/projects/${id}`,
        }, { skipIfDisabled: true }).catch(error => {
          console.error("Failed to send project status email:", error);
        });
      }
      
      // Log activity based on what changed
      if (input.status && input.status !== currentProject.status) {
        logProjectStatusChanged(
          currentProject.clientId,
          id,
          updatedProject.title,
          currentProject.status,
          input.status
        ).catch(error => {
          console.error("Failed to log project status change:", error);
        });
        
        // Log completion if status changed to COMPLETED
        if (input.status === "COMPLETED") {
          logProjectCompleted(currentProject.clientId, id, updatedProject.title).catch(error => {
            console.error("Failed to log project completion:", error);
          });
        }
      }
      
      if (input.progress !== undefined && input.progress !== currentProject.progress) {
        logProjectProgressUpdated(
          currentProject.clientId,
          id,
          updatedProject.title,
          currentProject.progress,
          input.progress
        ).catch(error => {
          console.error("Failed to log project progress update:", error);
        });
      }
      
      return updatedProject;
    }),

  updateProgress: adminProcedure
    .input(
      z.object({
        id: z.string(),
        progress: z.number().min(0).max(100),
        milestoneUpdates: z
          .array(
            z.object({
              id: z.string(),
              status: z.enum(["COMPLETED", "IN_PROGRESS", "PENDING"]),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, progress, milestoneUpdates } = input;

      // Get project with client info before update
      const projectBefore = await ctx.db.project.findUnique({
        where: { id },
        include: {
          client: true,
          milestones: true,
        },
      });
      
      if (!projectBefore) {
        throw new Error("Project not found");
      }
      
      // Update project progress
      const project = await ctx.db.project.update({
        where: { id },
        data: { progress },
      });

      // Update milestones if provided
      if (milestoneUpdates) {
        // Get milestone statuses before update for logging
        const milestonesBeforeUpdate = projectBefore.milestones.reduce((acc, milestone) => {
          acc[milestone.id] = milestone.status;
          return acc;
        }, {} as Record<string, string>);
        
        await Promise.all(
          milestoneUpdates.map((milestone) =>
            ctx.db.milestone.update({
              where: { id: milestone.id },
              data: { status: milestone.status },
            })
          )
        );
        
        // Log milestone status changes
        for (const milestoneUpdate of milestoneUpdates) {
          const currentMilestone = projectBefore.milestones.find(m => m.id === milestoneUpdate.id);
          const previousStatus = milestonesBeforeUpdate[milestoneUpdate.id];
          
          if (currentMilestone && previousStatus !== milestoneUpdate.status) {
            if (milestoneUpdate.status === 'COMPLETED') {
              logMilestoneCompleted(
                projectBefore.clientId,
                id,
                currentMilestone.title,
                projectBefore.title
              ).catch(error => {
                console.error("Failed to log milestone completion:", error);
              });
            } else {
              logMilestoneUpdated(
                projectBefore.clientId,
                id,
                currentMilestone.title,
                previousStatus,
                milestoneUpdate.status,
                projectBefore.title
              ).catch(error => {
                console.error("Failed to log milestone update:", error);
              });
            }
          }
        }
      }
      
      // Send notification email if progress reached 100% (project completed)
      if (progress === 100 && projectBefore.progress < 100 && projectBefore.client.email) {
        const updatedMilestones = await ctx.db.milestone.findMany({
          where: { projectId: id },
          orderBy: { order: "asc" },
        });
        
        sendProjectStatusEmail({
          to: projectBefore.client.email,
          clientName: projectBefore.client.name || "Valued Client",
          projectTitle: project.title,
          previousStatus: projectBefore.status,
          newStatus: "COMPLETED",
          progress: 100,
          message: "Great news! Your project has been completed.",
          milestones: updatedMilestones.map(m => ({
            title: m.title,
            status: m.status,
          })),
          dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/client/projects/${id}`,
        }, { skipIfDisabled: true }).catch(error => {
          console.error("Failed to send completion email:", error);
        });
      }
      
      // Log progress update activity
      if (progress !== projectBefore.progress) {
        logProjectProgressUpdated(
          projectBefore.clientId,
          id,
          project.title,
          projectBefore.progress,
          progress
        ).catch(error => {
          console.error("Failed to log project progress update:", error);
        });
        
        // Log completion if progress reached 100%
        if (progress === 100 && projectBefore.progress < 100) {
          logProjectCompleted(projectBefore.clientId, id, project.title).catch(error => {
            console.error("Failed to log project completion:", error);
          });
        }
      }

      return project;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.project.delete({
        where: { id: input.id },
      });
    }),
});
