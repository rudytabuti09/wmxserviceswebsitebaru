"use client";

import { cn } from "@/lib/utils";

interface RetroSkeletonProps {
  className?: string;
  variant?: "text" | "card" | "button" | "avatar" | "thumbnail" | "custom";
  width?: string | number;
  height?: string | number;
  animate?: boolean;
  count?: number;
  borderStyle?: "solid" | "dashed" | "none";
}

/**
 * RetroSkeleton - 80s themed skeleton loader
 * Matches the existing retro design system with vibrant colors and hard shadows
 */
export function RetroSkeleton({
  className,
  variant = "custom",
  width,
  height,
  animate = true,
  count = 1,
  borderStyle = "solid",
}: RetroSkeletonProps) {
  const baseClasses = cn(
    "relative overflow-hidden",
    borderStyle !== "none" && "border-2 border-black",
    animate && "retro-skeleton-pulse",
    className
  );

  const getVariantStyles = () => {
    switch (variant) {
      case "text":
        return {
          width: width || "100%",
          height: height || "20px",
          backgroundColor: "#E0E0E0",
          boxShadow: "2px 2px 0px #111111",
        };
      case "card":
        return {
          width: width || "100%",
          height: height || "200px",
          backgroundColor: "#FFFFFF",
          boxShadow: "4px 4px 0px #111111",
        };
      case "button":
        return {
          width: width || "120px",
          height: height || "48px",
          backgroundColor: "#E0E0E0",
          boxShadow: "3px 3px 0px #111111",
        };
      case "avatar":
        return {
          width: width || "64px",
          height: height || "64px",
          backgroundColor: "#E0E0E0",
          borderRadius: "50%",
          boxShadow: "3px 3px 0px #111111",
        };
      case "thumbnail":
        return {
          width: width || "100%",
          height: height || "240px",
          backgroundColor: "#E0E0E0",
          boxShadow: "4px 4px 0px #111111",
        };
      default:
        return {
          width: width || "100%",
          height: height || "40px",
          backgroundColor: "#E0E0E0",
          boxShadow: "2px 2px 0px #111111",
        };
    }
  };

  const skeletonStyle = getVariantStyles();

  if (count > 1) {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={baseClasses}
            style={skeletonStyle}
            role="status"
            aria-label="Loading..."
          >
            {animate && (
              <div className="retro-skeleton-shimmer" />
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={baseClasses}
      style={skeletonStyle}
      role="status"
      aria-label="Loading..."
    >
      {animate && (
        <div className="retro-skeleton-shimmer" />
      )}
    </div>
  );
}

// Composite Skeleton Components for common patterns

export function RetroSkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4 p-6 bg-white border-2 border-black", className)}
         style={{ boxShadow: "6px 6px 0px #111111" }}>
      <RetroSkeleton variant="text" width="60%" height="28px" />
      <RetroSkeleton variant="text" count={3} />
      <div className="flex gap-3 mt-4">
        <RetroSkeleton variant="button" />
        <RetroSkeleton variant="button" width="100px" />
      </div>
    </div>
  );
}

export function RetroSkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white border-2 border-black p-4"
         style={{ boxShadow: "6px 6px 0px #111111" }}>
      {/* Header */}
      <div className="flex gap-4 pb-4 border-b-2 border-black">
        <RetroSkeleton variant="text" width="30%" height="24px" />
        <RetroSkeleton variant="text" width="25%" height="24px" />
        <RetroSkeleton variant="text" width="20%" height="24px" />
        <RetroSkeleton variant="text" width="25%" height="24px" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex gap-4 py-3 border-b border-gray-200">
          <RetroSkeleton variant="text" width="30%" height="20px" />
          <RetroSkeleton variant="text" width="25%" height="20px" />
          <RetroSkeleton variant="text" width="20%" height="20px" />
          <RetroSkeleton variant="text" width="25%" height="20px" />
        </div>
      ))}
    </div>
  );
}

export function RetroSkeletonGrid({ 
  items = 6, 
  cols = 3 
}: { 
  items?: number; 
  cols?: number;
}) {
  return (
    <div className={`grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-${cols}`}>
      {Array.from({ length: items }).map((_, index) => (
        <RetroSkeletonCard key={index} />
      ))}
    </div>
  );
}

export function RetroSkeletonProfile() {
  return (
    <div className="flex items-center gap-4 p-6 bg-white border-2 border-black"
         style={{ boxShadow: "4px 4px 0px #111111" }}>
      <RetroSkeleton variant="avatar" />
      <div className="flex-1 space-y-2">
        <RetroSkeleton variant="text" width="40%" height="24px" />
        <RetroSkeleton variant="text" width="60%" height="18px" />
      </div>
    </div>
  );
}

export function RetroSkeletonChat() {
  return (
    <div className="space-y-4 p-4">
      {/* Received message */}
      <div className="flex gap-3">
        <RetroSkeleton variant="avatar" width="40px" height="40px" />
        <div className="space-y-2 flex-1 max-w-[70%]">
          <RetroSkeleton variant="text" width="200px" height="40px" />
          <RetroSkeleton variant="text" width="100px" height="14px" />
        </div>
      </div>
      {/* Sent message */}
      <div className="flex gap-3 justify-end">
        <div className="space-y-2 max-w-[70%]">
          <RetroSkeleton variant="text" width="250px" height="40px" />
          <RetroSkeleton variant="text" width="100px" height="14px" className="ml-auto" />
        </div>
        <RetroSkeleton variant="avatar" width="40px" height="40px" />
      </div>
    </div>
  );
}

export function RetroSkeletonDashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border-2 border-black p-4"
               style={{ boxShadow: "4px 4px 0px #111111" }}>
            <RetroSkeleton variant="text" width="80%" height="18px" />
            <RetroSkeleton variant="text" width="60%" height="32px" className="mt-2" />
          </div>
        ))}
      </div>
      
      {/* Chart */}
      <RetroSkeleton variant="card" height="300px" />
      
      {/* Table */}
      <RetroSkeletonTable rows={5} />
    </div>
  );
}

export function RetroSkeletonStatsGrid({ stats = 4 }: { stats?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: stats }).map((_, i) => (
        <div key={i} className="bg-white border-2 border-black p-4"
             style={{ boxShadow: "4px 4px 0px #111111" }}>
          <RetroSkeleton variant="text" width="80%" height="18px" />
          <RetroSkeleton variant="text" width="60%" height="32px" className="mt-2" />
        </div>
      ))}
    </div>
  );
}

export function RetroSkeletonForm() {
  return (
    <div className="space-y-6 p-6 bg-white border-2 border-black"
         style={{ boxShadow: "6px 6px 0px #111111" }}>
      <RetroSkeleton variant="text" width="30%" height="32px" />
      
      <div className="space-y-4">
        <div>
          <RetroSkeleton variant="text" width="100px" height="16px" className="mb-2" />
          <RetroSkeleton variant="custom" height="48px" />
        </div>
        
        <div>
          <RetroSkeleton variant="text" width="100px" height="16px" className="mb-2" />
          <RetroSkeleton variant="custom" height="48px" />
        </div>
        
        <div>
          <RetroSkeleton variant="text" width="100px" height="16px" className="mb-2" />
          <RetroSkeleton variant="custom" height="120px" />
        </div>
      </div>
      
      <div className="flex gap-3">
        <RetroSkeleton variant="button" width="120px" />
        <RetroSkeleton variant="button" width="100px" />
      </div>
    </div>
  );
}
