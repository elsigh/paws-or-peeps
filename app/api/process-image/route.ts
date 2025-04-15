import { type NextRequest, NextResponse } from "next/server";
import { uploadToBlob } from "@/lib/blob";
import { cookies } from "next/headers";
import { nanoid } from "nanoid";
import {
  saveImageData,
  detectImageContent,
  createAnimatedVersion,
  createOppositeVersion,
} from "@/lib/image-processing";
import { createClient } from "@/lib/supabase-server";
import { checkEnvironmentVariables } from "@/lib/env-checker";
import getVisitorId from "@/lib/get-visitor-id";

export async function POST(request: NextRequest) {
  console.log("API route started");

  try {
    // Check environment variables first
    const { issues, defined } = checkEnvironmentVariables();
    if (issues.length > 0) {
      console.warn("Environment variable issues detected:", issues);
    }

    // Create Supabase client and check authentication early
    const cookieStore = cookies();
    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "Failed to create Supabase client" },
        { status: 500 }
      );
    }

    // Get the current user's ID from the session
    const {
      data: { session },
      // @ts-ignore
    } = await supabase.auth.getSession();

    console.log("Session check:", session ? "Session exists" : "No session");

    if (!session?.user?.id) {
      console.error("No authenticated user found in session");
      return NextResponse.json(
        { error: "User must be authenticated to upload images" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    console.log(`Processing image for authenticated user: ${userId}`);

    // Log request details
    console.log("Request method:", request.method);

    // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
    let formData;
    try {
      console.log("Attempting to parse form data...");
      formData = await request.formData();
      console.log("Form data parsed successfully");
    } catch (error) {
      console.error("Error parsing form data:", error);
      return NextResponse.json(
        {
          error: "Failed to parse form data",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 400 }
      );
    }

    const file = formData.get("image") as File | null;

    if (!file) {
      console.error("No file found in form data");
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    // Log file details
    console.log("File details:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // Upload original image to Vercel Blob
    console.log("Starting image upload to Blob...");
    let originalUrl = "";
    try {
      originalUrl = await uploadToBlob(file);
      console.log("Upload successful:", originalUrl);

      // Verify the URL is valid
      if (
        !originalUrl ||
        (originalUrl.startsWith("/placeholder") &&
          process.env.NODE_ENV === "production")
      ) {
        console.error("Blob upload returned a placeholder in production");
        return NextResponse.json(
          {
            error: "Failed to upload image to storage",
            details:
              "Storage service is currently unavailable. Please try again later.",
          },
          { status: 503 }
        );
      }
    } catch (error) {
      console.error("Error uploading to Vercel Blob:", error);
      return NextResponse.json(
        {
          error: "Failed to upload image to storage",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      );
    }

    // Use AI to detect if the image contains a pet or human
    console.log("Detecting image content...");
    let detectionResult = "";
    try {
      detectionResult = await detectImageContent(originalUrl);
      console.log("Detection result:", detectionResult);
    } catch (error) {
      const msg = `Error detecting image content: ${error}`;
      console.error(msg);
      throw new Error(msg);
    }

    // Generate animated and opposite versions
    console.log("Generating animated version...");
    let animatedUrl = "";
    try {
      animatedUrl = await createAnimatedVersion(originalUrl);
    } catch (error) {
      console.error("Error creating animated version:", error);
      animatedUrl = "/whimsical-forest-creatures.png"; // Fallback
    }

    console.log("Generating opposite version...");
    let oppositeUrl = "";
    try {
      oppositeUrl =
        (await createOppositeVersion(originalUrl, detectionResult)) || "";
    } catch (error) {
      console.error("Error creating opposite version:", error);
      oppositeUrl = "/light-and-shadow.png"; // Fallback
    }

    // Try to save the image data to the database, but continue even if it fails
    let imageData = null;
    let databaseError = null;
    const usedTempId = false;

    try {
      console.log("Saving image data to database...");

      // First, try using the saveImageData function
      try {
        imageData = await saveImageData(
          originalUrl,
          animatedUrl,
          oppositeUrl,
          detectionResult
        );
        console.log("Image data saved successfully:", imageData);
      } catch (saveError) {
        console.error("Error using saveImageData:", saveError);
        databaseError =
          saveError instanceof Error ? saveError.message : String(saveError);

        // If that fails, try a direct database insert as a fallback
        console.log("Attempting direct database insert as fallback...");
        const supabase = await createClient();
        if (!supabase) {
          return NextResponse.json(
            { error: "Failed to create Supabase client" },
            { status: 500 }
          );
        }

        // Get the current user's ID from the session
        const {
          data: { session },
          // @ts-ignore
        } = await supabase.auth.getSession();

        if (!session?.user?.id) {
          return NextResponse.json(
            { error: "User must be authenticated to upload images" },
            { status: 401 }
          );
        }

        const userId = session.user.id;
        console.log(`Processing image for authenticated user: ${userId}`);

        // Try to insert with a valid image_type
        const { data, error } = await supabase
          .from("images")
          .insert({
            original_url: originalUrl,
            animated_url: animatedUrl,
            opposite_url: oppositeUrl,
            image_type: detectionResult,
            uploader_id: userId, // Use the authenticated user ID
          })
          .select()
          .single();

        if (error) {
          console.error("Database insert error:", error);
          throw new Error(`Database error: ${error.message}`);
        }

        imageData = data;
        console.log("Direct database insert successful:", imageData);
      }
    } catch (error) {
      console.error("All database save attempts failed:", error);
      throw error;
    }

    // Return success with the image data
    const response = NextResponse.json({
      success: true,
      message: usedTempId
        ? "File uploaded but database save failed. Using temporary data."
        : "File uploaded and data saved successfully",
      id: imageData.id,
      originalUrl,
      animatedUrl,
      oppositeUrl,
      type: detectionResult,
      temporary: usedTempId,
      databaseError: databaseError,
    });

    return response;
  } catch (error) {
    console.error("Unhandled error in API route:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
        stack:
          error instanceof Error ? error.stack : "No stack trace available",
      },
      { status: 500 }
    );
  }
}
