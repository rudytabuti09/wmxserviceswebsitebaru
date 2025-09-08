import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const searchRouter = createTRPCRouter({
  // Global search across all entities
  global: protectedProcedure
    .input(z.object({
      query: z.string().min(1).max(100),
      limit: z.number().min(1).max(50).default(10),
      type: z.enum(['all', 'projects', 'portfolio', 'messages', 'invoices', 'clients', 'files']).default('all'),
    }))
    .query(async ({ input, ctx }) => {
      const { query, limit, type } = input;
      const searchTerm = `%${query}%`;
      const results: {
        projects?: any[];
        portfolio?: any[];
        messages?: any[];
        invoices?: any[];
        clients?: any[];
        files?: any[];
      } = {};

      try {
        // Search Projects
        if (type === 'all' || type === 'projects') {
          const projects = await ctx.db.project.findMany({
            where: {
              AND: [
                ctx.session.user.role === "ADMIN" ? {} : { clientId: ctx.session.user.id },
                {
                  OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                  ]
                }
              ]
            },
            include: {
              client: {
                select: { name: true, email: true }
              },
              _count: {
                select: { messages: true, milestones: true }
              }
            },
            take: type === 'projects' ? limit : Math.min(limit, 5),
            orderBy: { updatedAt: 'desc' }
          });
          results.projects = projects;
        }

        // Search Portfolio
        if (type === 'all' || type === 'portfolio') {
          const portfolio = await ctx.db.portfolio.findMany({
            where: {
              OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { category: { contains: query, mode: 'insensitive' } },
                { technologies: { hasSome: [query] } },
              ]
            },
            take: type === 'portfolio' ? limit : Math.min(limit, 5),
            orderBy: [
              { featured: 'desc' },
              { createdAt: 'desc' }
            ]
          });
          results.portfolio = portfolio;
        }

        // Search Messages (Admin only)
        if ((type === 'all' || type === 'messages') && ctx.session.user.role === "ADMIN") {
          const messages = await ctx.db.message.findMany({
            where: {
              content: { contains: query, mode: 'insensitive' }
            },
            include: {
              sender: {
                select: { name: true, email: true, role: true }
              },
              project: {
                select: { title: true, id: true }
              }
            },
            take: type === 'messages' ? limit : Math.min(limit, 5),
            orderBy: { createdAt: 'desc' }
          });
          results.messages = messages;
        }

        // Search Invoices (Admin only)
        if ((type === 'all' || type === 'invoices') && ctx.session.user.role === "ADMIN") {
          const invoices = await ctx.db.invoice.findMany({
            where: {
              OR: [
                { invoiceNumber: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
              ]
            },
            include: {
              project: {
                select: { title: true }
              },
              client: {
                select: { name: true, email: true }
              }
            },
            take: type === 'invoices' ? limit : Math.min(limit, 5),
            orderBy: { createdAt: 'desc' }
          });
          results.invoices = invoices;
        }

        // Search Clients (Admin only)
        if ((type === 'all' || type === 'clients') && ctx.session.user.role === "ADMIN") {
          const clients = await ctx.db.user.findMany({
            where: {
              role: 'CLIENT',
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
              ]
            },
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              createdAt: true,
              _count: {
                select: { clientProjects: true }
              }
            },
            take: type === 'clients' ? limit : Math.min(limit, 5),
            orderBy: { createdAt: 'desc' }
          });
          results.clients = clients;
        }

        // Search Files (Admin only)
        if ((type === 'all' || type === 'files') && ctx.session.user.role === "ADMIN") {
          const files = await ctx.db.file.findMany({
            where: {
              fileName: { contains: query, mode: 'insensitive' }
            },
            include: {
              uploadedBy: {
                select: { name: true, email: true }
              },
              project: {
                select: { title: true }
              }
            },
            take: type === 'files' ? limit : Math.min(limit, 5),
            orderBy: { uploadedAt: 'desc' }
          });
          results.files = files;
        }

        return results;
      } catch (error) {
        console.error("Global search error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to perform search",
        });
      }
    }),

  // Advanced project search with filters
  projects: protectedProcedure
    .input(z.object({
      query: z.string().optional(),
      status: z.enum(['PLANNING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']).optional(),
      clientId: z.string().optional(),
      dateFrom: z.date().optional(),
      dateTo: z.date().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input, ctx }) => {
      const { query, status, clientId, dateFrom, dateTo, limit, offset } = input;

      const where: any = {
        AND: [
          ctx.session.user.role === "ADMIN" ? {} : { clientId: ctx.session.user.id },
        ]
      };

      if (query) {
        where.AND.push({
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ]
        });
      }

      if (status) {
        where.AND.push({ status });
      }

      if (clientId && ctx.session.user.role === "ADMIN") {
        where.AND.push({ clientId });
      }

      if (dateFrom || dateTo) {
        const dateFilter: any = {};
        if (dateFrom) dateFilter.gte = dateFrom;
        if (dateTo) dateFilter.lte = dateTo;
        where.AND.push({ createdAt: dateFilter });
      }

      const [projects, total] = await Promise.all([
        ctx.db.project.findMany({
          where,
          include: {
            client: {
              select: { name: true, email: true, image: true }
            },
            _count: {
              select: { messages: true, milestones: true }
            }
          },
          take: limit,
          skip: offset,
          orderBy: { updatedAt: 'desc' }
        }),
        ctx.db.project.count({ where })
      ]);

      return {
        projects,
        total,
        hasMore: offset + limit < total
      };
    }),

  // Advanced portfolio search with filters
  portfolio: protectedProcedure
    .input(z.object({
      query: z.string().optional(),
      category: z.string().optional(),
      featured: z.boolean().optional(),
      dateFrom: z.date().optional(),
      dateTo: z.date().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input, ctx }) => {
      const { query, category, featured, dateFrom, dateTo, limit, offset } = input;

      const where: any = {};

      if (query) {
        where.OR = [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { technologies: { hasSome: [query] } },
        ];
      }

      if (category) {
        where.category = category;
      }

      if (featured !== undefined) {
        where.featured = featured;
      }

      if (dateFrom || dateTo) {
        const dateFilter: any = {};
        if (dateFrom) dateFilter.gte = dateFrom;
        if (dateTo) dateFilter.lte = dateTo;
        where.createdAt = dateFilter;
      }

      const [portfolio, total] = await Promise.all([
        ctx.db.portfolio.findMany({
          where,
          take: limit,
          skip: offset,
          orderBy: [
            { featured: 'desc' },
            { createdAt: 'desc' }
          ]
        }),
        ctx.db.portfolio.count({ where })
      ]);

      return {
        portfolio,
        total,
        hasMore: offset + limit < total
      };
    }),

  // Invoice search with filters
  invoices: protectedProcedure
    .input(z.object({
      query: z.string().optional(),
      status: z.enum(['DRAFT', 'PENDING', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
      clientId: z.string().optional(),
      amountFrom: z.number().optional(),
      amountTo: z.number().optional(),
      dateFrom: z.date().optional(),
      dateTo: z.date().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input, ctx }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can search invoices",
        });
      }

      const { query, status, clientId, amountFrom, amountTo, dateFrom, dateTo, limit, offset } = input;

      const where: any = {};

      if (query) {
        where.OR = [
          { invoiceNumber: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ];
      }

      if (status) {
        where.status = status;
      }

      if (clientId) {
        where.clientId = clientId;
      }

      if (amountFrom !== undefined || amountTo !== undefined) {
        const amountFilter: any = {};
        if (amountFrom !== undefined) amountFilter.gte = amountFrom;
        if (amountTo !== undefined) amountFilter.lte = amountTo;
        where.amount = amountFilter;
      }

      if (dateFrom || dateTo) {
        const dateFilter: any = {};
        if (dateFrom) dateFilter.gte = dateFrom;
        if (dateTo) dateFilter.lte = dateTo;
        where.issuedAt = dateFilter;
      }

      const [invoices, total] = await Promise.all([
        ctx.db.invoice.findMany({
          where,
          include: {
            client: {
              select: { name: true, email: true }
            },
            project: {
              select: { title: true }
            }
          },
          take: limit,
          skip: offset,
          orderBy: { createdAt: 'desc' }
        }),
        ctx.db.invoice.count({ where })
      ]);

      return {
        invoices,
        total,
        hasMore: offset + limit < total
      };
    }),

  // Chat/Message search
  messages: protectedProcedure
    .input(z.object({
      query: z.string().min(1),
      projectId: z.string().optional(),
      senderId: z.string().optional(),
      dateFrom: z.date().optional(),
      dateTo: z.date().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input, ctx }) => {
      const { query, projectId, senderId, dateFrom, dateTo, limit, offset } = input;

      const where: any = {
        content: { contains: query, mode: 'insensitive' }
      };

      // Non-admin users can only search their own project messages
      if (ctx.session.user.role !== "ADMIN") {
        where.project = {
          clientId: ctx.session.user.id
        };
      } else if (projectId) {
        where.projectId = projectId;
      }

      if (senderId) {
        where.senderId = senderId;
      }

      if (dateFrom || dateTo) {
        const dateFilter: any = {};
        if (dateFrom) dateFilter.gte = dateFrom;
        if (dateTo) dateFilter.lte = dateTo;
        where.createdAt = dateFilter;
      }

      const [messages, total] = await Promise.all([
        ctx.db.message.findMany({
          where,
          include: {
            sender: {
              select: { name: true, email: true, role: true, image: true }
            },
            project: {
              select: { title: true, id: true }
            }
          },
          take: limit,
          skip: offset,
          orderBy: { createdAt: 'desc' }
        }),
        ctx.db.message.count({ where })
      ]);

      return {
        messages,
        total,
        hasMore: offset + limit < total
      };
    }),

  // Search suggestions/autocomplete
  suggestions: protectedProcedure
    .input(z.object({
      query: z.string().min(1).max(50),
      type: z.enum(['projects', 'portfolio', 'clients', 'tags']).default('projects'),
      limit: z.number().min(1).max(10).default(5),
    }))
    .query(async ({ input, ctx }) => {
      const { query, type, limit } = input;

      try {
        switch (type) {
          case 'projects':
            const projects = await ctx.db.project.findMany({
              where: {
                AND: [
                  ctx.session.user.role === "ADMIN" ? {} : { clientId: ctx.session.user.id },
                  { title: { contains: query, mode: 'insensitive' } }
                ]
              },
              select: {
                id: true,
                title: true,
                status: true
              },
              take: limit,
              orderBy: { updatedAt: 'desc' }
            });
            return projects.map(p => ({ 
              id: p.id, 
              title: p.title, 
              type: 'project',
              status: p.status 
            }));

          case 'portfolio':
            const portfolio = await ctx.db.portfolio.findMany({
              where: {
                title: { contains: query, mode: 'insensitive' }
              },
              select: {
                id: true,
                title: true,
                category: true,
                featured: true
              },
              take: limit,
              orderBy: { createdAt: 'desc' }
            });
            return portfolio.map(p => ({ 
              id: p.id, 
              title: p.title, 
              type: 'portfolio',
              category: p.category,
              featured: p.featured
            }));

          case 'clients':
            if (ctx.session.user.role !== "ADMIN") {
              return [];
            }
            const clients = await ctx.db.user.findMany({
              where: {
                role: 'CLIENT',
                OR: [
                  { name: { contains: query, mode: 'insensitive' } },
                  { email: { contains: query, mode: 'insensitive' } },
                ]
              },
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              },
              take: limit,
              orderBy: { name: 'asc' }
            });
            return clients.map(c => ({ 
              id: c.id, 
              title: c.name || c.email, 
              type: 'client',
              email: c.email,
              image: c.image
            }));

          case 'tags':
            // Get unique technologies/tags from portfolio
            const portfolioTags = await ctx.db.portfolio.findMany({
              where: {
                technologies: { hasSome: [query] }
              },
              select: { technologies: true },
              take: limit
            });
            const tags = portfolioTags
              .flatMap(p => p.technologies)
              .filter(tag => tag.toLowerCase().includes(query.toLowerCase()))
              .slice(0, limit);
            
            return [...new Set(tags)].map(tag => ({
              id: tag,
              title: tag,
              type: 'tag'
            }));

          default:
            return [];
        }
      } catch (error) {
        console.error("Suggestions error:", error);
        return [];
      }
    }),
});
