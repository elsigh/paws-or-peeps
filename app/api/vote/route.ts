import { type NextRequest, NextResponse } from "next/server"
import { saveVote, getVoteStats, getImageById } from "@/lib/image-processing"

export async function POST(request: NextRequest) {
  try {
    const { imageId, vote } = await request.json()

    if (!imageId || !vote) {
      return NextResponse.json({ error: "Image ID and vote are required" }, { status: 400 })
    }

    if (vote !== "cat" && vote !== "human") {
      return NextResponse.json({ error: 'Vote must be either "cat" or "human"' }, { status: 400 })
    }

    // Save the vote
    await saveVote(imageId, vote)

    // Get updated vote statistics
    const voteStats = await getVoteStats(imageId)

    // Get the image data
    const imageData = await getImageById(imageId)

    return NextResponse.json({
      success: true,
      voteStats,
      originalType: imageData.image_type,
    })
  } catch (error) {
    console.error("Error saving vote:", error)
    return NextResponse.json({ error: "Failed to save vote" }, { status: 500 })
  }
}
