import { uploadToBlob } from "@/lib/blob";
import {
  type TransformationStyle,
  createAnimatedVersion,
  detectImageContent,
  saveImageData,
} from "@/lib/image-processing";
import { capitalize } from "@/lib/utils";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  console.log("API route started");

  // Create a new ReadableStream for sending progress updates
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Parse the form data
        const formData = await request.formData();
        const image = formData.get("image") as File;
        const style =
          (formData.get("style") as TransformationStyle) || "CHARMING";
        const isPrivate = formData.get("private") === "true";

        if (!image) {
          controller.enqueue(
            encoder.encode(
              `${JSON.stringify({
                status: "error",
                message: "No image file provided",
              })}\n`,
            ),
          );
          controller.close();
          return;
        }

        // Send initial status
        controller.enqueue(
          encoder.encode(
            `${JSON.stringify({
              status: "progress",
              step: "starting",
              message: "Processing started...",
              progress: 5,
            })}\n`,
          ),
        );

        // Upload original image to Vercel Blob
        controller.enqueue(
          encoder.encode(
            `${JSON.stringify({
              status: "progress",
              step: "uploading",
              message: "Uploading image...",
              progress: 10,
            })}\n`,
          ),
        );

        console.log("Starting image upload to Blob...");
        let originalUrl = "";
        try {
          originalUrl = await uploadToBlob(image);

          controller.enqueue(
            encoder.encode(
              `${JSON.stringify({
                status: "progress",
                step: "uploaded",
                message: "Image uploaded successfully",
                progress: 20,
              })}\n`,
            ),
          );

          // Verify the URL is valid
          if (
            !originalUrl ||
            (originalUrl.startsWith("/placeholder") &&
              process.env.NODE_ENV === "production")
          ) {
            controller.enqueue(
              encoder.encode(
                `${JSON.stringify({
                  status: "error",
                  message: "Failed to upload image to storage",
                })}\n`,
              ),
            );
            controller.close();
            return;
          }
        } catch (_error) {
          controller.enqueue(
            encoder.encode(
              `${JSON.stringify({
                status: "error",
                message: "Failed to upload image to storage",
              })}\n`,
            ),
          );
          controller.close();
          return;
        }

        // Use AI to detect if the image contains a pet or human
        controller.enqueue(
          encoder.encode(
            `${JSON.stringify({
              status: "progress",
              step: "detecting",
              message: "Detecting image content...",
              progress: 25,
            })}\n`,
          ),
        );

        console.log("Detecting image content...");
        let detectionResult = "";
        try {
          detectionResult = await detectImageContent(originalUrl);
          console.log("Detection result:", detectionResult);

          controller.enqueue(
            encoder.encode(
              `${JSON.stringify({
                status: "progress",
                step: "detected",
                message: `Detected: ${capitalize(detectionResult)}`,
                progress: 35,
              })}\n`,
            ),
          );
        } catch (error) {
          controller.enqueue(
            encoder.encode(
              `${JSON.stringify({
                status: "error",
                message: `Error detecting image content: ${error}`,
              })}\n`,
            ),
          );
          controller.close();
          return;
        }

        // Generate animated version
        controller.enqueue(
          encoder.encode(
            `${JSON.stringify({
              status: "progress",
              step: "animating",
              message: "Creating stylized version...",
              progress: 40,
            })}\n`,
          ),
        );

        console.log("Generating animated version...");
        let animatedUrl = "";
        try {
          animatedUrl = await createAnimatedVersion(originalUrl, style);
          controller.enqueue(
            encoder.encode(
              `${JSON.stringify({
                status: "progress",
                step: "animated",
                message: "Animated version created",
                progress: 60,
              })}\n`,
            ),
          );
        } catch (error) {
          console.error(
            "Error creating animated version:",
            JSON.stringify(error, null, 2),
          );

          controller.enqueue(
            encoder.encode(
              `${JSON.stringify({
                status: "error",
                message: `Failed to create animated version: ${error}`,
              })}\n`,
            ),
          );
          controller.close();
          return;
        }

        const oppositeUrl = null; // Do it in the results page
        const targetAnimalType = detectionResult === "human" ? "cat" : "human";

        // Try to save the image data to the database
        let imageData = null;

        try {
          imageData = await saveImageData(
            originalUrl,
            animatedUrl,
            oppositeUrl,
            detectionResult,
            targetAnimalType,
            style,
            isPrivate,
          );

          controller.enqueue(
            encoder.encode(
              `${JSON.stringify({
                status: "progress",
                step: "saved",
                message: "Data saved successfully",
                progress: 95,
              })}\n`,
            ),
          );
        } catch (error) {
          controller.enqueue(
            encoder.encode(
              `${JSON.stringify({
                status: "error",
                message: `Database error: ${error}`,
              })}\n`,
            ),
          );
          controller.close();
          return;
        }

        // // Send final success message with data
        controller.enqueue(
          encoder.encode(
            `${JSON.stringify({
              status: "complete",
              id: imageData.id,
              originalUrl,
              animatedUrl,
              oppositeUrl: null,
              type: detectionResult,
            })}\n`,
          ),
        );

        controller.close();
      } catch (error) {
        controller.enqueue(
          encoder.encode(
            `${JSON.stringify({
              status: "error",
              message: `Unexpected error: ${error}`,
            })}\n`,
          ),
        );
        controller.close();
      }
    },
  });

  // Create and return the response with the stream
  const encoder = new TextEncoder();
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
