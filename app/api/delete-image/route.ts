import { createClient } from "@/lib/supabase-server";
import { del } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  try {
    const { imageId } = await request.json();

    if (!imageId) {
      return NextResponse.json(
        { error: "Image ID is required" },
        { status: 400 },
      );
    }

    // Create Supabase client
    const supabase = await createClient();

    // Get current user session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const userId = session.user.id;

    // Get image data to verify ownership and get URLs for deletion
    const { data: imageData, error: fetchError } = await supabase
      .from("images")
      .select("*")
      .eq("id", imageId)
      .single();

    if (fetchError || !imageData) {
      console.error("Error fetching image:", fetchError);
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Verify ownership
    if (imageData.uploader_id !== userId) {
      console.error("Permission denied - user does not own image", {
        imageUploaderId: imageData.uploader_id,
        requestingUserId: userId,
      });
      return NextResponse.json(
        { error: "You don't have permission to delete this image" },
        { status: 403 },
      );
    }

    // Delete image files from Vercel Blob
    const urlsToDelete = [
      imageData.original_url,
      imageData.animated_url,
      imageData.opposite_url,
    ].filter(Boolean);

    // Delete each blob
    for (const url of urlsToDelete) {
      try {
        await del(url);
      } catch (blobError) {
        console.error(`Failed to delete blob at ${url}:`, blobError);
        // Continue with other deletions even if one fails
      }
    }

    // Delete votes associated with this image
    const { error: votesDeleteError } = await supabase
      .from("votes")
      .delete()
      .eq("image_id", imageId);

    if (votesDeleteError) {
      console.error("Error deleting votes:", votesDeleteError);
    }

    // Delete notifications associated with this image
    const { error: notificationsDeleteError } = await supabase
      .from("notifications")
      .delete()
      .eq("image_id", imageId);

    if (notificationsDeleteError) {
      console.error("Error deleting notifications:", notificationsDeleteError);
    }

    // Delete the image record from the database
    const { error: deleteError } = await supabase
      .from("images")
      .delete()
      .eq("id", imageId)
      .select()
      .single();

    if (deleteError) {
      console.error("Error deleting image:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete image from database" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in delete-image API:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
