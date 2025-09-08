import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { sendChatNotificationEmail } from "@/lib/email/services";

export const chatRouter = createTRPCRouter({
  getMessages: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Verify user has access to this project
      const project = await ctx.db.project.findFirst({
        where: {
          id: input.projectId,
          ...(ctx.session.user.role === "CLIENT" && {
            clientId: ctx.session.user.id,
          }),
        },
      });

      if (!project) {
        throw new Error("Project not found or access denied");
      }

      const messages = await ctx.db.chatMessage.findMany({
        where: { projectId: input.projectId },
        include: {
          sender: {
            select: {
              name: true,
              email: true,
              role: true,
              image: true,
            },
          },
          readBy: {
            select: {
              userId: true,
              readAt: true,
            },
          },
          attachments: true,
        },
        orderBy: { createdAt: "asc" },
      });

      // Mark messages as read for current user
      const unreadMessages = messages.filter(
        msg => msg.senderId !== ctx.session.user.id && 
        !msg.readBy.some(rb => rb.userId === ctx.session.user.id)
      );

      if (unreadMessages.length > 0) {
        await ctx.db.messageReadBy.createMany({
          data: unreadMessages.map(msg => ({
            messageId: msg.id,
            userId: ctx.session.user.id,
          })),
          skipDuplicates: true,
        });
      }

      return messages;
    }),

  sendMessage: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1),
        projectId: z.string(),
        receiverId: z.string().optional(),
        attachments: z.array(
          z.object({
            fileName: z.string(),
            fileUrl: z.string(),
            fileSize: z.number(),
            mimeType: z.string(),
          })
        ).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user has access to this project
      const project = await ctx.db.project.findFirst({
        where: {
          id: input.projectId,
          ...(ctx.session.user.role === "CLIENT" && {
            clientId: ctx.session.user.id,
          }),
        },
        include: {
          client: true,
        },
      });

      if (!project) {
        throw new Error("Project not found or access denied");
      }

      // Determine receiver based on sender role
      let receiverId = input.receiverId;
      if (!receiverId) {
        if (ctx.session.user.role === "CLIENT") {
          // Find an admin to send to (for simplicity, find first admin)
          const admin = await ctx.db.user.findFirst({
            where: { role: "ADMIN" },
          });
          receiverId = admin?.id;
        } else {
          // Admin sending to client
          receiverId = project.clientId;
        }
      }

      const message = await ctx.db.chatMessage.create({
        data: {
          content: input.content,
          senderId: ctx.session.user.id,
          receiverId,
          projectId: input.projectId,
          attachments: input.attachments ? {
            create: input.attachments.map(attachment => ({
              fileName: attachment.fileName,
              fileUrl: attachment.fileUrl,
              fileSize: attachment.fileSize,
              mimeType: attachment.mimeType,
            }))
          } : undefined,
        },
        include: {
          sender: {
            select: {
              name: true,
              email: true,
              role: true,
            },
          },
          receiver: {
            select: {
              name: true,
              email: true,
            },
          },
          attachments: true,
        },
      });
      
      // Send email notification to receiver if they have an email
      if (message.receiver?.email) {
        const chatUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${message.receiver ? (ctx.session.user.role === 'ADMIN' ? 'client' : 'admin') : 'client'}/projects/${input.projectId}`;
        
        sendChatNotificationEmail({
          to: message.receiver.email,
          recipientName: message.receiver.name || "User",
          senderName: message.sender.name || message.sender.email || "User",
          projectTitle: project.title,
          message: input.content,
          timestamp: new Date().toLocaleString(),
          chatUrl,
          isAdminSender: ctx.session.user.role === "ADMIN",
        }, { skipIfDisabled: true }).catch(error => {
          console.error("Failed to send chat notification email:", error);
        });
      }

      // Create in-app notification for receiver
      if (receiverId) {
        // Get receiver's role to determine correct URL
        const receiver = await ctx.db.user.findUnique({
          where: { id: receiverId },
          select: { role: true },
        });
        
        // Determine correct actionUrl based on receiver's role
        const actionUrl = receiver?.role === 'ADMIN' 
          ? `/admin/chat?project=${input.projectId}`
          : `/client/projects/${input.projectId}`;
        
        await ctx.db.notification.create({
          data: {
            userId: receiverId,
            title: `New message from ${message.sender.name || 'User'}`,
            message: `Project: ${project.title} - ${input.content.slice(0, 100)}${input.content.length > 100 ? '...' : ''}`,
            type: "MESSAGE",
            entityId: input.projectId,
            entityType: "PROJECT",
            actionUrl,
          },
        }).catch(error => {
          console.error("Failed to create notification:", error);
        });
      }
      
      return message;
    }),

  getConversations: adminProcedure.query(({ ctx }) => {
    return ctx.db.project.findMany({
      where: {
        messages: {
          some: {},
        },
      },
      include: {
        client: {
          select: {
            name: true,
            email: true,
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          include: {
            sender: {
              select: {
                name: true,
                role: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        messages: {
          _count: "desc",
        },
      },
    });
  }),

  // Get unread count for a user
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const unreadMessages = await ctx.db.chatMessage.findMany({
      where: {
        receiverId: ctx.session.user.id,
        NOT: {
          readBy: {
            some: {
              userId: ctx.session.user.id,
            },
          },
        },
      },
      select: {
        projectId: true,
      },
    });

    // Group by project
    const unreadByProject = unreadMessages.reduce((acc, msg) => {
      acc[msg.projectId] = (acc[msg.projectId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: unreadMessages.length,
      byProject: unreadByProject,
    };
  }),

  // Set typing status
  setTyping: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        isTyping: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.isTyping) {
        await ctx.db.userTyping.upsert({
          where: {
            userId_projectId: {
              userId: ctx.session.user.id,
              projectId: input.projectId,
            },
          },
          create: {
            userId: ctx.session.user.id,
            projectId: input.projectId,
            isTyping: true,
          },
          update: {
            isTyping: true,
            updatedAt: new Date(),
          },
        });
      } else {
        await ctx.db.userTyping.deleteMany({
          where: {
            userId: ctx.session.user.id,
            projectId: input.projectId,
          },
        });
      }

      return { success: true };
    }),

  // Get typing users for a project
  getTypingUsers: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Clean up old typing statuses (older than 10 seconds)
      await ctx.db.userTyping.deleteMany({
        where: {
          projectId: input.projectId,
          updatedAt: {
            lt: new Date(Date.now() - 10000), // 10 seconds
          },
        },
      });

      const typingUsers = await ctx.db.userTyping.findMany({
        where: {
          projectId: input.projectId,
          userId: {
            not: ctx.session.user.id,
          },
        },
        include: {
          user: {
            select: {
              name: true,
              role: true,
            },
          },
        },
      });

      return typingUsers;
    }),

  // Edit message
  editMessage: protectedProcedure
    .input(
      z.object({
        messageId: z.string(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user owns the message
      const message = await ctx.db.chatMessage.findUnique({
        where: { id: input.messageId },
      });

      if (!message || message.senderId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only edit your own messages",
        });
      }

      return ctx.db.chatMessage.update({
        where: { id: input.messageId },
        data: {
          content: input.content,
          isEdited: true,
          editedAt: new Date(),
        },
      });
    }),

  // Delete message
  deleteMessage: protectedProcedure
    .input(z.object({ messageId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user owns the message or is admin
      const message = await ctx.db.chatMessage.findUnique({
        where: { id: input.messageId },
      });

      if (!message) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Message not found",
        });
      }

      if (message.senderId !== ctx.session.user.id && ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own messages",
        });
      }

      await ctx.db.chatMessage.delete({
        where: { id: input.messageId },
      });

      return { success: true };
    }),

  // Clear all messages in a project chat (Admin only)
  clearProjectChat: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Only admins can clear project chats
      if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only administrators can clear project chats",
        });
      }

      // Verify the project exists and admin has access
      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId },
        select: { id: true, title: true },
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      // Delete all chat messages for this project
      // This will cascade delete MessageReadBy and MessageAttachment records
      const deleteResult = await ctx.db.chatMessage.deleteMany({
        where: {
          projectId: input.projectId,
        },
      });

      // Also clear any typing indicators for this project
      await ctx.db.userTyping.deleteMany({
        where: {
          projectId: input.projectId,
        },
      });

      return { 
        success: true, 
        deletedCount: deleteResult.count,
        projectTitle: project.title 
      };
    }),
});
