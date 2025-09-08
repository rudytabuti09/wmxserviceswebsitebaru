import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2Client } from "@/lib/r2-client";

export const filesRouter = createTRPCRouter({
  // Get all files with filtering and sorting
  getAllFiles: adminProcedure
    .input(z.object({
      category: z.enum(['all', 'attachment', 'portfolio', 'profile']).default('all'),
      sortBy: z.enum(['date', 'name', 'size', 'type']).default('date'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
      search: z.string().optional(),
      projectId: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { category, sortBy, sortOrder, search, projectId, limit, offset } = input;

      // Build where clause for filtering
      const whereConditions: any[] = [];

      if (category !== 'all') {
        if (category === 'attachment') {
          whereConditions.push({
            OR: [
              { messageAttachments: { some: {} } },
              { key: { contains: 'chat-attachments/' } }
            ]
          });
        } else if (category === 'portfolio') {
          whereConditions.push({
            OR: [
              { key: { contains: 'portfolio/' } },
              { portfolioImages: { some: {} } }
            ]
          });
        } else if (category === 'profile') {
          whereConditions.push({
            key: { contains: 'profiles/' }
          });
        }
      }

      if (search) {
        whereConditions.push({
          OR: [
            { fileName: { contains: search, mode: 'insensitive' } },
            { name: { contains: search, mode: 'insensitive' } },
            { type: { contains: search, mode: 'insensitive' } }
          ]
        });
      }

      if (projectId) {
        whereConditions.push({
          messageAttachments: {
            some: {
              message: {
                projectId: projectId
              }
            }
          }
        });
      }

      // Build orderBy clause
      let orderBy: any;
      switch (sortBy) {
        case 'name':
          orderBy = { fileName: sortOrder };
          break;
        case 'size':
          orderBy = { fileSize: sortOrder };
          break;
        case 'type':
          orderBy = { mimeType: sortOrder };
          break;
        case 'date':
        default:
          orderBy = { createdAt: sortOrder };
          break;
      }

      // Get files from different sources
      const [messageAttachments, portfolioImages] = await Promise.all([
        // Files from chat attachments
        ctx.db.messageAttachment.findMany({
          where: whereConditions.length > 0 ? { AND: whereConditions } : undefined,
          include: {
            message: {
              include: {
                project: { select: { id: true, title: true } },
                sender: { select: { id: true, name: true, email: true, role: true } }
              }
            }
          },
          orderBy,
          take: limit,
          skip: offset,
        }),
        // Files from portfolio
        ctx.db.portfolioImage.findMany({
          where: search ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { fileName: { contains: search, mode: 'insensitive' } }
            ]
          } : undefined,
          include: {
            user: { select: { id: true, name: true, email: true, role: true } }
          },
          orderBy: { createdAt: sortOrder },
          take: limit,
          skip: offset,
        })
      ]);

      // Transform and combine results
      const files = [
        ...messageAttachments.map(attachment => ({
          id: attachment.id,
          name: attachment.fileName,
          fileName: attachment.fileName,
          type: attachment.mimeType || 'application/octet-stream',
          size: attachment.fileSize || 0,
          url: attachment.fileUrl,
          uploadedAt: attachment.createdAt,
          uploadedBy: {
            id: attachment.message.sender.id,
            name: attachment.message.sender.name || attachment.message.sender.email,
            role: attachment.message.sender.role,
          },
          category: 'attachment' as const,
          project: attachment.message.project,
          source: 'chat' as const,
        })),
        ...portfolioImages.map(image => ({
          id: image.id,
          name: image.name,
          fileName: image.fileName,
          type: image.type || 'image/jpeg',
          size: image.size || 0,
          url: image.url,
          uploadedAt: image.uploadedAt,
          uploadedBy: {
            id: image.user.id,
            name: image.user.name || image.user.email,
            role: image.user.role,
          },
          category: 'portfolio' as const,
          project: null,
          source: 'portfolio' as const,
        }))
      ];

      // Sort combined results
      files.sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
          case 'name':
            comparison = a.fileName.localeCompare(b.fileName);
            break;
          case 'size':
            comparison = a.size - b.size;
            break;
          case 'type':
            comparison = a.type.localeCompare(b.type);
            break;
          case 'date':
          default:
            comparison = a.uploadedAt.getTime() - b.uploadedAt.getTime();
            break;
        }
        return sortOrder === 'desc' ? -comparison : comparison;
      });

      return {
        files: files.slice(0, limit),
        total: files.length,
        hasMore: files.length > limit
      };
    }),

  // Get files by project
  getFilesByProject: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      limit: z.number().min(1).max(50).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      // Verify user has access to project
      const project = await ctx.db.project.findFirst({
        where: {
          id: input.projectId,
          ...(ctx.session.user.role === "CLIENT" && {
            clientId: ctx.session.user.id,
          }),
        },
      });

      if (!project) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied to project",
        });
      }

      const attachments = await ctx.db.messageAttachment.findMany({
        where: {
          message: {
            projectId: input.projectId,
          }
        },
        include: {
          message: {
            include: {
              sender: { select: { id: true, name: true, email: true, role: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: input.limit,
        skip: input.offset,
      });

      return attachments.map(attachment => ({
        id: attachment.id,
        name: attachment.fileName,
        fileName: attachment.fileName,
        type: attachment.mimeType || 'application/octet-stream',
        size: attachment.fileSize || 0,
        url: attachment.fileUrl,
        uploadedAt: attachment.createdAt,
        uploadedBy: {
          id: attachment.message.sender.id,
          name: attachment.message.sender.name || attachment.message.sender.email,
          role: attachment.message.sender.role,
        },
        messageId: attachment.messageId,
      }));
    }),

  // Delete file
  deleteFile: adminProcedure
    .input(z.object({
      fileId: z.string(),
      source: z.enum(['chat', 'portfolio']),
    }))
    .mutation(async ({ ctx, input }) => {
      const { fileId, source } = input;

      try {
        if (source === 'chat') {
          // Delete chat attachment
          const attachment = await ctx.db.messageAttachment.findUnique({
            where: { id: fileId }
          });

          if (!attachment) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "File not found",
            });
          }

          // Delete from storage
          if (attachment.fileUrl) {
            const key = attachment.fileUrl.split('/').pop();
            if (key) {
              try {
                await r2Client.send(new DeleteObjectCommand({
                  Bucket: process.env.R2_BUCKET_NAME,
                  Key: key,
                }));
              } catch (storageError) {
                console.error("Failed to delete from storage:", storageError);
                // Continue with database deletion even if storage fails
              }
            }
          }

          // Delete from database
          await ctx.db.messageAttachment.delete({
            where: { id: fileId }
          });

        } else if (source === 'portfolio') {
          // Delete portfolio image
          const image = await ctx.db.portfolioImage.findUnique({
            where: { id: fileId }
          });

          if (!image) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "File not found",
            });
          }

          // Delete from storage
          if (image.key) {
            try {
              await r2Client.send(new DeleteObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME,
                Key: image.key,
              }));
            } catch (storageError) {
              console.error("Failed to delete from storage:", storageError);
              // Continue with database deletion even if storage fails
            }
          }

          // Delete from database
          await ctx.db.portfolioImage.delete({
            where: { id: fileId }
          });
        }

        return { success: true };

      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete file",
        });
      }
    }),

  // Bulk delete files
  bulkDeleteFiles: adminProcedure
    .input(z.object({
      files: z.array(z.object({
        fileId: z.string(),
        source: z.enum(['chat', 'portfolio']),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const { files } = input;
      const deletedFiles: string[] = [];
      const failedFiles: string[] = [];

      for (const file of files) {
        try {
          await ctx.db.$transaction(async (tx) => {
            if (file.source === 'chat') {
              const attachment = await tx.messageAttachment.findUnique({
                where: { id: file.fileId }
              });

              if (attachment) {
                // Delete from storage
                if (attachment.fileUrl) {
                  const key = attachment.fileUrl.split('/').pop();
                  if (key) {
                    try {
                      await r2Client.send(new DeleteObjectCommand({
                        Bucket: process.env.R2_BUCKET_NAME,
                        Key: key,
                      }));
                    } catch (storageError) {
                      console.error("Failed to delete from storage:", storageError);
                    }
                  }
                }

                // Delete from database
                await tx.messageAttachment.delete({
                  where: { id: file.fileId }
                });

                deletedFiles.push(file.fileId);
              }

            } else if (file.source === 'portfolio') {
              const image = await tx.portfolioImage.findUnique({
                where: { id: file.fileId }
              });

              if (image) {
                // Delete from storage
                if (image.key) {
                  try {
                    await r2Client.send(new DeleteObjectCommand({
                      Bucket: process.env.R2_BUCKET_NAME,
                      Key: image.key,
                    }));
                  } catch (storageError) {
                    console.error("Failed to delete from storage:", storageError);
                  }
                }

                // Delete from database
                await tx.portfolioImage.delete({
                  where: { id: file.fileId }
                });

                deletedFiles.push(file.fileId);
              }
            }
          });
        } catch (error) {
          console.error(`Failed to delete file ${file.fileId}:`, error);
          failedFiles.push(file.fileId);
        }
      }

      return {
        success: true,
        deletedFiles,
        failedFiles,
        deletedCount: deletedFiles.length,
        failedCount: failedFiles.length,
      };
    }),

  // Get file statistics
  getFileStatistics: adminProcedure.query(async ({ ctx }) => {
    const [
      totalAttachments,
      totalPortfolioImages,
      attachmentStats,
      portfolioStats,
      recentFiles
    ] = await Promise.all([
      // Total attachment count
      ctx.db.messageAttachment.count(),
      
      // Total portfolio images count
      ctx.db.portfolioImage.count(),

      // Attachment statistics
      ctx.db.messageAttachment.aggregate({
        _sum: { fileSize: true },
        _count: { id: true }
      }),

      // Portfolio statistics
      ctx.db.portfolioImage.aggregate({
        _sum: { size: true },
        _count: { id: true }
      }),

      // Recent files (last 7 days)
      Promise.all([
        ctx.db.messageAttachment.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        }),
        ctx.db.portfolioImage.count({
          where: {
            uploadedAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        })
      ])
    ]);

    const totalFiles = totalAttachments + totalPortfolioImages;
    const totalSize = (attachmentStats._sum.fileSize || 0) + (portfolioStats._sum.size || 0);
    const recentFilesCount = recentFiles[0] + recentFiles[1];

    return {
      totalFiles,
      totalSize,
      recentFiles: recentFilesCount,
      breakdown: {
        attachments: totalAttachments,
        portfolio: totalPortfolioImages,
      },
      sizeBreakdown: {
        attachments: attachmentStats._sum.fileSize || 0,
        portfolio: portfolioStats._sum.size || 0,
      }
    };
  }),

  // Share file with project
  shareFileWithProject: adminProcedure
    .input(z.object({
      fileId: z.string(),
      source: z.enum(['chat', 'portfolio']),
      targetProjectId: z.string(),
      message: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { fileId, source, targetProjectId, message } = input;

      // Verify target project exists
      const targetProject = await ctx.db.project.findUnique({
        where: { id: targetProjectId },
        include: { client: { select: { id: true, name: true, email: true } } }
      });

      if (!targetProject) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Target project not found",
        });
      }

      // Get file information
      let fileInfo: any = null;
      if (source === 'chat') {
        fileInfo = await ctx.db.messageAttachment.findUnique({
          where: { id: fileId },
          include: {
            message: {
              include: {
                project: { select: { title: true } },
                sender: { select: { name: true, email: true } }
              }
            }
          }
        });
      } else if (source === 'portfolio') {
        fileInfo = await ctx.db.portfolioImage.findUnique({
          where: { id: fileId },
          include: {
            user: { select: { name: true, email: true } }
          }
        });
      }

      if (!fileInfo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "File not found",
        });
      }

      // Create a message in the target project with file attachment
      const shareMessage = message || 
        `📎 Shared file: ${fileInfo.fileName}${source === 'chat' ? 
          ` (from project: ${fileInfo.message.project.title})` : 
          ' (from portfolio)'}`;

      // Create new message with the shared file
      await ctx.db.chatMessage.create({
        data: {
          content: shareMessage,
          senderId: ctx.session.user.id,
          projectId: targetProjectId,
          receiverId: targetProject.clientId,
          attachments: {
            create: {
              fileName: fileInfo.fileName || fileInfo.name,
              fileUrl: fileInfo.fileUrl || fileInfo.url,
              fileSize: fileInfo.fileSize || fileInfo.size,
              mimeType: fileInfo.mimeType || fileInfo.type,
            }
          }
        }
      });

      return { success: true, message: "File shared successfully" };
    }),
});
