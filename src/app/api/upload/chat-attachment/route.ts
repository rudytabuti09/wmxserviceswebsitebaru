import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { r2Client } from "@/lib/r2-client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain', 'application/zip', 'application/x-zip-compressed'
];

export async function POST(request: NextRequest) {
  try {
    console.log("[Chat Attachment API] Request received");
    
    const session = await getServerSession(authOptions);
    console.log("[Chat Attachment API] Session:", session ? "Valid" : "Invalid");
    console.log("[Chat Attachment API] Session details:", {
      userId: session?.user?.id,
      userRole: session?.user?.role,
      userEmail: session?.user?.email,
      sessionExists: !!session
    });
    
    if (!session?.user?.id) {
      console.log("[Chat Attachment API] Unauthorized - no session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Chat Attachment API] Parsing form data...");
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const projectId = formData.get("projectId") as string;
    
    console.log("[Chat Attachment API] File:", file ? file.name : "No file");
    console.log("[Chat Attachment API] Project ID:", projectId);

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!projectId) {
      return NextResponse.json({ error: "Project ID required" }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
    }

    // Verify user has access to project
    console.log("[Chat Attachment API] Checking project access for user:", session.user.id);
    
    let hasAccess = false;
    
    // If user is ADMIN, they can access all projects
    if (session.user.role === "ADMIN") {
      hasAccess = true;
      console.log("[Chat Attachment API] Admin user - access granted");
    } else {
      // Check if user has access to this specific project
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          clientId: session.user.id
        }
      });
      
      if (project) {
        hasAccess = true;
        console.log("[Chat Attachment API] Project found for user - access granted");
      } else {
        console.log("[Chat Attachment API] No project found for user:", { 
          projectId, 
          userId: session.user.id 
        });
      }
    }

    if (!hasAccess) {
      console.log("[Chat Attachment API] Access denied to project");
      return NextResponse.json({ error: "Access denied to project" }, { status: 403 });
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const uniqueFilename = `chat-attachments/${projectId}/${nanoid()}.${fileExtension}`;
    
    console.log("[Chat Attachment API] Generated filename:", uniqueFilename);
    console.log("[Chat Attachment API] R2 Config:", {
      bucket: process.env.R2_BUCKET_NAME,
      accountId: process.env.R2_ACCOUNT_ID ? "Set" : "Missing",
      accessKey: process.env.R2_ACCESS_KEY_ID ? "Set" : "Missing",
      secretKey: process.env.R2_SECRET_ACCESS_KEY ? "Set" : "Missing"
    });

    // Upload to R2
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: uniqueFilename,
      Body: fileBuffer,
      ContentType: file.type,
      ContentLength: file.size,
    });

    console.log("[Chat Attachment API] Uploading to R2...");
    await r2Client.send(uploadCommand);
    console.log("[Chat Attachment API] Upload successful");

    // Construct file URL
    const fileUrl = `${process.env.R2_PUBLIC_URL}/${uniqueFilename}`;

    // Return file info for frontend to use when sending message
    return NextResponse.json({
      success: true,
      file: {
        fileName: file.name,
        fileUrl: fileUrl,
        fileSize: file.size,
        mimeType: file.type,
        key: uniqueFilename
      }
    });

  } catch (error) {
    console.error("[Chat Attachment API] Error:", error);
    console.error("[Chat Attachment API] Error stack:", error instanceof Error ? error.stack : "No stack trace");
    return NextResponse.json(
      { error: "Failed to upload file", details: error instanceof Error ? error.message : String(error) }, 
      { status: 500 }
    );
  }
}
