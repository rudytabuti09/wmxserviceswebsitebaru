import { z } from "zod";
import { createTRPCRouter, publicProcedure, adminProcedure } from "@/server/api/trpc";

export const portfolioRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.portfolioItem.findMany({
      orderBy: [
        { featured: "desc" },
        { createdAt: "desc" },
      ],
    });
  }),

  getFeatured: publicProcedure.query(({ ctx }) => {
    return ctx.db.portfolioItem.findMany({
      where: { featured: true },
      take: 3,
      orderBy: { createdAt: "desc" },
    });
  }),

  getByCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.portfolioItem.findMany({
        where: { category: input.category },
        orderBy: { createdAt: "desc" },
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.portfolioItem.findUnique({
        where: { id: input.id },
      });
    }),

  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        imageUrl: z.string().url(),
        liveUrl: z.string().url().optional().nullable(),
        category: z.string().min(1),
        featured: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log("Portfolio create - Raw input:", input);
      console.log("Portfolio create - Input type:", typeof input);
      console.log("Portfolio create - Session:", ctx.session);
      
      // Clean up the input data before saving
      const data: any = {
        title: input.title,
        description: input.description,
        imageUrl: input.imageUrl,
        category: input.category,
        featured: input.featured,
      };
      
      // Only add liveUrl if it has a value
      if (input.liveUrl) {
        data.liveUrl = input.liveUrl;
      }
      
      console.log("Portfolio create - Data to save:", data);
      
      return ctx.db.portfolioItem.create({
        data,
      });
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        description: z.string().min(1).optional(),
        imageUrl: z.string().url().optional(),
        liveUrl: z.string().url().optional(),
        category: z.string().min(1).optional(),
        featured: z.boolean().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.portfolioItem.update({
        where: { id },
        data,
      });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.portfolioItem.delete({
        where: { id: input.id },
      });
    }),

  toggleFeatured: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const current = await ctx.db.portfolioItem.findUnique({
        where: { id: input.id },
        select: { featured: true },
      });

      return ctx.db.portfolioItem.update({
        where: { id: input.id },
        data: { featured: !current?.featured },
      });
    }),
});
