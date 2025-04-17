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
      throw new Error("BLOB_READ_WRITE_TOKEN is not set");
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

    // Create a timeout controller
    let timeoutId: NodeJS.Timeout | undefined = undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error("Upload timed out after 120 seconds"));
      }, 120000);
    });

    try {
      // Start the upload
      console.log("Starting Blob upload...");
      const startTime = Date.now();

      // Race the upload against the timeout
      const blob = await Promise.race([
        put(filename, file, { access: "public" }),
        timeoutPromise,
      ]);

      // Clear the timeout since upload succeeded
      clearTimeout(timeoutId);

      const uploadTime = Date.now() - startTime;
      console.log(`Blob upload completed in ${uploadTime}ms:`, blob.url);

      if (!blob || !blob.url) {
        console.error("Blob upload returned empty result");
        throw new Error("Failed to upload image to Blob storage");
      }

      console.log(`Successfully uploaded to Blob storage: ${blob.url}`);
      return blob.url;
    } catch (error) {
      // Clear the timeout to prevent memory leaks
      clearTimeout(timeoutId);
      throw error; // Re-throw to be handled by the outer catch
    }
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

    throw error;
  }
}
