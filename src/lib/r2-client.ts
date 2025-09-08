import { S3Client } from "@aws-sdk/client-s3";

// Create S3 client configured for Cloudflare R2
export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

// Configuration constants
export const R2_CONFIG = {
  bucketName: process.env.R2_BUCKET_NAME || "wmx-uploads",
  publicUrl: process.env.R2_PUBLIC_URL || "",
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxProfileImageSize: 5 * 1024 * 1024, // 5MB for profile images
  maxPortfolioImageSize: 8 * 1024 * 1024, // 8MB for portfolio images
  allowedImageTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  allowedImageExtensions: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
  allowedDocumentTypes: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "text/csv",
  ],
  allowedDocumentExtensions: [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt", ".csv"],
  // Malicious file signatures to block
  blockedSignatures: [
    "4D5A", // PE/COFF executable
    "5A4D", // MS-DOS executable
    "377ABCAF271C", // 7z archive
    "504B0304", // ZIP archive (only if not allowed document)
    "52617221", // RAR archive
  ],
};

// File type validation
export function isValidImageType(mimeType: string): boolean {
  return R2_CONFIG.allowedImageTypes.includes(mimeType);
}

export function isValidDocumentType(mimeType: string): boolean {
  return R2_CONFIG.allowedDocumentTypes.includes(mimeType);
}

export function isValidFileSize(size: number, uploadType?: string): boolean {
  switch (uploadType) {
    case 'profile':
      return size <= R2_CONFIG.maxProfileImageSize;
    case 'portfolio':
      return size <= R2_CONFIG.maxPortfolioImageSize;
    default:
      return size <= R2_CONFIG.maxFileSize;
  }
}

// Advanced file validation
export function validateFile(file: File, uploadType: string): { valid: boolean; error?: string } {
  // Check file size
  if (!isValidFileSize(file.size, uploadType)) {
    const maxSize = uploadType === 'profile' ? '5MB' : uploadType === 'portfolio' ? '8MB' : '10MB';
    return { valid: false, error: `File size exceeds ${maxSize} limit` };
  }

  // Check file extension
  const fileName = file.name.toLowerCase();
  const extension = '.' + fileName.split('.').pop();
  
  if (uploadType === 'profile' || uploadType === 'portfolio') {
    if (!R2_CONFIG.allowedImageExtensions.includes(extension)) {
      return { valid: false, error: `Invalid file extension. Allowed: ${R2_CONFIG.allowedImageExtensions.join(', ')}` };
    }
    if (!isValidImageType(file.type)) {
      return { valid: false, error: `Invalid image format. Allowed: ${R2_CONFIG.allowedImageTypes.join(', ')}` };
    }
  } else if (uploadType === 'attachment') {
    const isValidImg = R2_CONFIG.allowedImageExtensions.includes(extension) && isValidImageType(file.type);
    const isValidDoc = R2_CONFIG.allowedDocumentExtensions.includes(extension) && isValidDocumentType(file.type);
    
    if (!isValidImg && !isValidDoc) {
      return { valid: false, error: 'Invalid file format' };
    }
  }

  // Check for suspicious file names
  if (containsSuspiciousPatterns(fileName)) {
    return { valid: false, error: 'Invalid file name detected' };
  }

  return { valid: true };
}

// Check for suspicious file name patterns
export function containsSuspiciousPatterns(fileName: string): boolean {
  const suspiciousPatterns = [
    /\.(exe|bat|cmd|com|pif|scr|vbs|js|jar|app)$/i, // Executable extensions
    /\.(php|asp|jsp|pl|py|sh)$/i, // Script files
    /<script[^>]*>/i, // Script tags in filename
    /javascript:/i, // JavaScript protocol
    /data:/i, // Data URLs
    /\.\.[\/\\]/g, // Path traversal
    /[<>:"|\*\?]/g, // Invalid characters
  ];

  return suspiciousPatterns.some(pattern => pattern.test(fileName));
}

// Validate file signature (magic bytes)
export async function validateFileSignature(file: File): Promise<{ valid: boolean; error?: string }> {
  try {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const hex = Array.from(bytes.slice(0, 8))
      .map(b => b.toString(16).padStart(2, '0').toUpperCase())
      .join('');

    // Check for blocked signatures
    if (R2_CONFIG.blockedSignatures.some(sig => hex.startsWith(sig))) {
      return { valid: false, error: 'File type not allowed' };
    }

    // Validate image signatures
    if (file.type.startsWith('image/')) {
      const validImageSignatures = {
        'image/jpeg': ['FFD8FF'],
        'image/png': ['89504E47'],
        'image/gif': ['47494638'],
        'image/webp': ['52494646'],
      };

      const expectedSignatures = validImageSignatures[file.type as keyof typeof validImageSignatures];
      if (expectedSignatures && !expectedSignatures.some(sig => hex.startsWith(sig))) {
        return { valid: false, error: 'File signature does not match declared type' };
      }
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Failed to validate file signature' };
  }
}

// Generate unique file name
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  const nameWithoutExt = originalName.split('.').slice(0, -1).join('.');
  const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '-');
  
  return `${timestamp}-${randomString}-${sanitizedName}.${extension}`;
}

// Get file URL from R2
export function getFileUrl(key: string): string {
  // If you have a custom domain configured for R2
  if (process.env.R2_PUBLIC_URL) {
    return `${process.env.R2_PUBLIC_URL}/${key}`;
  }
  
  // Otherwise, use the R2 dev URL
  return `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_CONFIG.bucketName}/${key}`;
}

// Delete file from R2
export async function deleteFileFromR2(key: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
    
    const deleteCommand = new DeleteObjectCommand({
      Bucket: R2_CONFIG.bucketName,
      Key: key,
    });

    await r2Client.send(deleteCommand);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete file from R2:', error);
    return { success: false, error: 'Failed to delete file' };
  }
}
