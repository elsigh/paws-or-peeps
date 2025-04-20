import { createOppositeVersion } from "@/lib/image-processing";
import { createClient } from "@/lib/supabase-server";
import type { ImageData } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { imageId, newType } = await request.json();

    if (!imageId) {
      return NextResponse.json(
        { error: "Image ID is required" },
        { status: 400 },
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
        { status: 401 },
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
        { status: 500 },
      );
    }

    // Check if user is the uploader
    if (imageData.uploader_id !== currentUserId) {
      return NextResponse.json(
        { error: "Only the uploader can modify this image" },
        { status: 403 },
      );
    }

    // If newType is provided, this is a regeneration request
    if (newType) {
      // Check if there are votes for regeneration
      const { count, error: voteError } = await supabase
        .from("votes")
        .select("*", { count: "exact", head: true })
        .eq("image_id", imageId);

      if (voteError) {
        console.error("Error checking votes:", voteError);
        return NextResponse.json(
          { error: "Failed to check votes" },
          { status: 500 },
        );
      }

      if (count && count > 0) {
        return NextResponse.json(
          { error: "Cannot regenerate an image that has votes" },
          { status: 400 },
        );
      }
    }

    // Generate opposite image
    const oppositeUrl = await createOppositeVersion(
      imageData.original_url,
      imageData.image_type,
      newType || imageData.target_animal_type,
    );

    // Update the image in the database
    const updateData: Partial<ImageData> = {
      opposite_url: oppositeUrl,
      updated_at: new Date().toISOString(),
    };

    // Only update target_animal_type if newType is provided (regeneration)
    if (newType) {
      updateData.target_animal_type = newType;
    }

    const { error: updateError } = await supabase
      .from("images")
      .update(updateData)
      .eq("id", imageId);

    if (updateError) {
      console.error("Error updating image:", updateError);
      return NextResponse.json(
        { error: "Failed to update image" },
        { status: 500 },
      );
    }

    // Get the updated image data
    const { data: updatedImage, error: fetchError } = await supabase
      .from("images")
      .select("*")
      .eq("id", imageId)
      .single();
    console.debug("Updated image:", updatedImage);

    if (fetchError) {
      console.error("Error fetching updated image:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch updated image" },
        { status: 500 },
      );
    }

    // Revalidate the page
    revalidatePath(`/results/${imageId}`);

    return NextResponse.json({
      success: true,
      message: newType
        ? "Image regenerated successfully"
        : "Image generated successfully",
      oppositeUrl,
      image: updatedImage,
    });
  } catch (error) {
    console.error("Error in generate-opposite API:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
