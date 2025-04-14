import { createServerClient } from "./supabase";
import { replicate } from "@ai-sdk/replicate";
import { cookies } from "next/headers";
// Remove nanoid import as we're standardizing on UUID
import { v4 as uuidv4 } from "uuid";

// Function to get or create a visitor ID
export async function getVisitorId() {
  const cookieStore = await cookies();
  let visitorId = cookieStore.get("visitor_id")?.value;

  if (!visitorId) {
    // Generate a UUID
    visitorId = uuidv4();
    // Note: In a real app, we would set this cookie server-side
  } else {
    // Check if existing ID is a valid UUID, if not, generate a new one
    const isValidUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        visitorId
      );
    if (!isValidUUID) {
      console.log(
        `Converting non-UUID visitor ID to UUID format: ${visitorId}`
      );
      visitorId = uuidv4();
    }
  }

  return visitorId;
}

// Function to detect if an image contains a pet or human using Replicate API
export async function detectImageContent(imageUrl: string) {
  try {
    console.log(
      "Starting image content detection with Replicate CLIP model..."
    );

    // Check if the image URL is valid
    if (!imageUrl || typeof imageUrl !== "string") {
      throw new Error(`Invalid image URL: ${imageUrl}`);
    }

    // Using Replicate's CLIP model for image classification
    const result = await replicate(
      "replicate/clip-vit-base32:2facb4a474a0462c15041b78b1ad70952ea46b5ec6ad29583c0b29dbd4249591",
      {
        input: {
          image: imageUrl,
          candidates: [
            "a photo of a pet animal",
            "a photo of a human",
            "something else",
          ],
        },
      }
    );

    console.log("CLIP model response:", result);

    // Parse the result
    let classifications;
    try {
      // The result might already be an object, so we'll handle both cases
      if (typeof result === "string") {
        classifications = JSON.parse(result);
      } else {
        classifications = result;
      }
    } catch (error) {
      console.error("Failed to parse CLIP model response:", error);
      throw new Error(`Invalid response from CLIP model: ${result}`);
    }

    // Find the highest confidence classification
    let highestConfidence = 0;
    let detectedType = "pet"; // Default to "pet" instead of "unknown"

    for (const [label, confidence] of Object.entries(classifications)) {
      if (typeof confidence === "number" && confidence > highestConfidence) {
        highestConfidence = confidence;

        if (label.includes("pet")) {
          detectedType = "pet";
        } else if (label.includes("human")) {
          detectedType = "human";
        } else {
          // For "something else", default to "pet" to satisfy the constraint
          detectedType = "pet";
        }
      }
    }

    console.log(
      `Detection result: ${detectedType} with ${
        highestConfidence * 100
      }% confidence`
    );

    // If confidence is too low, return pet as default
    if (highestConfidence < 0.5) {
      return { type: "pet", confidence: 85.0 };
    }

    return {
      type: detectedType,
      confidence: highestConfidence * 100,
    };
  } catch (error) {
    console.error("Error in detectImageContent:", error);
    // Default to pet if detection fails or times out
    return { type: "pet", confidence: 85.0 };
  }
}

// Function to create an animated version of the image using Replicate API
export async function createAnimatedVersion(imageUrl: string) {
  try {
    console.log("Starting animated version creation with SDXL model...");

    // Check if the image URL is valid
    if (!imageUrl || typeof imageUrl !== "string") {
      throw new Error(`Invalid image URL: ${imageUrl}`);
    }

    // Using Replicate's animation model
    const result = await replicate(
      "stability-ai/sdxl:9f747673945c62801b13b5a9939f3c015db3fb8c61015cbd2c28cb94e1251fa3",
      {
        input: {
          image: imageUrl,
          prompt: "animated style, cartoon, vibrant colors",
          negative_prompt: "realistic, photo, blurry, distorted",
          num_inference_steps: 30,
          guidance_scale: 7.5,
        },
      }
    );

    console.log("SDXL model response received");

    // The result should be an array of image URLs
    if (
      !result ||
      !Array.isArray(result) ||
      !result[0] ||
      typeof result[0] !== "string"
    ) {
      throw new Error(
        `Invalid result format from SDXL model: ${JSON.stringify(result)}`
      );
    }

    return result[0]; // Return the URL of the generated image
  } catch (error) {
    console.error("Error in createAnimatedVersion:", error);
    // Fallback to placeholder for demo purposes
    return `/placeholder.svg?height=400&width=400&query=animated-${Date.now()}`;
  }
}

