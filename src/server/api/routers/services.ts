import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const servicesRouter = createTRPCRouter({
  // Get all visible services for public
  getAllVisible: publicProcedure.query(async ({ ctx }) => {
    const services = await ctx.db.service.findMany({
      where: {
        isVisible: true,
      },
      orderBy: {
        order: 'asc',
      },
    });
    return services;
  }),

  // Get all services for admin
  getAll: adminProcedure.query(async ({ ctx }) => {
    const services = await ctx.db.service.findMany({
      orderBy: {
        order: 'asc',
      },
    });
    return services;
  }),

  // Get single service
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const service = await ctx.db.service.findUnique({
        where: { id: input.id },
      });
      
      if (!service) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Service not found',
        });
      }
      
      return service;
    }),

  // Create new service
  create: adminProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      features: z.array(z.string()),
      icon: z.string(),
      category: z.string().default("Web"),
      price: z.number().min(0),
      isVisible: z.boolean().default(true),
      order: z.number().default(0),
    }))
    .mutation(async ({ ctx, input }) => {
      const service = await ctx.db.service.create({
        data: input,
      });
      return service;
    }),

  // Update service
  update: adminProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().min(1).optional(),
      description: z.string().min(1).optional(),
      features: z.array(z.string()).optional(),
      icon: z.string().optional(),
      category: z.string().optional(),
      price: z.number().min(0).optional(),
      isVisible: z.boolean().optional(),
      order: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      
      const service = await ctx.db.service.update({
        where: { id },
        data,
      });
      
      return service;
    }),

  // Delete service
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.service.delete({
        where: { id: input.id },
      });
      return { success: true };
    }),

  // Toggle visibility
  toggleVisibility: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const service = await ctx.db.service.findUnique({
        where: { id: input.id },
      });
      
      if (!service) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Service not found',
        });
      }
      
      const updated = await ctx.db.service.update({
        where: { id: input.id },
        data: {
          isVisible: !service.isVisible,
        },
      });
      
      return updated;
    }),

  // Update order
  updateOrder: adminProcedure
    .input(z.object({ 
      id: z.string(),
      order: z.number().min(1)
    }))
    .mutation(async ({ ctx, input }) => {
      const updated = await ctx.db.service.update({
        where: { id: input.id },
        data: {
          order: input.order,
        },
      });
      
      return updated;
    }),
});
