import { put } from "@vercel/blob";
import { nanoid } from "nanoid";

export async function uploadToBlob(file: File) {
  // Validate inputs
  if (!file) {
    throw new Error("No file provided for upload");
  }

  try {
    // Check if the Blob token is available
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("BLOB_READ_WRITE_TOKEN is not set");
      // Instead of failing, return a placeholder URL for development/testing
      return `/placeholder.svg?height=400&width=400&query=original image placeholder`;
    }

    // Clean the filename to avoid issues
    const safeFileName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .substring(0, 100);

    // Generate a unique filename with timestamp to avoid collisions
    const timestamp = Date.now();
    const uniqueId = nanoid(8);
    const filename = `${timestamp}-${uniqueId}-${safeFileName}`;

    console.log(
      `Attempting to upload file "${safeFileName}" to Blob storage...`
    );
    console.log("Blob token available:", !!process.env.BLOB_READ_WRITE_TOKEN);

    // Try to upload to Vercel Blob with timeout
    const uploadPromise = new Promise(async (resolve, reject) => {
      try {
        console.log("Starting Blob upload...");
        const blob = await put(filename, file, { access: "public" });
        console.log("Blob upload completed:", blob.url);
        resolve(blob);
      } catch (error) {
        console.error("Error in Blob upload promise:", error);
        reject(error);
      }
    });

    // Set a timeout for the upload (30 seconds)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        console.error("Blob upload timed out after 60 seconds");
        reject(new Error("Upload timed out after 60 seconds"));
      }, 60000);
    });

    // Race the upload against the timeout
    const blob = (await Promise.race([uploadPromise, timeoutPromise])) as any;

    if (!blob || !blob.url) {
      console.error("Blob upload returned empty result");
      // Return a placeholder instead of failing
      return `/placeholder.svg?height=400&width=400&query=original image placeholder`;
    }

    console.log(`Successfully uploaded to Blob storage: ${blob.url}`);
    return blob.url;
  } catch (error) {
    console.error("Error uploading to Vercel Blob:", error);

    // Log detailed error information
    if (error instanceof Error) {
      console.error(`Error name: ${error.name}, Message: ${error.message}`);
      console.error(`Stack trace: ${error.stack}`);

      // Check for specific Blob errors
      if (error.message.includes("BlobAccessError")) {
        console.error("Blob access error - check your Blob token");
      }
      if (error.message.includes("NetworkError")) {
        console.error("Network error while uploading");
      }
    }

    // Instead of failing the whole process, return a placeholder URL
    // This allows the rest of the flow to continue even if Blob storage fails
    return `/placeholder.svg?height=400&width=400&query=original image placeholder`;
  }
}
