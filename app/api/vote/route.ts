import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get("imageId");

    if (!imageId) {
      return NextResponse.json(
        { error: "Image ID is required" },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Failed to create Supabase client" },
        { status: 500 },
      );
    }

    // Get the current user
    const { data: session } = await supabase.auth.getSession();
    if (!session.session?.user?.id) {
      return NextResponse.json({ vote: null, voteStats: null });
    }

    const userId = session.session.user.id;

    // Check if user has already voted on this image
    const { data: existingVote, error: voteCheckError } = await supabase
      .from("votes")
      .select("vote")
      .eq("image_id", imageId)
      .eq("voter_id", userId)
      .single();

    if (voteCheckError && voteCheckError.code !== "PGRST116") {
      return NextResponse.json(
        { error: "Failed to check existing vote" },
        { status: 500 },
      );
    }

    // Get vote stats
    const { data: votes, error: statsError } = await supabase
      .from("votes")
      .select("vote")
      .eq("image_id", imageId);

    if (statsError) {
      return NextResponse.json(
        { error: "Failed to get vote stats" },
        { status: 500 },
      );
    }

    const animalVotes = votes.filter((v) => v.vote === "animal").length;
    const humanVotes = votes.filter((v) => v.vote === "human").length;
    const totalVotes = animalVotes + humanVotes;

    const voteStats = {
      animalVotes,
      humanVotes,
      animalPercentage: totalVotes > 0 ? (animalVotes / totalVotes) * 100 : 0,
      humanPercentage: totalVotes > 0 ? (humanVotes / totalVotes) * 100 : 0,
      totalVotes,
    };

    return NextResponse.json({
      vote: existingVote?.vote || null,
      voteStats,
    });
  } catch (error) {
    console.error("Error in vote GET route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Failed to create Supabase client" },
        { status: 500 },
      );
    }

    const { imageId, vote } = await request.json();

    // Get the current user
    const { data: sessionResponse } = await supabase.auth.getSession();
    if (!sessionResponse.session?.user?.id) {
      return NextResponse.json(
        { error: "User must be logged in to vote" },
        { status: 401 },
      );
    }

    const userId = sessionResponse.session.user.id;

    // Get the image details to check if the user is voting on their own image
    const { data: imageData, error: imageError } = await supabase
      .from("images")
      .select("user_id")
      .eq("id", imageId)
      .single();

    if (imageError) {
      return NextResponse.json(
        { error: "Failed to fetch image details" },
        { status: 500 },
      );
    }

    if (imageData.user_id !== userId) {
      throw new Error("You are not the owner of this image.");
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
        { status: 500 },
      );
    }

    if (existingVote) {
      return NextResponse.json(
        { error: "User has already voted on this image" },
        { status: 400 },
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
        { status: 500 },
      );
    }

    // Create notification for the uploader if different from voter
    if (imageData.user_id !== userId) {
      try {
        const voteType = vote === "animal" ? "🐾 Animal" : "👤 Human";
        const voterName = sessionResponse.session.user.user_metadata.name;
        const notificationMessage = `${voterName} voted "${voteType}" on your upload!`;
        console.log("Creating notification for user:", {
          uploaderId: imageData.user_id,
          voterId: userId,
          imageId,
          voteType,
        });

        const { error: notificationError } = await supabase
          .from("notifications")
          .insert({
            user_id: imageData.user_id,
            type: "vote",
            message: notificationMessage,
            image_id: imageId,
            is_read: false,
          });

        if (notificationError) {
          console.error("Failed to create notification:", {
            error: notificationError,
            uploaderId: imageData.user_id,
            voterId: userId,
            imageId,
            voteType,
          });
        }
      } catch (notificationError) {
        console.error("Unexpected error creating notification:", {
          error: notificationError,
          uploaderId: imageData.user_id,
          voterId: userId,
          imageId,
          voteType: vote === "animal" ? "🐾 Animal" : "👤 Human",
        });
      }
    } else {
      console.log("Skipping notification - user is voting on their own image");
    }

    // Get updated vote stats
    const { data: votes, error: statsError } = await supabase
      .from("votes")
      .select("vote")
      .eq("image_id", imageId);

    if (statsError) {
      return NextResponse.json(
        { error: "Failed to get vote stats" },
        { status: 500 },
      );
    }

    const animalVotes = votes.filter((v) => v.vote === "animal").length;
    const humanVotes = votes.filter((v) => v.vote === "human").length;
    const totalVotes = animalVotes + humanVotes;

    const voteStats = {
      animalVotes,
      humanVotes,
      animalPercentage: totalVotes > 0 ? (animalVotes / totalVotes) * 100 : 0,
      humanPercentage: totalVotes > 0 ? (humanVotes / totalVotes) * 100 : 0,
      totalVotes,
    };

    revalidatePath("/results/[id]", "page");
    return NextResponse.json({ success: true, voteStats });
  } catch (error) {
    console.error("Error in vote route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
