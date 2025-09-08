import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "@/server/api/trpc";
import { sendInvoiceReminderEmail, sendInvoiceNotificationEmail } from "@/lib/email/services";

export const paymentRouter = createTRPCRouter({
  // Get invoices for logged-in client
  getClientInvoices: protectedProcedure.query(({ ctx }) => {
    return ctx.db.invoice.findMany({
      where: {
        clientId: ctx.session.user.id,
      },
      include: {
        project: {
          select: {
            title: true,
          },
        },
        payments: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  // Get invoice by ID (with access control)
  getInvoiceById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.invoice.findFirst({
        where: {
          id: input.id,
          ...(ctx.session.user.role === "CLIENT" && {
            clientId: ctx.session.user.id,
          }),
        },
        include: {
          project: {
            select: {
              title: true,
            },
          },
          client: {
            select: {
              name: true,
              email: true,
            },
          },
          payments: {
            orderBy: { createdAt: "desc" },
          },
        },
      });
    }),

  // Admin: Get all invoices
  getAllInvoices: adminProcedure.query(({ ctx }) => {
    return ctx.db.invoice.findMany({
      include: {
        project: {
          select: {
            title: true,
          },
        },
        client: {
          select: {
            name: true,
            email: true,
          },
        },
        payments: {
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            payments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  // Admin: Create invoice
  createInvoice: adminProcedure
    .input(
      z.object({
        projectId: z.string(),
        clientId: z.string(),
        amount: z.number().positive(),
        currency: z.string().default("USD"),
        description: z.string().optional(),
        dueDate: z.string().datetime(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Generate invoice number
      const invoiceCount = await ctx.db.invoice.count();
      const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(4, "0")}`;

      const invoice = await ctx.db.invoice.create({
        data: {
          invoiceNumber,
          projectId: input.projectId,
          clientId: input.clientId,
          amount: input.amount,
          currency: input.currency,
          description: input.description,
          dueDate: new Date(input.dueDate),
          status: "PENDING",
        },
        include: {
          project: {
            select: {
              title: true,
            },
          },
          client: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });
      
      // Create notification for client
      try {
        await ctx.db.notification.create({
          data: {
            userId: invoice.clientId,
            title: "New Invoice Created",
            message: `You have received a new invoice ${invoice.invoiceNumber} for ${invoice.project.title}. Amount: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(invoice.amount)}`,
            type: "PAYMENT",
            entityId: invoice.id,
            entityType: "INVOICE",
            actionUrl: `/client/payment?invoice=${invoice.id}`,
          },
        });
      } catch (error) {
        console.error("Failed to create invoice notification:", error);
      }
      
      // Send invoice notification email to client
      if (invoice.client.email) {
        const paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/client/payment?invoice=${invoice.id}`;
        
        sendInvoiceNotificationEmail({
          to: invoice.client.email,
          clientName: invoice.client.name || "Valued Client",
          invoiceNumber: invoice.invoiceNumber,
          projectTitle: invoice.project.title,
          amount: invoice.amount,
          currency: invoice.currency,
          dueDate: new Date(input.dueDate).toLocaleDateString(),
          issuedDate: new Date().toLocaleDateString(),
          description: input.description,
          paymentUrl,
          companyName: "WMX Services",
        }, { skipIfDisabled: true }).catch(error => {
          console.error("Failed to send invoice notification email:", error);
        });
      }
      
      return invoice;
    }),

  // Admin: Update invoice
  updateInvoice: adminProcedure
    .input(
      z.object({
        id: z.string(),
        amount: z.number().positive().optional(),
        currency: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(["DRAFT", "PENDING", "PAID", "OVERDUE", "CANCELLED"]).optional(),
        dueDate: z.string().datetime().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const updateData = {
        ...data,
        ...(data.dueDate && { dueDate: new Date(data.dueDate) }),
      };

      const updatedInvoice = await ctx.db.invoice.update({
        where: { id },
        data: updateData,
        include: {
          project: { select: { title: true } },
          client: { select: { name: true, email: true } },
        },
      });

      // Create notification if status changed
      if (data.status) {
        try {
          const statusMessages = {
            PAID: "Your invoice has been marked as paid. Thank you!",
            CANCELLED: "Your invoice has been cancelled.",
            OVERDUE: "Your invoice is now overdue. Please make payment as soon as possible.",
            PENDING: "Your invoice status has been updated to pending.",
            DRAFT: "Your invoice is now in draft status.",
          };
          
          await ctx.db.notification.create({
            data: {
              userId: updatedInvoice.clientId,
              title: "Invoice Status Updated",
              message: `Invoice ${updatedInvoice.invoiceNumber}: ${statusMessages[data.status]}`,
              type: data.status === "PAID" ? "SUCCESS" : data.status === "OVERDUE" ? "WARNING" : "INFO",
              entityId: updatedInvoice.id,
              entityType: "INVOICE",
              actionUrl: `/client/payment?invoice=${updatedInvoice.id}`,
            },
          });
        } catch (error) {
          console.error("Failed to create status update notification:", error);
        }
      }

      return updatedInvoice;
    }),

  // Admin: Delete/Cancel invoice (soft delete)
  deleteInvoice: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invoice = await ctx.db.invoice.findUnique({
        where: { id: input.id },
        include: {
          client: { select: { name: true } },
          project: { select: { title: true } },
        },
      });

      if (!invoice) {
        throw new Error("Invoice not found");
      }

      if (invoice.status === "PAID") {
        throw new Error("Cannot delete a paid invoice");
      }

      // Soft delete by updating status to CANCELLED
      const cancelledInvoice = await ctx.db.invoice.update({
        where: { id: input.id },
        data: {
          status: "CANCELLED",
          updatedAt: new Date(),
        },
      });

      // Create notification for client
      try {
        await ctx.db.notification.create({
          data: {
            userId: invoice.clientId,
            title: "Invoice Cancelled",
            message: `Invoice ${invoice.invoiceNumber} for ${invoice.project.title} has been cancelled.`,
            type: "INFO",
            entityId: invoice.id,
            entityType: "INVOICE",
          },
        });
      } catch (error) {
        console.error("Failed to create cancellation notification:", error);
      }

      return cancelledInvoice;
    }),

  // Admin: Get invoice with full details for modal/edit
  getInvoiceDetails: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.invoice.findUnique({
        where: { id: input.id },
        include: {
          project: {
            select: {
              id: true,
              title: true,
              description: true,
              status: true,
            },
          },
          client: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          payments: {
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              amount: true,
              currency: true,
              status: true,
              paymentMethod: true,
              transactionId: true,
              paidAt: true,
              createdAt: true,
            },
          },
        },
      });
    }),

  // Create payment record (usually called from payment webhook)
  recordPayment: adminProcedure
    .input(
      z.object({
        invoiceId: z.string(),
        amount: z.number().positive(),
        currency: z.string().default("USD"),
        paymentMethod: z.string().optional(),
        transactionId: z.string().optional(),
        midtransOrderId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const payment = await ctx.db.payment.create({
        data: {
          ...input,
          status: "COMPLETED",
          paidAt: new Date(),
        },
      });

      // Get invoice with client info
      const invoice = await ctx.db.invoice.findUnique({
        where: { id: input.invoiceId },
        include: {
          project: {
            select: { title: true }
          },
          client: {
            select: { name: true, email: true }
          }
        }
      });

      // Update invoice status to PAID
      await ctx.db.invoice.update({
        where: { id: input.invoiceId },
        data: {
          status: "PAID",
          paidAt: new Date(),
        },
      });

      // Create payment success notification for client
      if (invoice) {
        try {
          await ctx.db.notification.create({
            data: {
              userId: invoice.clientId,
              title: "Payment Successful",
              message: `Your payment for invoice ${invoice.invoiceNumber} has been processed successfully. Thank you!`,
              type: "SUCCESS",
              entityId: input.invoiceId,
              entityType: "PAYMENT",
              actionUrl: `/client/payment?invoice=${input.invoiceId}`,
            },
          });
        } catch (error) {
          console.error("Failed to create payment success notification:", error);
        }
      }

      return payment;
    }),

  // Get payment statistics (Admin)
  getPaymentStats: adminProcedure.query(async ({ ctx }) => {
    const totalInvoices = await ctx.db.invoice.count();
    const paidInvoices = await ctx.db.invoice.count({
      where: { status: "PAID" },
    });
    const pendingInvoices = await ctx.db.invoice.count({
      where: { status: "PENDING" },
    });
    const overdueInvoices = await ctx.db.invoice.count({
      where: {
        status: "PENDING",
        dueDate: {
          lt: new Date(),
        },
      },
    });

    const totalRevenue = await ctx.db.payment.aggregate({
      where: { status: "COMPLETED" },
      _sum: { amount: true },
    });

    const pendingAmount = await ctx.db.invoice.aggregate({
      where: { status: "PENDING" },
      _sum: { amount: true },
    });

      return {
        totalInvoices,
        paidInvoices,
        pendingInvoices,
        overdueInvoices,
        totalRevenue: totalRevenue._sum.amount || 0,
        pendingAmount: pendingAmount._sum.amount || 0,
      };
    }),
    
  // Send invoice reminder manually or check for overdue invoices
  sendInvoiceReminders: adminProcedure
    .input(
      z.object({
        invoiceId: z.string().optional(),
        checkOverdue: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      let invoices;
      
      if (input.invoiceId) {
        // Send reminder for specific invoice
        invoices = await ctx.db.invoice.findMany({
          where: { 
            id: input.invoiceId,
            status: "PENDING",
          },
          include: {
            project: { select: { title: true } },
            client: { select: { name: true, email: true } },
          },
        });
      } else if (input.checkOverdue) {
        // Find all overdue invoices
        invoices = await ctx.db.invoice.findMany({
          where: {
            status: "PENDING",
            dueDate: {
              lt: new Date(),
            },
          },
          include: {
            project: { select: { title: true } },
            client: { select: { name: true, email: true } },
          },
        });
      } else {
        // Find invoices due within 3 days
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
        
        invoices = await ctx.db.invoice.findMany({
          where: {
            status: "PENDING",
            dueDate: {
              gte: new Date(),
              lte: threeDaysFromNow,
            },
          },
          include: {
            project: { select: { title: true } },
            client: { select: { name: true, email: true } },
          },
        });
      }
      
      let sentCount = 0;
      let failedCount = 0;
      
      for (const invoice of invoices) {
        if (!invoice.client.email) continue;
        
        const paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/client/payment?invoice=${invoice.id}`;
        const isOverdue = invoice.dueDate < new Date();
        
        try {
          await sendInvoiceReminderEmail({
            to: invoice.client.email,
            clientName: invoice.client.name || "Valued Client",
            invoiceNumber: invoice.invoiceNumber,
            amount: invoice.amount,
            currency: invoice.currency,
            dueDate: invoice.dueDate.toLocaleDateString(),
            projectTitle: invoice.project.title,
            paymentUrl,
            isOverdue,
          }, { skipIfDisabled: true });
          
          // Create reminder notification for client
          try {
            await ctx.db.notification.create({
              data: {
                userId: invoice.clientId,
                title: isOverdue ? "Payment Overdue" : "Payment Reminder",
                message: isOverdue 
                  ? `Your invoice ${invoice.invoiceNumber} is overdue. Please make payment as soon as possible.`
                  : `This is a friendly reminder that your invoice ${invoice.invoiceNumber} is due soon.`,
                type: isOverdue ? "WARNING" : "INFO",
                entityId: invoice.id,
                entityType: "INVOICE",
                actionUrl: `/client/payment?invoice=${invoice.id}`,
              },
            });
          } catch (notificationError) {
            console.error("Failed to create reminder notification:", notificationError);
          }
          
          sentCount++;
        } catch (error) {
          console.error(`Failed to send reminder for invoice ${invoice.invoiceNumber}:`, error);
          failedCount++;
        }
      }
      
      return {
        success: true,
        totalInvoices: invoices.length,
        sentCount,
        failedCount,
      };
    }),
});
