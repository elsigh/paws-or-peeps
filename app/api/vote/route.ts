import { type NextRequest, NextResponse } from "next/server";
import { saveVote, getVoteStats, getImageById } from "@/lib/image-processing";
import { createClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const { imageId, vote } = await request.json();

    if (!imageId || !vote) {
      return NextResponse.json(
        { error: "Image ID and vote are required" },
        { status: 400 }
      );
    }

    if (vote !== "animal" && vote !== "human") {
      return NextResponse.json(
        { error: 'Vote must be either "animal" or "human"' },
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

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required to vote", requireAuth: true },
        { status: 401 }
      );
    }

    // Save the vote
    await saveVote(imageId, vote);

    // Get updated vote statistics
    const voteStats = await getVoteStats(imageId);

    // Get the image data
    const imageData = await getImageById(imageId);

    return NextResponse.json({
      success: true,
      voteStats,
      originalType: imageData.image_type,
    });
  } catch (error) {
    console.error("Error saving vote:", error);
    return NextResponse.json({ error: "Failed to save vote" }, { status: 500 });
  }
}
