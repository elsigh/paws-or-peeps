import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { nanoid } from "nanoid"

export async function GET() {
  try {
    // Check if the Blob token is available
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({
        status: "error",
        message: "BLOB_READ_WRITE_TOKEN is not set",
      })
    }

    // Create a simple text file to test Blob storage
    const testContent = `Test file created at ${new Date().toISOString()}`
    const testData = new Blob([testContent], { type: "text/plain" })
    const testFile = new File([testData], "blob-test.txt", { type: "text/plain" })

    // Generate a unique filename
    const filename = `test-${nanoid()}.txt`

    // Try to upload to Vercel Blob
    const blob = await put(filename, testFile, { access: "public" })

    if (!blob || !blob.url) {
      return NextResponse.json({
        status: "error",
        message: "Blob upload returned empty result",
      })
    }

    return NextResponse.json({
      status: "success",
      message: "Successfully uploaded test file to Blob storage",
      url: blob.url,
      content: testContent,
    })
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: `Error testing Blob storage: ${error instanceof Error ? error.message : String(error)}`,
      error: error instanceof Error ? error.stack : undefined,
    })
  }
}
