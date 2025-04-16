import { type NextRequest, NextResponse } from "next/server";
import { toggleImagePrivacy } from "@/lib/image-processing";
import { createClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const { imageId } = await request.json();

    if (!imageId) {
      return NextResponse.json(
        { error: "Image ID is required" },
        { status: 400 }
      );
    }

    // Check if user is authenticated
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Failed to create Supabase client" },
        { status: 500 }
      );
    }

    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required", requireAuth: true },
        { status: 401 }
      );
    }

    // Toggle privacy
    const newPrivateStatus = await toggleImagePrivacy(imageId);

    return NextResponse.json({
      success: true,
      private: newPrivateStatus
    });
  } catch (error) {
    console.error("Error in toggle-privacy route:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "An unknown error occurred" 
      },
      { status: 500 }
    );
  }
}