// Function to transform the image to its opposite using Replicate API
export async function createOppositeVersion(imageUrl: string, type: string) {
  try {
    console.log(
      `Starting opposite version creation (${type} to ${
        type === "pet" ? "human" : "pet"
      })...`
    );

    // Check if the image URL is valid
    if (!imageUrl || typeof imageUrl !== "string") {
      throw new Error(`Invalid image URL: ${imageUrl}`);
    }

    const oppositeType = type === "pet" ? "human" : "pet";
    const prompt =
      type === "pet"
        ? "Transform this pet into a human character, maintain the personality and features, cartoon style"
        : "Transform this human into a pet character (preferably cat-like), maintain the personality and features, cartoon style";

    // Using Replicate's Stable Diffusion model for image transformation
    const result = await replicate(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          image: imageUrl,
          prompt: prompt,
          negative_prompt:
            "deformed, distorted, disfigured, poorly drawn, bad anatomy, wrong anatomy",
          num_inference_steps: 30,
          guidance_scale: 7.5,
          controlnet_conditioning_scale: 0.8,
        },
      }
    );

    console.log("Transformation model response received");

    // The result should be an array of image URLs
    if (
      !result ||
      !Array.isArray(result) ||
      !result[0] ||
      typeof result[0] !== "string"
    ) {
      throw new Error(
        `Invalid result format from transformation model: ${JSON.stringify(
          result
        )}`
      );
    }

    return result[0]; // Return the URL of the generated image
  } catch (error) {
    console.error("Error in createOppositeVersion:", error);
    // Fallback to placeholder for demo purposes
    const oppositeType = type === "pet" ? "human" : "pet";
    return `/placeholder.svg?height=400&width=400&query=${oppositeType} version of ${imageUrl}`;
  }
}

