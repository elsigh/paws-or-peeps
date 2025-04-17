import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Failed to create Supabase client" },
        { status: 500 }
      );
    }

    const { imageId, vote } = await request.json();

    // Get the current user
    const { data: session } = await supabase.auth.getSession();
    if (!session.session?.user?.id) {
      return NextResponse.json(
        { error: "User must be logged in to vote" },
        { status: 401 }
      );
    }

    const userId = session.session.user.id;

    // Get the image details to check if the user is voting on their own image
    const { data: imageData, error: imageError } = await supabase
      .from("images")
      .select("uploader_id")
      .eq("id", imageId)
      .single();

    if (imageError) {
      return NextResponse.json(
        { error: "Failed to fetch image details" },
        { status: 500 }
      );
    }

    // Check if user has already voted on this image
    const { data: existingVote, error: voteCheckError } = await supabase
      .from("votes")
      .select("id")
      .eq("image_id", imageId)
      .eq("voter_id", userId)
      .single();

    if (voteCheckError && voteCheckError.code !== "PGRST116") {
      return NextResponse.json(
        { error: "Failed to check existing vote" },
        { status: 500 }
      );
    }

    if (existingVote) {
      return NextResponse.json(
        { error: "User has already voted on this image" },
        { status: 400 }
      );
    }

    // Insert the vote
    const { error: voteError } = await supabase.from("votes").insert({
      image_id: imageId,
      voter_id: userId,
      vote: vote,
    });

    if (voteError) {
      return NextResponse.json(
        { error: "Failed to submit vote" },
        { status: 500 }
      );
    }

    // Create notification for the uploader if different from voter
    if (imageData.uploader_id !== userId) {
      try {
        const voteType = vote === "animal" ? "🐾 Animal" : "👤 Human";
        await supabase.from("notifications").insert({
          user_id: imageData.uploader_id,
          type: "vote",
          message: `Someone voted "${voteType}" on your upload!`,
          image_id: imageId,
          read: false,
        });
      } catch (notificationError) {
        console.error("Failed to create notification:", notificationError);
        // Don't fail the request if notification creation fails
      }
    }

    revalidatePath("/results/[id]", "page");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in vote route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
