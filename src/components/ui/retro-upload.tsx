"use client";

import React, { useState, useRef, ChangeEvent } from "react";
import { Upload, X, FileText, Image, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { RetroButton } from "./retro-button";
import { useUpload } from "@/hooks/use-upload";
import { validateFile, validateFileSignature } from "@/lib/r2-client";

interface FileUploadProps {
  onUpload?: (result: { url: string; key: string; fileName: string }) => void;
  onError?: (error: string) => void;
  accept?: string;
  maxSize?: number; // in MB
  uploadType: "profile" | "portfolio" | "attachment";
  multiple?: boolean;
  className?: string;
  disabled?: boolean;
}

export function RetroFileUpload({
  onUpload,
  onError,
  accept = "image/*",
  maxSize = 10,
  uploadType,
  multiple = false,
  className = "",
  disabled = false,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploadStatus, setUploadStatus] = useState<{ [key: string]: "success" | "error" | "uploading" | "validating" }>({});
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { uploadFile, isUploading } = useUpload();

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const selectedFiles = Array.from(e.target.files || []);
    const newValidationErrors: { [key: string]: string } = {};
    
    // Validate each file
    const validatedFiles: File[] = [];
    
    for (const file of selectedFiles) {
      setUploadStatus(prev => ({ ...prev, [file.name]: "validating" }));
      
      // Basic validation
      const validation = validateFile(file, uploadType);
      if (!validation.valid) {
        newValidationErrors[file.name] = validation.error || 'Validation failed';
        setUploadStatus(prev => ({ ...prev, [file.name]: "error" }));
        continue;
      }

      // File signature validation
      try {
        const signatureValidation = await validateFileSignature(file);
        if (!signatureValidation.valid) {
          newValidationErrors[file.name] = signatureValidation.error || 'Invalid file signature';
          setUploadStatus(prev => ({ ...prev, [file.name]: "error" }));
          continue;
        }
      } catch (error) {
        newValidationErrors[file.name] = 'File validation failed';
        setUploadStatus(prev => ({ ...prev, [file.name]: "error" }));
        continue;
      }

      // File is valid
      validatedFiles.push(file);
      
      // Generate previews for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews(prev => ({ ...prev, [file.name]: reader.result as string }));
        };
        reader.readAsDataURL(file);
      }
    }

    setValidationErrors(prev => ({ ...prev, ...newValidationErrors }));
    setFiles(multiple ? [...files, ...validatedFiles] : validatedFiles);
    
    // Clear the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    const removedFile = newFiles.splice(index, 1)[0];
    setFiles(newFiles);
    
    // Clean up preview
    const newPreviews = { ...previews };
    delete newPreviews[removedFile.name];
    setPreviews(newPreviews);
    
    // Clean up status
    const newStatus = { ...uploadStatus };
    delete newStatus[removedFile.name];
    setUploadStatus(newStatus);
  };

  const handleUpload = async () => {
    if (disabled || files.length === 0) return;

    for (const file of files) {
      setUploadStatus(prev => ({ ...prev, [file.name]: "uploading" }));
      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

      try {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            const current = prev[file.name] || 0;
            if (current >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return { ...prev, [file.name]: current + 15 };
          });
        }, 100);

        const result = await uploadFile(file, uploadType);
        
        clearInterval(progressInterval);
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        
        if (result.success && result.url && result.key) {
          setUploadStatus(prev => ({ ...prev, [file.name]: "success" }));
          onUpload?.({
            url: result.url,
            key: result.key,
            fileName: result.fileName || file.name,
          });
        } else {
          throw new Error(result.error || 'Upload failed');
        }
      } catch (error) {
        setUploadStatus(prev => ({ ...prev, [file.name]: "error" }));
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        setValidationErrors(prev => ({ ...prev, [file.name]: errorMessage }));
        onError?.(errorMessage);
      }
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <Image size={20} />;
    }
    return <FileText size={20} />;
  };

  return (
    <div className={`retro-upload-container ${className}`}>
      {/* Upload Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: "3px dashed #FF3EA5",
          backgroundColor: "#FFFFFF",
          padding: "40px",
          textAlign: "center",
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#FFC700";
          e.currentTarget.style.transform = "scale(1.02)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#FF3EA5";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
        
        <div style={{
          backgroundColor: "#FFC700",
          width: "80px",
          height: "80px",
          margin: "0 auto 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "3px solid #111111",
          boxShadow: "4px 4px 0px #111111",
          transform: "rotate(-5deg)",
        }}>
          <Upload size={40} strokeWidth={3} color="#111111" />
        </div>
        
        <h3 style={{
          fontFamily: "Poppins, sans-serif",
          fontSize: "20px",
          fontWeight: 700,
          color: "#111111",
          textTransform: "uppercase",
          marginBottom: "8px",
        }}>
          Drop Files Here
        </h3>
        <p style={{
          fontSize: "14px",
          color: "#666",
        }}>
          or click to browse ({accept}, max {maxSize}MB)
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div style={{ marginTop: "24px" }}>
          <h4 style={{
            fontFamily: "Poppins, sans-serif",
            fontSize: "16px",
            fontWeight: 700,
            color: "#111111",
            textTransform: "uppercase",
            marginBottom: "16px",
          }}>
            Selected Files ({files.length})
          </h4>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {files.map((file, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "2px solid #111111",
                  boxShadow: "3px 3px 0px #111111",
                  padding: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  position: "relative",
                }}
              >
                {/* Preview or Icon */}
                <div style={{
                  width: "50px",
                  height: "50px",
                  backgroundColor: previews[file.name] ? "transparent" : "#FF3EA5",
                  border: "2px solid #111111",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  overflow: "hidden",
                }}>
                  {previews[file.name] ? (
                    <img 
                      src={previews[file.name]} 
                      alt={file.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    getFileIcon(file)
                  )}
                </div>

                {/* File Info */}
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontWeight: 600,
                    fontSize: "14px",
                    color: "#111111",
                    marginBottom: "4px",
                  }}>
                    {file.name}
                  </p>
                  <p style={{
                    fontSize: "12px",
                    color: "#666",
                  }}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  
                  {/* Progress Bar */}
                  {uploadStatus[file.name] === "uploading" && (
                    <div style={{
                      height: "4px",
                      backgroundColor: "#E0E0E0",
                      marginTop: "8px",
                      position: "relative",
                      overflow: "hidden",
                    }}>
                      <div style={{
                        height: "100%",
                        width: `${uploadProgress[file.name] || 0}%`,
                        backgroundColor: "#FFC700",
                        transition: "width 0.3s",
                      }} />
                    </div>
                  )}
                </div>

                {/* Status Icon */}
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
                  {uploadStatus[file.name] === "uploading" && (
                    <Loader2 size={20} className="animate-spin" color="#FFC700" />
                  )}
                  {uploadStatus[file.name] === "success" && (
                    <CheckCircle size={20} color="#00C853" />
                  )}
                  {uploadStatus[file.name] === "error" && (
                    <AlertCircle size={20} color="#FF3EA5" />
                  )}
                  
                  {!uploading && (
                    <button
                      onClick={() => removeFile(index)}
                      style={{
                        backgroundColor: "#FF3EA5",
                        border: "2px solid #111111",
                        width: "28px",
                        height: "28px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        boxShadow: "2px 2px 0px #111111",
                      }}
                    >
                      <X size={16} color="#FFFFFF" strokeWidth={3} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Upload Button */}
          {files.length > 0 && !uploading && (
            <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
              <RetroButton 
                variant="primary" 
                size="lg"
                onClick={handleUpload}
                disabled={uploading}
              >
                Upload {files.length} File{files.length > 1 ? "s" : ""}
              </RetroButton>
              <RetroButton 
                variant="secondary" 
                size="lg"
                onClick={() => {
                  setFiles([]);
                  setPreviews({});
                  setUploadStatus({});
                }}
              >
                Clear All
              </RetroButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