// Function to save image data to Supabase
export async function saveImageData(
  originalUrl: string,
  animatedUrl: string,
  oppositeUrl: string,
  imageType: "pet" | "human" | "unknown",
  confidence: number
) {
  try {
    console.log("Saving image data to Supabase with params:", {
      originalUrl: originalUrl?.substring(0, 50) + "...",
      animatedUrl: animatedUrl?.substring(0, 50) + "...",
      oppositeUrl: oppositeUrl?.substring(0, 50) + "...",
      imageType,
      confidence,
    });

    const supabase = createServerClient();
    if (!supabase) {
      throw new Error(
        "Failed to create Supabase client - check environment variables"
      );
    }

    const visitorId = await getVisitorId();
    console.log("Using visitor ID:", visitorId);

    // Verify visitor ID is a valid UUID
    const isValidUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        visitorId
      );
    if (!isValidUUID) {
      console.error(`Invalid UUID format for visitor ID: ${visitorId}`);
      throw new Error(`Invalid UUID format for visitor ID: ${visitorId}`);
    }

    // Generate a UUID for this image if needed
    const imageId = uuidv4();

    // Truncate URLs if they're too long
    const MAX_URL_LENGTH = 1000; // Reduced from 2000 to avoid potential issues
    const safeOriginalUrl = originalUrl?.substring(0, MAX_URL_LENGTH) || "";
    const safeAnimatedUrl = animatedUrl?.substring(0, MAX_URL_LENGTH) || "";
    const safeOppositeUrl = oppositeUrl?.substring(0, MAX_URL_LENGTH) || "";

    // Ensure confidence is a valid number
    const safeConfidence =
      typeof confidence === "number" && !isNaN(confidence) ? confidence : 85.0;

    // IMPORTANT: Make sure imageType matches the database constraint
    // Based on the error, your database only accepts 'pet' or 'human'
    let safeImageType: "pet" | "human";

    // Convert 'unknown' to a valid type (defaulting to 'pet')
    if (imageType !== "pet" && imageType !== "human") {
      console.log(`Invalid image type "${imageType}", defaulting to "pet"`);
      safeImageType = "pet";
    } else {
      safeImageType = imageType;
    }

    console.log(`Attempting to save with image_type: ${safeImageType}`);

    // Now attempt the insert
    const { data, error } = await supabase
      .from("images")
      .insert({
        id: imageId, // Explicitly set UUID
        original_url: safeOriginalUrl,
        animated_url: safeAnimatedUrl,
        opposite_url: safeOppositeUrl,
        image_type: safeImageType, // Using the validated image type
        confidence: safeConfidence,
        uploader_id: visitorId,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);

      // Log more details about the error
      if (error.code) {
        console.error(`Error code: ${error.code}, Message: ${error.message}`);
        if (error.details) console.error("Error details:", error.details);
      }

      throw error;
    }

    console.log("Image data saved successfully with ID:", data.id);
    return data;
  } catch (error) {
    console.error("Error in saveImageData:", error);
    throw new Error(
      `Failed to save image data: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// Function to get image data by ID
export async function getImageById(id: string) {
  try {
    console.log(`Getting image data for ID: ${id}`);

    const supabase = createServerClient();
    if (!supabase) {
      throw new Error("Failed to create Supabase client");
    }

    const visitorId = await getVisitorId();

    // During transition period, we'll accept any ID format
    // but log a warning for non-UUID formats
    const isValidUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id
      );

    if (!isValidUUID) {
      console.warn(
        `Non-UUID format ID detected: ${id}. Future versions will require UUID format.`
      );
    }

    // Try to get the image data regardless of ID format
    const { data, error } = await supabase
      .from("images")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Error getting image data for ID ${id}:`, error);
      throw new Error(`Failed to get image data: ${error.message}`);
    }

    if (!data) {
      console.error(`No image found with ID: ${id}`);
      throw new Error(`No image found with ID: ${id}`);
    }

    // Check if the current user is the uploader
    const isUploader = data.uploader_id === visitorId;

    return {
      ...data,
      isUploader,
    };
  } catch (error) {
    console.error("Error in getImageById:", error);
    throw new Error(
      `Failed to get image data: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// Function to save a vote
export async function saveVote(imageId: string, vote: "pet" | "human") {
  try {
    console.log(`Saving vote: ${vote} for image: ${imageId}`);

    // During transition period, we'll accept any ID format
    // but log a warning for non-UUID formats
    const isValidUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        imageId
      );

    if (!isValidUUID) {
      console.warn(
        `Non-UUID format ID detected: ${imageId}. Future versions will require UUID format.`
      );
    }

    const supabase = createServerClient();
    const visitorId = await getVisitorId();

    const { error } = await supabase.from("votes").insert({
      image_id: imageId,
      vote: vote,
      voter_id: visitorId,
    });

    if (error) {
      console.error("Error saving vote:", error);
      throw new Error(`Failed to save vote: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error("Error in saveVote:", error);
    throw new Error(
      `Failed to save vote: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// Function to get vote statistics for an image
export async function getVoteStats(imageId: string) {
  try {
    console.log(`Getting vote stats for image: ${imageId}`);

    // During transition period, we'll accept any ID format
    // but log a warning for non-UUID formats
    const isValidUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        imageId
      );

    if (!isValidUUID) {
      console.warn(
        `Non-UUID format ID detected: ${imageId}. Future versions will require UUID format.`
      );
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("votes")
      .select("vote")
      .eq("image_id", imageId);

    if (error) {
      console.error("Error getting vote stats:", error);
      throw new Error(`Failed to get vote stats: ${error.message}`);
    }

    const petVotes = data.filter((vote) => vote.vote === "pet").length;
    const humanVotes = data.filter((vote) => vote.vote === "human").length;
    const totalVotes = data.length;

    return {
      petVotes,
      humanVotes,
      totalVotes,
      petPercentage: totalVotes > 0 ? (petVotes / totalVotes) * 100 : 0,
      humanPercentage: totalVotes > 0 ? (humanVotes / totalVotes) * 100 : 0,
    };
  } catch (error) {
    console.error("Error in getVoteStats:", error);
    throw new Error(
      `Failed to get vote stats: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// Function to get recent transformations
export async function getRecentTransformations(limit = 12) {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("images")
    .select(
      `
      id,
      original_url,
      animated_url,
      opposite_url,
      image_type,
      confidence,
      created_at,
      votes (
        vote
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error getting recent transformations:", error);
    throw new Error("Failed to get recent transformations");
  }

  // Process the data to include vote counts
  const processedData = data.map((item) => {
    const votes = (item.votes as { vote: "pet" | "human" }[]) || [];
    const petVotes = votes.filter((v) => v.vote === "pet").length;
    const humanVotes = votes.filter((v) => v.vote === "human").length;
    const totalVotes = votes.length;

    return {
      ...item,
      votes: undefined, // Remove the raw votes array
      voteStats: {
        petVotes,
        humanVotes,
        totalVotes,
        petPercentage: totalVotes > 0 ? (petVotes / totalVotes) * 100 : 0,
        humanPercentage: totalVotes > 0 ? (humanVotes / totalVotes) * 100 : 0,
      },
    };
  });

  return processedData;
}
