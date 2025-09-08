import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "@/server/api/trpc";

export const deadlineRouter = createTRPCRouter({
  // Get user's upcoming deadlines (projects, milestones, invoices)
  getUpcoming: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
        daysAhead: z.number().min(1).max(365).default(30), // Look ahead 30 days
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const { limit = 10, daysAhead = 30 } = input || {};
      const userId = ctx.session.user.id;
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(now.getDate() + daysAhead);
      
      // Get project deadlines
      const projectDeadlines = await ctx.db.project.findMany({
        where: {
          clientId: userId,
          deadline: {
            not: null,
            gte: now,
            lte: futureDate,
          },
          status: {
            not: 'COMPLETED'
          }
        },
        select: {
          id: true,
          title: true,
          deadline: true,
          status: true,
        },
        orderBy: {
          deadline: 'asc'
        }
      });

      // Get milestone deadlines for user's projects
      const milestoneDeadlines = await ctx.db.milestone.findMany({
        where: {
          deadline: {
            not: null,
            gte: now,
            lte: futureDate,
          },
          status: {
            not: 'COMPLETED'
          },
          project: {
            clientId: userId
          }
        },
        select: {
          id: true,
          title: true,
          deadline: true,
          status: true,
          project: {
            select: {
              title: true,
            }
          }
        },
        orderBy: {
          deadline: 'asc'
        }
      });

      // Get invoice deadlines
      const invoiceDeadlines = await ctx.db.invoice.findMany({
        where: {
          clientId: userId,
          dueDate: {
            gte: now,
            lte: futureDate,
          },
          status: {
            in: ['PENDING', 'OVERDUE']
          }
        },
        select: {
          id: true,
          invoiceNumber: true,
          dueDate: true,
          amount: true,
          currency: true,
          project: {
            select: {
              title: true,
            }
          }
        },
        orderBy: {
          dueDate: 'asc'
        }
      });

      // Combine and format all deadlines
      const allDeadlines = [
        ...projectDeadlines.map(p => ({
          id: p.id,
          title: p.title,
          deadline: p.deadline!,
          type: 'project' as const,
          status: p.status,
        })),
        ...milestoneDeadlines.map(m => ({
          id: m.id,
          title: m.title,
          deadline: m.deadline!,
          type: 'milestone' as const,
          status: m.status,
          projectTitle: m.project.title,
        })),
        ...invoiceDeadlines.map(i => ({
          id: i.id,
          title: `Invoice ${i.invoiceNumber}`,
          deadline: i.dueDate,
          type: 'invoice' as const,
          status: 'PENDING',
          projectTitle: i.project.title,
          amount: i.amount,
          currency: i.currency,
        }))
      ];

      // Sort by deadline and limit results
      const sortedDeadlines = allDeadlines
        .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
        .slice(0, limit);

      return sortedDeadlines;
    }),

  // Get overdue items
  getOverdue: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const now = new Date();
    
    // Get overdue projects
    const overdueProjects = await ctx.db.project.findMany({
      where: {
        clientId: userId,
        deadline: {
          not: null,
          lt: now,
        },
        status: {
          not: 'COMPLETED'
        }
      },
      select: {
        id: true,
        title: true,
        deadline: true,
        status: true,
      }
    });

    // Get overdue milestones
    const overdueMilestones = await ctx.db.milestone.findMany({
      where: {
        deadline: {
          not: null,
          lt: now,
        },
        status: {
          not: 'COMPLETED'
        },
        project: {
          clientId: userId
        }
      },
      select: {
        id: true,
        title: true,
        deadline: true,
        status: true,
        project: {
          select: {
            title: true,
          }
        }
      }
    });

    // Get overdue invoices
    const overdueInvoices = await ctx.db.invoice.findMany({
      where: {
        clientId: userId,
        dueDate: {
          lt: now,
        },
        status: {
          in: ['PENDING', 'OVERDUE']
        }
      },
      select: {
        id: true,
        invoiceNumber: true,
        dueDate: true,
        amount: true,
        currency: true,
        project: {
          select: {
            title: true,
          }
        }
      }
    });

    const allOverdue = [
      ...overdueProjects.map(p => ({
        id: p.id,
        title: p.title,
        deadline: p.deadline!,
        type: 'project' as const,
        status: p.status,
      })),
      ...overdueMilestones.map(m => ({
        id: m.id,
        title: m.title,
        deadline: m.deadline!,
        type: 'milestone' as const,
        status: m.status,
        projectTitle: m.project.title,
      })),
      ...overdueInvoices.map(i => ({
        id: i.id,
        title: `Invoice ${i.invoiceNumber}`,
        deadline: i.dueDate,
        type: 'invoice' as const,
        status: 'OVERDUE',
        projectTitle: i.project.title,
        amount: i.amount,
        currency: i.currency,
      }))
    ];

    return allOverdue.sort((a, b) => b.deadline.getTime() - a.deadline.getTime());
  }),

  // Get deadline statistics
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const now = new Date();
    const urgentDate = new Date();
    urgentDate.setDate(now.getDate() + 1); // Next 24 hours
    const upcomingDate = new Date();
    upcomingDate.setDate(now.getDate() + 7); // Next 7 days

    // Count overdue items
    const overdueCount = await Promise.all([
      ctx.db.project.count({
        where: {
          clientId: userId,
          deadline: { not: null, lt: now },
          status: { not: 'COMPLETED' }
        }
      }),
      ctx.db.milestone.count({
        where: {
          deadline: { not: null, lt: now },
          status: { not: 'COMPLETED' },
          project: { clientId: userId }
        }
      }),
      ctx.db.invoice.count({
        where: {
          clientId: userId,
          dueDate: { lt: now },
          status: { in: ['PENDING', 'OVERDUE'] }
        }
      })
    ]);

    // Count urgent items (next 24 hours)
    const urgentCount = await Promise.all([
      ctx.db.project.count({
        where: {
          clientId: userId,
          deadline: { gte: now, lte: urgentDate },
          status: { not: 'COMPLETED' }
        }
      }),
      ctx.db.milestone.count({
        where: {
          deadline: { gte: now, lte: urgentDate },
          status: { not: 'COMPLETED' },
          project: { clientId: userId }
        }
      }),
      ctx.db.invoice.count({
        where: {
          clientId: userId,
          dueDate: { gte: now, lte: urgentDate },
          status: { in: ['PENDING', 'OVERDUE'] }
        }
      })
    ]);

    // Count upcoming items (next 7 days)
    const upcomingCount = await Promise.all([
      ctx.db.project.count({
        where: {
          clientId: userId,
          deadline: { gte: urgentDate, lte: upcomingDate },
          status: { not: 'COMPLETED' }
        }
      }),
      ctx.db.milestone.count({
        where: {
          deadline: { gte: urgentDate, lte: upcomingDate },
          status: { not: 'COMPLETED' },
          project: { clientId: userId }
        }
      }),
      ctx.db.invoice.count({
        where: {
          clientId: userId,
          dueDate: { gte: urgentDate, lte: upcomingDate },
          status: { in: ['PENDING', 'OVERDUE'] }
        }
      })
    ]);

    return {
      overdue: overdueCount.reduce((sum, count) => sum + count, 0),
      urgent: urgentCount.reduce((sum, count) => sum + count, 0),
      upcoming: upcomingCount.reduce((sum, count) => sum + count, 0),
    };
  }),

  // Admin: Get all deadlines across all projects
  getAllDeadlines: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        userId: z.string().optional(),
        type: z.enum(['project', 'milestone', 'invoice']).optional(),
        urgency: z.enum(['overdue', 'urgent', 'upcoming', 'all']).default('all'),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const { limit = 20, userId, type, urgency = 'all' } = input || {};
      const now = new Date();
      let dateFilter: any = {};

      switch (urgency) {
        case 'overdue':
          dateFilter = { lt: now };
          break;
        case 'urgent':
          const urgentDate = new Date();
          urgentDate.setDate(now.getDate() + 1);
          dateFilter = { gte: now, lte: urgentDate };
          break;
        case 'upcoming':
          const upcomingStart = new Date();
          upcomingStart.setDate(now.getDate() + 1);
          const upcomingEnd = new Date();
          upcomingEnd.setDate(now.getDate() + 7);
          dateFilter = { gte: upcomingStart, lte: upcomingEnd };
          break;
        default:
          dateFilter = { not: null };
          break;
      }

      const allDeadlines = [];

      // Get projects if requested
      if (!type || type === 'project') {
        const projects = await ctx.db.project.findMany({
          where: {
            ...(userId && { clientId: userId }),
            deadline: dateFilter,
            status: { not: 'COMPLETED' }
          },
          select: {
            id: true,
            title: true,
            deadline: true,
            status: true,
            client: {
              select: {
                name: true,
                email: true,
              }
            }
          }
        });

        allDeadlines.push(...projects.map(p => ({
          id: p.id,
          title: p.title,
          deadline: p.deadline!,
          type: 'project' as const,
          status: p.status,
          clientName: p.client.name || p.client.email,
        })));
      }

      // Get milestones if requested
      if (!type || type === 'milestone') {
        const milestones = await ctx.db.milestone.findMany({
          where: {
            deadline: dateFilter,
            status: { not: 'COMPLETED' },
            ...(userId && { project: { clientId: userId } })
          },
          select: {
            id: true,
            title: true,
            deadline: true,
            status: true,
            project: {
              select: {
                title: true,
                client: {
                  select: {
                    name: true,
                    email: true,
                  }
                }
              }
            }
          }
        });

        allDeadlines.push(...milestones.map(m => ({
          id: m.id,
          title: m.title,
          deadline: m.deadline!,
          type: 'milestone' as const,
          status: m.status,
          projectTitle: m.project.title,
          clientName: m.project.client.name || m.project.client.email,
        })));
      }

      // Get invoices if requested
      if (!type || type === 'invoice') {
        const invoices = await ctx.db.invoice.findMany({
          where: {
            ...(userId && { clientId: userId }),
            dueDate: dateFilter,
            status: { in: ['PENDING', 'OVERDUE'] }
          },
          select: {
            id: true,
            invoiceNumber: true,
            dueDate: true,
            amount: true,
            currency: true,
            project: {
              select: {
                title: true,
              }
            },
            client: {
              select: {
                name: true,
                email: true,
              }
            }
          }
        });

        allDeadlines.push(...invoices.map(i => ({
          id: i.id,
          title: `Invoice ${i.invoiceNumber}`,
          deadline: i.dueDate,
          type: 'invoice' as const,
          status: 'PENDING',
          projectTitle: i.project.title,
          clientName: i.client.name || i.client.email,
          amount: i.amount,
          currency: i.currency,
        })));
      }

      return allDeadlines
        .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
        .slice(0, limit);
    }),
});
