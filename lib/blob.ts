import { put } from "@vercel/blob"
import { nanoid } from "nanoid"

export async function uploadToBlob(file: File) {
  try {
    const filename = `${nanoid()}-${file.name}`
    const blob = await put(filename, file, { access: "public" })
    return blob.url
  } catch (error) {
    console.error("Error uploading to Vercel Blob:", error)
    throw new Error("Failed to upload image")
  }
}
