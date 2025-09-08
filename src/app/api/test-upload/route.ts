import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ 
    message: "Test endpoint works",
    env: {
      R2_BUCKET_NAME: process.env.R2_BUCKET_NAME || "Not set",
      R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID ? "Set" : "Not set",
      R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID ? "Set" : "Not set",
      R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY ? "Set" : "Not set",
      R2_PUBLIC_URL: process.env.R2_PUBLIC_URL || "Not set"
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    console.log("[Test Upload] Request received");
    
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }
    
    console.log("[Test Upload] File:", {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    return NextResponse.json({
      success: true,
      file: {
        name: file.name,
        size: file.size,
        type: file.type
      },
      message: "File received successfully (not uploaded to R2)"
    });
    
  } catch (error) {
    console.error("[Test Upload] Error:", error);
    return NextResponse.json(
      { error: "Test upload failed", details: String(error) }, 
      { status: 500 }
    );
  }
}
