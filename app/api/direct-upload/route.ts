import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    console.log("Direct upload API route started")

    // Parse the JSON body
    const body = await request.json()

    // Extract file information
    const { filename, fileType, fileSize, fileData } = body

    if (!fileData) {
      return NextResponse.json({ error: "No file data provided" }, { status: 400 })
    }

    // Log file details (without the actual data which could be large)
    console.log("File received:", {
      name: filename,
      type: fileType,
      size: fileSize,
      dataLength: fileData.length,
    })

    // For base64 data, we'd normally extract the actual binary data here
    // const base64Data = fileData.split(',')[1]

    return NextResponse.json({
      success: true,
      message: "File data received successfully",
      fileDetails: {
        name: filename,
        type: fileType,
        size: fileSize,
      },
    })
  } catch (error) {
    console.error("Error in direct upload:", error)
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
