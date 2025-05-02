import { uploadToBlob } from "@/lib/blob";
import {
  createStylizedVersion,
  detectImageContent,
  saveImageData,
} from "@/lib/image-processing";
import type { TransformationStyle } from "@/lib/types";
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
        const isPrivate = formData.get("private") !== "false";

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
        let detectionResult: { type: string; gender: string | null };
        try {
          detectionResult = await detectImageContent(originalUrl);
          console.log("Detection result:", detectionResult);

          controller.enqueue(
            encoder.encode(
              `${JSON.stringify({
                status: "progress",
                step: "detected",
                message: `Detected: ${capitalize(detectionResult.type)}`,
                progress: 35,
              })}\n`,
            ),
          );
        } catch (error) {
          console.error("Detection error:", error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Error detecting image content";
          const errorDetails =
            error instanceof Error && "details" in error
              ? (error as { details: string }).details
              : undefined;

          controller.enqueue(
            encoder.encode(
              `${JSON.stringify({
                status: "error",
                message: errorMessage,
                details: errorDetails,
              })}\n`,
            ),
          );
          controller.close();
          return;
        }

        // Get target_animal_type from form data
        const targetAnimalType = formData.get("target_animal_type") as string;

        // Generate stylized version
        controller.enqueue(
          encoder.encode(
            `${JSON.stringify({
              status: "progress",
              step: "animating",
              message: "Creating stylized version...",
              progress: 40,
              style,
            })}
`,
          ),
        );

        console.log(`Generating stylized ${style} version...`);
        let animatedUrl = "";
        try {
          // Use correct animal type for stylization
          let stylizeType = detectionResult.type;
          let stylizeTarget = targetAnimalType;
          let gender = detectionResult.gender;
          if (detectionResult.type !== "human") {
            stylizeType = detectionResult.type;
            stylizeTarget = "human";
            gender = null;
          } else {
            stylizeType = "human";
            stylizeTarget = targetAnimalType;
          }
          animatedUrl = await createStylizedVersion(
            originalUrl,
            style,
            gender,
            stylizeType,
          );
          controller.enqueue(
            encoder.encode(
              `${JSON.stringify({
                status: "progress",
                step: "animated",
                message: "Stylized version created",
                progress: 60,
              })}
`,
            ),
          );
        } catch (error) {
          console.error(
            "Error creating stylized version:",
            JSON.stringify(error, null, 2),
          );

          controller.enqueue(
            encoder.encode(
              `${JSON.stringify({
                status: "error",
                message: `Failed to create stylized version: ${error}`,
              })}\n`,
            ),
          );
          controller.close();
          return;
        }

        // Save image data with correct target_animal_type
        let imageType = detectionResult.type;
        let saveTargetAnimalType = targetAnimalType;
        if (detectionResult.type !== "human") {
          imageType = detectionResult.type;
          saveTargetAnimalType = "human";
        }
        let imageData: Record<string, unknown> | null = null;
        try {
          imageData = await saveImageData(
            originalUrl,
            animatedUrl,
            null,
            imageType,
            saveTargetAnimalType,
            style,
            isPrivate,
            detectionResult.gender,
          );
          if (!imageData) {
            controller.enqueue(
              encoder.encode(
                `${JSON.stringify({
                  status: "error",
                  message: "Failed to save image data.",
                })}\n`,
              ),
            );
            controller.close();
            return;
          }

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
              type: detectionResult.type,
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
