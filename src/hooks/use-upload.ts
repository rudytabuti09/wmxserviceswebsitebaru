"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  error?: string;
}

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { data: session } = useSession();

  const uploadFile = async (
    file: File,
    uploadType: "profile" | "portfolio" | "attachment"
  ): Promise<UploadResult> => {
    if (!session?.user) {
      return { success: false, error: "You must be signed in to upload files" };
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", uploadType);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setIsUploading(false);
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      setUploadError(errorMessage);
      setIsUploading(false);
      return { success: false, error: errorMessage };
    }
  };

  const uploadMultiple = async (
    files: File[],
    uploadType: "profile" | "portfolio" | "attachment"
  ): Promise<UploadResult[]> => {
    const results: UploadResult[] = [];
    
    for (const file of files) {
      const result = await uploadFile(file, uploadType);
      results.push(result);
    }
    
    return results;
  };

  const getPresignedUrl = async (
    fileName: string,
    mimeType: string,
    uploadType: "profile" | "portfolio" | "attachment"
  ): Promise<{ uploadUrl?: string; key?: string; error?: string }> => {
    if (!session?.user) {
      return { error: "You must be signed in to upload files" };
    }

    try {
      const params = new URLSearchParams({
        fileName,
        mimeType,
        type: uploadType,
      });

      const response = await fetch(`/api/upload?${params}`, {
        method: "GET",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get upload URL");
      }

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to get upload URL";
      return { error: errorMessage };
    }
  };

  // Direct upload to R2 using presigned URL
  const uploadDirect = async (
    file: File,
    uploadType: "profile" | "portfolio" | "attachment"
  ): Promise<UploadResult> => {
    if (!session?.user) {
      return { success: false, error: "You must be signed in to upload files" };
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Get presigned URL
      const { uploadUrl, key, error } = await getPresignedUrl(
        file.name,
        file.type,
        uploadType
      );

      if (error || !uploadUrl || !key) {
        throw new Error(error || "Failed to get upload URL");
      }

      // Upload directly to R2
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Direct upload to R2 failed");
      }

      // Construct the public URL
      const publicUrl = `${process.env.NEXT_PUBLIC_R2_URL || ""}/${key}`;

      setIsUploading(false);
      return {
        success: true,
        url: publicUrl,
        key,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      setUploadError(errorMessage);
      setIsUploading(false);
      return { success: false, error: errorMessage };
    }
  };

  return {
    uploadFile,
    uploadMultiple,
    uploadDirect,
    getPresignedUrl,
    isUploading,
    uploadError,
  };
}
