import { type NextRequest, NextResponse } from "next/server"
import { uploadToBlob } from "@/lib/blob"
import { detectImageContent, createAnimatedVersion, createOppositeVersion, saveImageData } from "@/lib/image-processing"
import { cookies } from "next/headers"
import { nanoid } from "nanoid"

// Update the export config to increase the body size limit
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "4mb",
    },
  },
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("image") as File

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 })
    }

    // Add file size validation on the server side as well
    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json({ error: "Image size must be less than 4MB" }, { status: 400 })
    }

    // Set visitor ID cookie if it doesn't exist
    const cookieStore = cookies()
    let visitorId = cookieStore.get("visitor_id")?.value

    if (!visitorId) {
      visitorId = nanoid()
    }

    // Upload original image to Vercel Blob
    let originalUrl
    try {
      console.log("Uploading to Vercel Blob...")
      originalUrl = await uploadToBlob(file)
      console.log("Upload successful:", originalUrl)
    } catch (error) {
      console.error("Error uploading to Vercel Blob:", error)
      return NextResponse.json(
        {
          error: "Failed to upload image to storage",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      )
    }

    // Detect if the image contains a pet or human
    let detectionResult
    try {
      console.log("Detecting image content...")
      detectionResult = await detectImageContent(originalUrl)
      console.log("Detection result:", detectionResult)
    } catch (error) {
      console.error("Error detecting image content:", error)
      return NextResponse.json(
        {
          error: "Failed to analyze image content",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      )
    }

    const { type, confidence } = detectionResult
    // We now default to pet if detection times out or returns unknown
    const processedType = type === "unknown" ? "pet" : type
    const processedConfidence = type === "unknown" ? 85.0 : confidence

    // Create animated version
    let animatedUrl
    try {
      console.log("Creating animated version...")
      animatedUrl = await createAnimatedVersion(originalUrl)
      console.log("Animated URL:", animatedUrl)
    } catch (error) {
      console.error("Error creating animated version:", error)
      return NextResponse.json(
        {
          error: "Failed to create animated version",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      )
    }

    // Create opposite version (pet to human or human to pet)
    let oppositeUrl
    try {
      console.log("Creating opposite version...")
      oppositeUrl = await createOppositeVersion(animatedUrl, processedType)
      console.log("Opposite URL:", oppositeUrl)
    } catch (error) {
      console.error("Error creating opposite version:", error)
      return NextResponse.json(
        {
          error: "Failed to create opposite version",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      )
    }

    // Save image data to Supabase
    let imageData
    try {
      console.log("Saving image data to database...")
      imageData = await saveImageData(
        originalUrl,
        animatedUrl,
        oppositeUrl,
        processedType as "pet" | "human",
        processedConfidence,
      )
      console.log("Image data saved successfully:", imageData.id)
    } catch (error) {
      console.error("Error saving image data:", error)
      return NextResponse.json(
        {
          error: "Failed to save image data to database",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      )
    }

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
    console.error("Unhandled error processing image:", error)
    return NextResponse.json(
      {
        error: "Failed to process image",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
