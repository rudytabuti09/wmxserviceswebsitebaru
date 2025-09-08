import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, R2_CONFIG, generateUniqueFileName, getFileUrl } from "./r2-client";

export type UploadType = "profile" | "portfolio" | "attachment";

// Upload file to R2
export async function uploadToR2(
  file: Buffer | Uint8Array,
  originalName: string,
  mimeType: string,
  uploadType: UploadType
): Promise<{ success: boolean; url?: string; key?: string; error?: string }> {
  try {
    // Generate unique file name with folder structure
    const fileName = generateUniqueFileName(originalName);
    const key = `${uploadType}/${fileName}`;

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: R2_CONFIG.bucketName,
      Key: key,
      Body: file,
      ContentType: mimeType,
      // Add cache control for better performance
      CacheControl: "public, max-age=31536000",
    });

    await r2Client.send(command);

    // Get the public URL
    const url = getFileUrl(key);

    return {
      success: true,
      url,
      key,
    };
  } catch (error) {
    console.error("Error uploading to R2:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

// Delete file from R2
export async function deleteFromR2(key: string): Promise<{ success: boolean; error?: string }> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: R2_CONFIG.bucketName,
      Key: key,
    });

    await r2Client.send(command);

    return { success: true };
  } catch (error) {
    console.error("Error deleting from R2:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Delete failed",
    };
  }
}

// Generate presigned URL for direct upload from client
export async function generatePresignedUploadUrl(
  fileName: string,
  mimeType: string,
  uploadType: UploadType
): Promise<{ success: boolean; uploadUrl?: string; key?: string; error?: string }> {
  try {
    const uniqueFileName = generateUniqueFileName(fileName);
    const key = `${uploadType}/${uniqueFileName}`;

    const command = new PutObjectCommand({
      Bucket: R2_CONFIG.bucketName,
      Key: key,
      ContentType: mimeType,
    });

    // Generate presigned URL valid for 1 hour
    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });

    return {
      success: true,
      uploadUrl,
      key,
    };
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate upload URL",
    };
  }
}

// Generate presigned URL for file download
export async function generatePresignedDownloadUrl(
  key: string
): Promise<{ success: boolean; downloadUrl?: string; error?: string }> {
  try {
    const command = new GetObjectCommand({
      Bucket: R2_CONFIG.bucketName,
      Key: key,
    });

    // Generate presigned URL valid for 1 hour
    const downloadUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });

    return {
      success: true,
      downloadUrl,
    };
  } catch (error) {
    console.error("Error generating download URL:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate download URL",
    };
  }
}

// Process and validate image before upload
export async function processImage(
  file: File | Blob
): Promise<{ success: boolean; buffer?: Buffer; error?: string }> {
  try {
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // You can add image processing here (resize, compress, etc.)
    // For now, we'll just return the buffer

    return {
      success: true,
      buffer,
    };
  } catch (error) {
    console.error("Error processing image:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to process image",
    };
  }
}

// Batch upload multiple files
export async function batchUploadToR2(
  files: Array<{ file: Buffer | Uint8Array; name: string; mimeType: string }>,
  uploadType: UploadType
): Promise<Array<{ name: string; success: boolean; url?: string; key?: string; error?: string }>> {
  const uploadPromises = files.map(async ({ file, name, mimeType }) => {
    const result = await uploadToR2(file, name, mimeType, uploadType);
    return { name, ...result };
  });

  return Promise.all(uploadPromises);
}
