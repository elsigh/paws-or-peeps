import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    console.log("Simple upload API route started")

    let formData
    try {
      formData = await request.formData()
      console.log("Form data parsed successfully")
    } catch (error) {
      console.error("Error parsing form data:", error)
      return NextResponse.json(
        {
          error: "Failed to parse form data",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 400 },
      )
    }

    const file = formData.get("image") as File | null

    if (!file) {
      console.error("No file found in form data")
      return NextResponse.json({ error: "No image file provided" }, { status: 400 })
    }

    // Just log file details and return success
    console.log("File received:", {
      name: file.name,
      type: file.type,
      size: file.size,
    })

    return NextResponse.json({
      success: true,
      message: "File received successfully",
      fileDetails: {
        name: file.name,
        type: file.type,
        size: file.size,
      },
    })
  } catch (error) {
    console.error("Error in simple upload:", error)
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
