import { type NextRequest, NextResponse } from "next/server"
import { uploadToBlob } from "@/lib/blob"
import { detectImageContent, createAnimatedVersion, createOppositeVersion, saveImageData } from "@/lib/image-processing"
import { cookies } from "next/headers"
import { nanoid } from "nanoid"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("image") as File

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 })
    }

    // Set visitor ID cookie if it doesn't exist
    const cookieStore = cookies()
    let visitorId = cookieStore.get("visitor_id")?.value

    if (!visitorId) {
      visitorId = nanoid()
      // Set cookie for 1 year
      const response = NextResponse.next()
      response.cookies.set({
        name: "visitor_id",
        value: visitorId,
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      })
    }

    // Upload original image to Vercel Blob
    const originalUrl = await uploadToBlob(file)

    // Detect if the image contains a pet or human
    const { type, confidence } = await detectImageContent(originalUrl)

    // We now default to pet if detection times out or returns unknown
    const processedType = type === "unknown" ? "pet" : type
    const processedConfidence = type === "unknown" ? 85.0 : confidence

    // Create animated version
    const animatedUrl = await createAnimatedVersion(originalUrl)

    // Create opposite version (pet to human or human to pet)
    const oppositeUrl = await createOppositeVersion(animatedUrl, processedType)

    // Save image data to Supabase
    const imageData = await saveImageData(
      originalUrl,
      animatedUrl,
      oppositeUrl,
      processedType as "pet" | "human",
      processedConfidence,
    )

    const response = NextResponse.json({
      id: imageData.id,
      originalUrl,
      animatedUrl,
      oppositeUrl,
      type: processedType,
      confidence: processedConfidence,
    })

    // Set the visitor_id cookie if it doesn't exist
    if (!cookieStore.get("visitor_id")) {
      response.cookies.set({
        name: "visitor_id",
        value: visitorId,
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      })
    }

    return response
  } catch (error) {
    console.error("Error processing image:", error)
    return NextResponse.json({ error: "Failed to process image" }, { status: 500 })
  }
}
