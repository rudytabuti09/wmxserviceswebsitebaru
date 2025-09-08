"use client";

import React, { useState } from "react";
import { Image as ImageIcon, Upload, Plus, X, Check, AlertCircle, Trash2, Loader } from "lucide-react";
import { RetroFileUpload } from "./retro-upload";
import { RetroButton } from "./retro-button";
import { RetroCard } from "./retro-card";
import { usePortfolio } from "@/hooks/use-portfolio";

interface PortfolioUploadProps {
  maxImages?: number;
  className?: string;
  showCurrentImages?: boolean;
}

export function PortfolioUpload({
  maxImages = 15,
  className = "",
  showCurrentImages = true,
}: PortfolioUploadProps) {
  const [showUpload, setShowUpload] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  
  const {
    images,
    isLoading,
    isUploading,
    isDeleting,
    error,
    uploadImage,
    deleteImage,
    totalImages,
    totalSize,
    clearError,
  } = usePortfolio();

  const handleFileUpload = async (files: File[]) => {
    for (const file of files) {
      try {
        await uploadImage(file);
        setUploadSuccess(file.name);
        setTimeout(() => setUploadSuccess(null), 3000);
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }
  };

  const handleDeleteImage = async (key: string) => {
    if (confirm('Are you sure you want to delete this image?')) {
      setDeletingKey(key);
      try {
        await deleteImage(key);
      } finally {
        setDeletingKey(null);
      }
    }
  };

  const canAddMore = totalImages < maxImages;

  if (isLoading) {
    return (
      <div className={`portfolio-upload ${className}`}>
        <RetroCard padding="lg">
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "40px",
            color: "#666",
          }}>
            <Loader size={24} className="animate-spin" style={{ marginRight: "8px" }} />
            Loading portfolio images...
          </div>
        </RetroCard>
      </div>
    );
  }

  return (
    <div className={`portfolio-upload ${className}`}>
      <RetroCard padding="lg">
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}>
          <h3 style={{
            fontFamily: "Poppins, sans-serif",
            fontSize: "18px",
            fontWeight: 700,
            textTransform: "uppercase",
            color: "#111111",
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            <ImageIcon size={20} />
            Portfolio Images
          </h3>
          
          <div style={{
            fontSize: "14px",
            color: "#666",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            <span>{totalImages} / {maxImages}</span>
            {!canAddMore && (
              <AlertCircle size={16} color="#FF3EA5" />
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: "#FFE5E5",
            border: "2px solid #FF3EA5",
            boxShadow: "3px 3px 0px #FF3EA5",
            padding: "12px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#111111",
            fontWeight: 600,
          }}>
            <AlertCircle size={20} color="#FF3EA5" />
            {error}
            <button
              onClick={clearError}
              style={{
                marginLeft: "auto",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#FF3EA5",
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Current Images Grid */}
        {showCurrentImages && images.length > 0 && (
          <div style={{
            marginBottom: "20px",
          }}>
            <h4 style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "#111111",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}>
              Current Images ({totalImages})
            </h4>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
              gap: "12px",
            }}>
              {images.map((image) => (
                <div
                  key={image.id}
                  style={{
                    position: "relative",
                    aspectRatio: "1",
                    border: "2px solid #111111",
                    boxShadow: "3px 3px 0px #111111",
                    overflow: "hidden",
                    backgroundColor: "#FFF",
                  }}
                >
                  <img
                    src={image.url}
                    alt={image.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  
                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteImage(image.key)}
                    disabled={deletingKey === image.key || isDeleting}
                    style={{
                      position: "absolute",
                      top: "4px",
                      right: "4px",
                      backgroundColor: "#FF3EA5",
                      border: "1px solid #111111",
                      borderRadius: "4px",
                      color: "white",
                      cursor: deletingKey === image.key ? "not-allowed" : "pointer",
                      padding: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: deletingKey === image.key ? 0.6 : 1,
                    }}
                  >
                    {deletingKey === image.key ? (
                      <Loader size={12} className="animate-spin" />
                    ) : (
                      <Trash2 size={12} />
                    )}
                  </button>
                  
                  {/* Image Name */}
                  <div style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: "rgba(0,0,0,0.7)",
                    color: "white",
                    padding: "4px",
                    fontSize: "10px",
                    textAlign: "center",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}>
                    {image.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Success Message */}
        {uploadSuccess && (
          <div style={{
            backgroundColor: "#00FF00",
            border: "2px solid #111111",
            boxShadow: "3px 3px 0px #111111",
            padding: "12px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#111111",
            fontWeight: 600,
          }}>
            <Check size={20} />
            Successfully uploaded: {uploadSuccess}
          </div>
        )}

        {/* Add More Images Button */}
        {canAddMore && !showUpload && (
          <div style={{ textAlign: "center" }}>
            <RetroButton
              variant="primary"
              size="lg"
              onClick={() => setShowUpload(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                margin: "0 auto",
              }}
            >
              <Plus size={20} strokeWidth={3} />
              Add Portfolio Images
            </RetroButton>
          </div>
        )}

        {!canAddMore && !showUpload && (
          <div style={{
            textAlign: "center",
            padding: "20px",
            backgroundColor: "#FFF8DC",
            border: "2px solid #FFC700",
            color: "#111111",
          }}>
            <AlertCircle size={24} color="#FFC700" style={{ marginBottom: "8px" }} />
            <p style={{ margin: 0, fontWeight: 600 }}>
              Maximum images limit reached ({maxImages})
            </p>
          </div>
        )}

        {/* Upload Section */}
        {showUpload && (
          <div style={{
            marginTop: "20px",
            padding: "20px",
            backgroundColor: "#F8F8F8",
            border: "2px solid #111111",
            position: "relative",
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}>
              <h4 style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "#111111",
                margin: 0,
              }}>
                Upload Portfolio Images
              </h4>
              <button
                onClick={() => setShowUpload(false)}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#666",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{
              marginBottom: "16px",
              padding: "12px",
              backgroundColor: "#E8F4FD",
              border: "2px solid #3D52F1",
              fontSize: "14px",
              color: "#111111",
            }}>
              <strong>Tips:</strong>
              <ul style={{ margin: "8px 0 0 16px", paddingLeft: 0 }}>
                <li>Use high-quality images (minimum 800x600px)</li>
                <li>Supported formats: JPEG, PNG, GIF, WebP</li>
                <li>Maximum file size: 8MB per image</li>
                <li>You can upload multiple images at once</li>
              </ul>
            </div>

            <RetroFileUpload
              uploadType="portfolio"
              accept="image/*"
              maxSize={8}
              multiple={true}
              onUpload={handleUploadSuccess}
              onError={handleUploadError}
            />
          </div>
        )}
      </RetroCard>
    </div>
  );
}
