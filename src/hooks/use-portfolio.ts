"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export interface PortfolioImage {
  id?: string;
  url: string;
  key: string;
  name: string;
  fileName: string;
  uploadedAt?: string;
  size?: number;
  type?: string;
}

interface UsePortfolioReturn {
  images: PortfolioImage[];
  isLoading: boolean;
  isUploading: boolean;
  isDeleting: boolean;
  error: string | null;
  // Actions
  uploadImage: (file: File) => Promise<void>;
  deleteImage: (imageKey: string) => Promise<void>;
  refreshImages: () => Promise<void>;
  clearError: () => void;
  // Stats
  totalImages: number;
  totalSize: number;
}

const MAX_PORTFOLIO_IMAGES = 15;
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB

export function usePortfolio(): UsePortfolioReturn {
  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch portfolio images
  const fetchImages = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch("/api/portfolio", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setImages(data.images || []);
      } else {
        throw new Error(data.error || "Failed to fetch portfolio images");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load portfolio images";
      setError(errorMessage);
      console.error("Error fetching portfolio:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Upload new image
  const uploadImage = useCallback(async (file: File) => {
    try {
      setIsUploading(true);
      setError(null);

      // Validation
      if (images.length >= MAX_PORTFOLIO_IMAGES) {
        throw new Error(`Maximum ${MAX_PORTFOLIO_IMAGES} images allowed`);
      }

      if (file.size > MAX_FILE_SIZE) {
        throw new Error("File size too large (maximum 8MB)");
      }

      if (!file.type.startsWith("image/")) {
        throw new Error("Only image files are allowed");
      }

      // Create form data
      const formData = new FormData();
      formData.append("file", file);
      formData.append("uploadType", "portfolio");

      // Upload file
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status}`);
      }

      const uploadData = await uploadResponse.json();
      
      if (!uploadData.success) {
        throw new Error(uploadData.error || "Upload failed");
      }

      // Save to portfolio
      const portfolioResponse = await fetch("/api/portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: uploadData.url,
          key: uploadData.key,
          name: file.name,
          fileName: uploadData.fileName,
          size: file.size,
          type: file.type,
        }),
      });

      if (!portfolioResponse.ok) {
        throw new Error(`Failed to save to portfolio: ${portfolioResponse.status}`);
      }

      const portfolioData = await portfolioResponse.json();
      
      if (!portfolioData.success) {
        throw new Error(portfolioData.error || "Failed to save to portfolio");
      }

      // Update local state
      const newImage: PortfolioImage = {
        id: portfolioData.id,
        url: uploadData.url,
        key: uploadData.key,
        name: file.name,
        fileName: uploadData.fileName,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      };

      setImages(prev => [...prev, newImage]);
      toast.success(`Successfully uploaded ${file.name}`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to upload image";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error uploading image:", err);
    } finally {
      setIsUploading(false);
    }
  }, [images.length]);

  // Delete image
  const deleteImage = useCallback(async (imageKey: string) => {
    try {
      setIsDeleting(true);
      setError(null);

      const response = await fetch("/api/portfolio", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key: imageKey }),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete image: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || "Failed to delete image");
      }

      // Update local state
      setImages(prev => prev.filter(img => img.key !== imageKey));
      toast.success("Image deleted successfully");
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete image";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error deleting image:", err);
    } finally {
      setIsDeleting(false);
    }
  }, []);

  // Refresh images
  const refreshImages = useCallback(async () => {
    await fetchImages();
  }, [fetchImages]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load images on mount
  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // Calculate stats
  const totalImages = images.length;
  const totalSize = images.reduce((acc, img) => acc + (img.size || 0), 0);

  return {
    images,
    isLoading,
    isUploading,
    isDeleting,
    error,
    uploadImage,
    deleteImage,
    refreshImages,
    clearError,
    totalImages,
    totalSize,
  };
}
