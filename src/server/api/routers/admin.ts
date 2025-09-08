import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const adminRouter = createTRPCRouter({
  // Get all users with their roles
  getUsers: adminProcedure
    .query(async ({ ctx }) => {
      const users = await ctx.db.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          image: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      return users;
    }),

  // Promote user to admin
  promoteToAdmin: adminProcedure
    .input(z.object({
      userId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if user exists
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Update user role to ADMIN
      const updatedUser = await ctx.db.user.update({
        where: { id: input.userId },
        data: { role: "ADMIN" },
      });

      return {
        success: true,
        user: updatedUser,
        message: `User ${user.email} promoted to admin successfully`,
      };
    }),

  // Demote admin to client
  demoteToClient: adminProcedure
    .input(z.object({
      userId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Prevent demoting yourself
      if (ctx.session.user.id === input.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot demote yourself",
        });
      }

      // Check if user exists
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Count total admins
      const adminCount = await ctx.db.user.count({
        where: { role: "ADMIN" },
      });

      if (adminCount <= 1) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot demote the last admin",
        });
      }

      // Update user role to CLIENT
      const updatedUser = await ctx.db.user.update({
        where: { id: input.userId },
        data: { role: "CLIENT" },
      });

      return {
        success: true,
        user: updatedUser,
        message: `User ${user.email} demoted to client successfully`,
      };
    }),

  // Get admin statistics
  getAdminStats: adminProcedure
    .query(async ({ ctx }) => {
      const [totalUsers, adminCount, clientCount, totalProjects] = await Promise.all([
        ctx.db.user.count(),
        ctx.db.user.count({ where: { role: "ADMIN" } }),
        ctx.db.user.count({ where: { role: "CLIENT" } }),
        ctx.db.project.count(),
      ]);

      return {
        totalUsers,
        adminCount,
        clientCount,
        totalProjects,
      };
    }),

  // Get comprehensive analytics data
  getAnalytics: adminProcedure
    .input(z.object({
      dateRange: z.object({
        from: z.date().optional(),
        to: z.date().optional(),
      }).optional(),
      period: z.enum(['7d', '30d', '90d', '1y', 'all']).optional().default('30d'),
    }))
    .query(async ({ ctx, input }) => {
      const now = new Date();
      let dateFilter = {};
      
      // Calculate date range based on period
      if (input.dateRange?.from && input.dateRange?.to) {
        dateFilter = {
          createdAt: {
            gte: input.dateRange.from,
            lte: input.dateRange.to,
          },
        };
      } else {
        let startDate;
        switch (input.period) {
          case '7d':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case '30d':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case '90d':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
          case '1y':
            startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = null;
        }
        
        if (startDate) {
          dateFilter = {
            createdAt: {
              gte: startDate,
            },
          };
        }
      }

      // Get revenue data
      const payments = await ctx.db.payment.findMany({
        where: {
          status: 'COMPLETED',
          ...dateFilter,
        },
        include: {
          invoice: {
            include: {
              project: true,
              client: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      // Get project data with timeline
      const projects = await ctx.db.project.findMany({
        where: dateFilter,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          invoices: {
            include: {
              payments: true,
            },
          },
          milestones: true,
          _count: {
            select: {
              messages: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      // Get user activity data
      const users = await ctx.db.user.findMany({
        where: {
          role: 'CLIENT',
          ...dateFilter,
        },
        include: {
          projects: {
            include: {
              _count: {
                select: {
                  messages: true,
                },
              },
            },
          },
          invoices: {
            include: {
              payments: true,
            },
          },
          _count: {
            select: {
              sentMessages: true,
            },
          },
        },
        orderBy: {
          lastActiveAt: 'desc',
        },
      });

      // Get chat messages for activity tracking
      const messages = await ctx.db.chatMessage.findMany({
        where: dateFilter,
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
          project: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      // Calculate revenue metrics
      const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
      const averageProjectValue = projects.length > 0 
        ? projects.reduce((sum, project) => {
            const projectRevenue = project.invoices.reduce((pSum, invoice) => {
              return pSum + invoice.payments.filter(p => p.status === 'COMPLETED')
                .reduce((iSum, payment) => iSum + payment.amount, 0);
            }, 0);
            return sum + projectRevenue;
          }, 0) / projects.length
        : 0;

      // Calculate project metrics
      const projectStatusCounts = projects.reduce((acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const completionRate = projects.length > 0 
        ? (projectStatusCounts.COMPLETED || 0) / projects.length
        : 0;

      // Calculate client metrics
      const activeClients = users.filter(user => 
        user.lastActiveAt && 
        new Date(user.lastActiveAt).getTime() > (now.getTime() - 30 * 24 * 60 * 60 * 1000)
      ).length;

      const clientEngagement = users.map(user => ({
        id: user.id,
        name: user.name || user.email,
        email: user.email,
        projectCount: user.projects.length,
        messageCount: user._count.sentMessages,
        totalSpent: user.invoices.reduce((sum, invoice) => {
          return sum + invoice.payments.filter(p => p.status === 'COMPLETED')
            .reduce((pSum, payment) => pSum + payment.amount, 0);
        }, 0),
        lastActive: user.lastActiveAt,
      }));

      // Group data by time periods for charts
      const revenueByMonth = payments.reduce((acc, payment) => {
        const month = payment.createdAt.toISOString().substring(0, 7); // YYYY-MM
        acc[month] = (acc[month] || 0) + payment.amount;
        return acc;
      }, {} as Record<string, number>);

      const projectsByMonth = projects.reduce((acc, project) => {
        const month = project.createdAt.toISOString().substring(0, 7);
        if (!acc[month]) acc[month] = { created: 0, completed: 0 };
        acc[month].created++;
        if (project.status === 'COMPLETED') {
          acc[month].completed++;
        }
        return acc;
      }, {} as Record<string, { created: number; completed: number }>);

      const messagesByDay = messages.reduce((acc, message) => {
        const day = message.createdAt.toISOString().substring(0, 10); // YYYY-MM-DD
        if (!acc[day]) acc[day] = { total: 0, fromClients: 0, fromAdmins: 0 };
        acc[day].total++;
        if (message.sender.role === 'CLIENT') {
          acc[day].fromClients++;
        } else {
          acc[day].fromAdmins++;
        }
        return acc;
      }, {} as Record<string, { total: number; fromClients: number; fromAdmins: number }>);

      return {
        summary: {
          totalRevenue,
          averageProjectValue,
          totalProjects: projects.length,
          completedProjects: projectStatusCounts.COMPLETED || 0,
          activeProjects: projectStatusCounts.IN_PROGRESS || 0,
          completionRate,
          totalClients: users.length,
          activeClients,
          totalMessages: messages.length,
          averageMessagesPerProject: projects.length > 0 ? messages.length / projects.length : 0,
        },
        charts: {
          revenueByMonth: Object.entries(revenueByMonth).map(([month, amount]) => ({
            period: month,
            revenue: amount,
          })),
          projectsByMonth: Object.entries(projectsByMonth).map(([month, data]) => ({
            period: month,
            created: data.created,
            completed: data.completed,
          })),
          messagesByDay: Object.entries(messagesByDay).map(([day, data]) => ({
            date: day,
            total: data.total,
            fromClients: data.fromClients,
            fromAdmins: data.fromAdmins,
          })),
          projectStatus: Object.entries(projectStatusCounts).map(([status, count]) => ({
            status,
            count,
            percentage: projects.length > 0 ? (count / projects.length) * 100 : 0,
          })),
        },
        projects: projects.map(project => ({
          id: project.id,
          title: project.title,
          status: project.status,
          progress: project.progress,
          client: project.client,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
          messageCount: project._count.messages,
          revenue: project.invoices.reduce((sum, invoice) => {
            return sum + invoice.payments.filter(p => p.status === 'COMPLETED')
              .reduce((pSum, payment) => pSum + payment.amount, 0);
          }, 0),
          milestoneCount: project.milestones.length,
          completedMilestones: project.milestones.filter(m => m.status === 'COMPLETED').length,
        })),
        clients: clientEngagement,
        recentActivity: messages.slice(-50).map(message => ({
          id: message.id,
          type: 'message' as const,
          description: `${message.sender.name} sent a message in ${message.project.title}`,
          timestamp: message.createdAt,
          user: message.sender,
          project: message.project,
        })),
      };
    }),

  // Get project timeline data
  getProjectTimeline: adminProcedure
    .input(z.object({
      projectId: z.string().optional(),
      clientId: z.string().optional(),
      dateRange: z.object({
        from: z.date().optional(),
        to: z.date().optional(),
      }).optional(),
    }))
    .query(async ({ ctx, input }) => {
      let projectFilter = {};
      
      if (input.projectId) {
        projectFilter = { id: input.projectId };
      } else if (input.clientId) {
        projectFilter = { clientId: input.clientId };
      }

      let dateFilter = {};
      if (input.dateRange?.from && input.dateRange?.to) {
        dateFilter = {
          createdAt: {
            gte: input.dateRange.from,
            lte: input.dateRange.to,
          },
        };
      }

      const projects = await ctx.db.project.findMany({
        where: {
          ...projectFilter,
          ...dateFilter,
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          milestones: {
            orderBy: {
              order: 'asc',
            },
          },
          messages: {
            take: 5,
            orderBy: {
              createdAt: 'desc',
            },
            include: {
              sender: {
                select: {
                  name: true,
                  role: true,
                },
              },
            },
          },
          invoices: {
            include: {
              payments: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return projects.map(project => ({
        id: project.id,
        title: project.title,
        description: project.description,
        status: project.status,
        progress: project.progress,
        client: project.client,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        milestones: project.milestones.map(milestone => ({
          id: milestone.id,
          title: milestone.title,
          status: milestone.status,
          order: milestone.order,
          createdAt: milestone.createdAt,
          updatedAt: milestone.updatedAt,
        })),
        recentMessages: project.messages.map(message => ({
          id: message.id,
          content: message.content.substring(0, 100),
          createdAt: message.createdAt,
          sender: message.sender,
        })),
        financials: {
          totalInvoiced: project.invoices.reduce((sum, invoice) => sum + invoice.amount, 0),
          totalPaid: project.invoices.reduce((sum, invoice) => {
            return sum + invoice.payments.filter(p => p.status === 'COMPLETED')
              .reduce((pSum, payment) => pSum + payment.amount, 0);
          }, 0),
          pendingAmount: project.invoices.reduce((sum, invoice) => {
            const paidAmount = invoice.payments.filter(p => p.status === 'COMPLETED')
              .reduce((pSum, payment) => pSum + payment.amount, 0);
            return sum + Math.max(0, invoice.amount - paidAmount);
          }, 0),
        },
      }));
    }),
});
