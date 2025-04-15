import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createOppositeVersion } from "@/lib/image-processing";

export async function POST(request: NextRequest) {
  try {
    const { imageId, newType } = await request.json();

    if (!imageId || !newType) {
      return NextResponse.json(
        { error: "Image ID and new type are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current user's ID from session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const currentUserId = session?.user?.id;

    if (!currentUserId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get the image data
    const { data: imageData, error: imageError } = await supabase
      .from("images")
      .select("*")
      .eq("id", imageId)
      .single();

    if (imageError || !imageData) {
      console.error("Error fetching image:", imageError);
      return NextResponse.json(
        { error: "Failed to fetch image data" },
        { status: 500 }
      );
    }

    // Check if user is the uploader
    if (imageData.uploader_id !== currentUserId) {
      return NextResponse.json(
        { error: "Only the uploader can regenerate this image" },
        { status: 403 }
      );
    }

    // Check if there are votes
    const { count, error: voteError } = await supabase
      .from("votes")
      .select("*", { count: "exact", head: true })
      .eq("image_id", imageId);

    if (voteError) {
      console.error("Error checking votes:", voteError);
      return NextResponse.json(
        { error: "Failed to check votes" },
        { status: 500 }
      );
    }

    if (count && count > 0) {
      return NextResponse.json(
        { error: "Cannot regenerate an image that has votes" },
        { status: 400 }
      );
    }

    // Generate new opposite image
    const oppositeUrl = await createOppositeVersion(
      imageData.original_url,
      newType
    );

    // Update the image in the database
    const { error: updateError } = await supabase
      .from("images")
      .update({
        opposite_url: oppositeUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", imageId);

    if (updateError) {
      console.error("Error updating image:", updateError);
      return NextResponse.json(
        { error: "Failed to update image" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Image regenerated successfully",
      oppositeUrl,
    });
  } catch (error) {
    console.error("Error in regenerate-opposite API:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
