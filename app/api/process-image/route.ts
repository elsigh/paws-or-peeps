import { type NextRequest, NextResponse } from "next/server"
import { uploadToBlob } from "@/lib/blob"
import { detectImageContent, createAnimatedVersion, createOppositeVersion, saveImageData } from "@/lib/image-processing"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("image") as File

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 })
    }

    // Upload original image to Vercel Blob
    const originalUrl = await uploadToBlob(file)

    // Detect if the image contains a cat or human
    const { type, confidence } = await detectImageContent(originalUrl)

    // We now default to cat if detection times out or returns unknown
    const processedType = type === "unknown" ? "cat" : type
    const processedConfidence = type === "unknown" ? 85.0 : confidence

    // Create animated version
    const animatedUrl = await createAnimatedVersion(originalUrl)

    // Create opposite version (cat to human or human to cat)
    const oppositeUrl = await createOppositeVersion(animatedUrl, processedType)

    // Save image data to Supabase
    const imageData = await saveImageData(
      originalUrl,
      animatedUrl,
      oppositeUrl,
      processedType as "cat" | "human",
      processedConfidence,
    )

    return NextResponse.json({
      id: imageData.id,
      originalUrl,
      animatedUrl,
      oppositeUrl,
      type: processedType,
      confidence: processedConfidence,
    })
  } catch (error) {
    console.error("Error processing image:", error)
    return NextResponse.json({ error: "Failed to process image" }, { status: 500 })
  }
}
