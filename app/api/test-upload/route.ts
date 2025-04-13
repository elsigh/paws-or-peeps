import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { nanoid } from "nanoid"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    // Log detailed information about the file
    console.log("Test upload file details:", {
      name: file.name,
      type: file.type,
      size: file.size,
    })

    // Check if the Blob token is available
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({
        success: false,
        error: "BLOB_READ_WRITE_TOKEN is not set",
        environmentVariables: {
          BLOB_READ_WRITE_TOKEN: !!process.env.BLOB_READ_WRITE_TOKEN,
        },
      })
    }

    // Generate a unique filename
    const filename = `test-${nanoid()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`

    console.log("Attempting to upload file to Blob storage:", filename)

    // Try to upload to Vercel Blob
    const startTime = Date.now()
    const blob = await put(filename, file, { access: "public" })
    const uploadTime = Date.now() - startTime

    console.log("Blob upload response:", blob)

    if (!blob || !blob.url) {
      return NextResponse.json({
        success: false,
        error: "Blob upload returned empty result",
      })
    }

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      url: blob.url,
      filename: blob.pathname,
      size: file.size,
      uploadTimeMs: uploadTime,
    })
  } catch (error) {
    console.error("Error in test upload:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Upload failed",
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
