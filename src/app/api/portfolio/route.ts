import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFileFromR2 } from "@/lib/r2-client";

// GET - Fetch user's portfolio images
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userPortfolio = await prisma.portfolioImage.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        uploadedAt: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      images: userPortfolio.map(img => ({
        id: img.id,
        url: img.url,
        key: img.key,
        name: img.name,
        fileName: img.fileName,
        uploadedAt: img.uploadedAt.toISOString(),
        size: img.size,
        type: img.type,
      })),
      totalImages: userPortfolio.length,
      totalSize: userPortfolio.reduce((acc, img) => acc + (img.size || 0), 0),
    });

  } catch (error) {
    console.error("Error fetching portfolio images:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch portfolio images",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// POST - Add new portfolio image
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { url, key, name, fileName, size, type } = body;

    // Validation
    if (!url || !key || !name) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: url, key, name" },
        { status: 400 }
      );
    }

    // Check current portfolio count
    const currentCount = await prisma.portfolioImage.count({
      where: {
        userId: session.user.id,
      },
    });

    const MAX_PORTFOLIO_IMAGES = 15;
    if (currentCount >= MAX_PORTFOLIO_IMAGES) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Maximum ${MAX_PORTFOLIO_IMAGES} images allowed` 
        },
        { status: 400 }
      );
    }

    // Insert new portfolio image
    const newImage = await prisma.portfolioImage.create({
      data: {
        userId: session.user.id,
        url,
        key,
        name,
        fileName,
        size: size || 0,
        type: type || "image/unknown",
      },
    });

    return NextResponse.json({
      success: true,
      image: {
        id: newImage.id,
        url: newImage.url,
        key: newImage.key,
        name: newImage.name,
        fileName: newImage.fileName,
        uploadedAt: newImage.uploadedAt.toISOString(),
        size: newImage.size,
        type: newImage.type,
      },
      message: "Portfolio image added successfully",
    });

  } catch (error) {
    console.error("Error adding portfolio image:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to add portfolio image",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// DELETE - Remove portfolio image
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { key, id } = body;

    if (!key && !id) {
      return NextResponse.json(
        { success: false, error: "Either 'key' or 'id' is required" },
        { status: 400 }
      );
    }

    // Find the image to delete
    const whereCondition = key 
      ? { userId: session.user.id, key: key }
      : { userId: session.user.id, id: id };

    const imageToDelete = await prisma.portfolioImage.findFirst({
      where: whereCondition,
    });

    if (!imageToDelete) {
      return NextResponse.json(
        { success: false, error: "Portfolio image not found" },
        { status: 404 }
      );
    }

    // Delete from storage first
    try {
      await deleteFileFromR2(imageToDelete.key);
    } catch (storageError) {
      console.error("Error deleting from storage:", storageError);
      // Continue with database deletion even if storage deletion fails
    }

    // Delete from database
    await prisma.portfolioImage.delete({
      where: { id: imageToDelete.id },
    });

    return NextResponse.json({
      success: true,
      message: "Portfolio image deleted successfully",
      deletedImage: {
        id: imageToDelete.id,
        key: imageToDelete.key,
        name: imageToDelete.name,
      },
    });

  } catch (error) {
    console.error("Error deleting portfolio image:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to delete portfolio image",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// PATCH - Update portfolio image (optional, for reordering or updating metadata)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, name, order } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Image ID is required" },
        { status: 400 }
      );
    }

    // Check if image belongs to user
    const existingImage = await prisma.portfolioImage.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!existingImage) {
      return NextResponse.json(
        { success: false, error: "Portfolio image not found" },
        { status: 404 }
      );
    }

    // Update image metadata
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (order !== undefined) updateData.order = order;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const updatedImage = await prisma.portfolioImage.update({
      where: { id: id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      image: {
        id: updatedImage.id,
        url: updatedImage.url,
        key: updatedImage.key,
        name: updatedImage.name,
        fileName: updatedImage.fileName,
        uploadedAt: updatedImage.uploadedAt.toISOString(),
        size: updatedImage.size,
        type: updatedImage.type,
        order: updatedImage.order,
      },
      message: "Portfolio image updated successfully",
    });

  } catch (error) {
    console.error("Error updating portfolio image:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to update portfolio image",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
