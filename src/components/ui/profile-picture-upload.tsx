"use client";

import React, { useState } from "react";
import { User, Camera, X, Check } from "lucide-react";
import { RetroFileUpload } from "./retro-upload";
import { RetroButton } from "./retro-button";
import { RetroCard } from "./retro-card";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";

interface ProfilePictureUploadProps {
  currentAvatarUrl?: string;
  onAvatarUpdate?: (newAvatarUrl: string) => void;
  className?: string;
}

export function ProfilePictureUpload({
  currentAvatarUrl,
  onAvatarUpdate,
  className = "",
}: ProfilePictureUploadProps) {
  const [showUpload, setShowUpload] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [tempAvatarUrl, setTempAvatarUrl] = useState<string | null>(null);
  const { data: session, update: updateSession } = useSession();

  // tRPC mutation to update user avatar
  const updateAvatar = trpc.user.updateAvatar.useMutation({
    onSuccess: (data) => {
      onAvatarUpdate?.(data.avatarUrl);
      updateSession(); // Refresh session data
      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
        setShowUpload(false);
      }, 2000);
    },
    onError: (error) => {
      console.error("Failed to update avatar:", error);
    },
  });

  const handleUploadSuccess = (result: { url: string; key: string; fileName: string }) => {
    setTempAvatarUrl(result.url);
    
    // Update user avatar in database
    updateAvatar.mutate({
      avatarUrl: result.url,
      avatarKey: result.key,
    });
  };

  const handleUploadError = (error: string) => {
    console.error("Upload error:", error);
    // You could show a toast notification here
  };

  const finalAvatarUrl = tempAvatarUrl || currentAvatarUrl || session?.user?.image;

  return (
    <div className={`profile-picture-upload ${className}`}>
      <RetroCard padding="lg" className="text-center">
        <h3 style={{
          fontFamily: "Poppins, sans-serif",
          fontSize: "18px",
          fontWeight: 700,
          textTransform: "uppercase",
          color: "#111111",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}>
          <User size={20} />
          Profile Picture
        </h3>

        {/* Current Avatar Display */}
        <div style={{
          position: "relative",
          display: "inline-block",
          marginBottom: "20px",
        }}>
          <div style={{
            width: "120px",
            height: "120px",
            backgroundColor: finalAvatarUrl ? "transparent" : "#FFC700",
            border: "4px solid #111111",
            boxShadow: "6px 6px 0px #111111",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            position: "relative",
          }}>
            {finalAvatarUrl ? (
              <img
                src={finalAvatarUrl}
                alt="Profile Picture"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <User size={40} color="#111111" strokeWidth={3} />
            )}
          </div>

          {/* Camera Overlay Button */}
          <button
            onClick={() => setShowUpload(!showUpload)}
            style={{
              position: "absolute",
              bottom: "-5px",
              right: "-5px",
              backgroundColor: "#FF3EA5",
              border: "3px solid #111111",
              boxShadow: "3px 3px 0px #111111",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.style.backgroundColor = "#FFC700";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.backgroundColor = "#FF3EA5";
            }}
          >
            <Camera size={20} color="#FFFFFF" strokeWidth={3} />
          </button>

          {/* Success Indicator */}
          {uploadSuccess && (
            <div style={{
              position: "absolute",
              top: "-10px",
              right: "-10px",
              backgroundColor: "#00FF00",
              border: "3px solid #111111",
              boxShadow: "3px 3px 0px #111111",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "bounce 0.5s",
            }}>
              <Check size={16} color="#111111" strokeWidth={3} />
            </div>
          )}
        </div>

        {/* Current avatar info */}
        <p style={{
          fontSize: "14px",
          color: "#666",
          marginBottom: "16px",
        }}>
          {finalAvatarUrl ? "Click camera to change" : "No profile picture set"}
        </p>

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
                Upload New Picture
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

            <RetroFileUpload
              uploadType="profile"
              accept="image/*"
              maxSize={5}
              multiple={false}
              onUpload={handleUploadSuccess}
              onError={handleUploadError}
              disabled={updateAvatar.isLoading}
            />

            {updateAvatar.isLoading && (
              <div style={{
                textAlign: "center",
                marginTop: "16px",
                padding: "12px",
                backgroundColor: "#FFC700",
                border: "2px solid #111111",
                color: "#111111",
                fontWeight: 600,
              }}>
                Updating profile picture...
              </div>
            )}
          </div>
        )}
      </RetroCard>
    </div>
  );
}
