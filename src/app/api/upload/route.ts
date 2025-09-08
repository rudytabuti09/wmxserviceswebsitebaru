import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadToR2, generatePresignedUploadUrl } from "@/lib/upload-utils";
import { 
  isValidImageType, 
  isValidDocumentType, 
  isValidFileSize, 
  validateFile,
  validateFileSignature 
} from "@/lib/r2-client";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const uploadType = formData.get("type") as "profile" | "portfolio" | "attachment";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!uploadType) {
      return NextResponse.json({ error: "Upload type not specified" }, { status: 400 });
    }

    // Comprehensive file validation
    const fileValidation = validateFile(file as unknown as File, uploadType);
    if (!fileValidation.valid) {
      return NextResponse.json(
        { error: fileValidation.error },
        { status: 400 }
      );
    }

    // Validate file signature for security
    const signatureValidation = await validateFileSignature(file as unknown as File);
    if (!signatureValidation.valid) {
      return NextResponse.json(
        { error: signatureValidation.error },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to R2
    const result = await uploadToR2(buffer, file.name, file.type, uploadType);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Upload failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      key: result.key,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Generate presigned URL for direct client upload
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const fileName = searchParams.get("fileName");
    const mimeType = searchParams.get("mimeType");
    const uploadType = searchParams.get("type") as "profile" | "portfolio" | "attachment";

    if (!fileName || !mimeType || !uploadType) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Create a mock File object for validation
    const mockFile = {
      name: fileName,
      type: mimeType,
      size: 0, // We can't validate size for presigned URLs
    } as File;

    // Basic file validation (without size check)
    const extension = '.' + fileName.toLowerCase().split('.').pop();
    if (uploadType === "profile" || uploadType === "portfolio") {
      if (!isValidImageType(mimeType)) {
        return NextResponse.json(
          { error: "Invalid image format" },
          { status: 400 }
        );
      }
    } else if (uploadType === "attachment") {
      if (!isValidImageType(mimeType) && !isValidDocumentType(mimeType)) {
        return NextResponse.json(
          { error: "Invalid file format" },
          { status: 400 }
        );
      }
    }

    const result = await generatePresignedUploadUrl(fileName, mimeType, uploadType);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to generate upload URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      uploadUrl: result.uploadUrl,
      key: result.key,
    });
  } catch (error) {
    console.error("Presigned URL error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
