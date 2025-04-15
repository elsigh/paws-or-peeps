import { createServerClient } from "./supabase";
import { experimental_generateImage as generateImage, generateText } from "ai";
import { luma } from "@ai-sdk/luma";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { openai } from "@ai-sdk/openai";
import { put } from "@vercel/blob";
import { nanoid } from "nanoid";
import type { GeneratedFile } from "ai";

// Define all possible animal types we support
export const ANIMAL_TYPES = [
  "cat",
  "dog",
  "bird",
  "horse",
  "elephant",
  "lion",
  "tiger",
  "bear",
  "deer",
  "wolf",
  "dolphin",
  "whale",
  "monkey",
  "giraffe",
  "zebra",
  "penguin",
  "fox",
  "rabbit",
  "squirrel",
  "koala",
];

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

export async function detectImageContent(imageUrl: string): Promise<string> {
  try {
    // Validate URL
    new URL(imageUrl);

    // Use AI SDK with OpenAI to analyze the image
    const { text } = await generateText({
      model: openai("gpt-4o"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `
            Analyze the attached image.
            
        Determine if the image contains a Human or one of these animals: ${ANIMAL_TYPES.join(
          ", "
        )}
        
        If it contains a human, respond with exactly "human".
        If it contains one of the listed animals, respond with an animal type in lowercase (e.g., "cat", "dog", etc.).
        
        Respond with ONLY the classification result, no additional text.
      `,
            },
            {
              type: "image",
              image: imageUrl,
            },
          ],
        },
      ],
    });

    return text.trim().toLowerCase();
  } catch (error) {
    console.error("Classification error:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to classify image: ${error.message}`);
    }
    throw new Error("Failed to classify image");
  }
}

async function imageToBlobUrl(image: GeneratedFile) {
  const filename = `animated-${nanoid()}.png`;
  const imageBlob = new Blob([image.uint8Array], { type: image.mimeType });
  const blob = await put(filename, imageBlob, { access: "public" });
  return blob.url;
}

// Function to create an animated version of the image using Replicate API
export async function createAnimatedVersion(imageUrl: string) {
  try {
    console.log("Starting animated version creation with SDXL model...");

    // Check if the image URL is valid
    if (!imageUrl || typeof imageUrl !== "string") {
      throw new Error(`Invalid image URL: ${imageUrl}`);
    }

    const { image } = await generateImage({
      model: luma.image("photon-flash-1"),
      prompt: "cartoon style, visually true to the original",
      aspectRatio: "1:1",
      providerOptions: {
        luma: {
          image_ref: [
            {
              url: imageUrl,
              weight: 1.0,
            },
          ],
        },
      },
    });

    console.log("Luma model response received");
    return imageToBlobUrl(image);
  } catch (error) {
    console.error("Error in createAnimatedVersion:", error);
    // Fallback to placeholder for demo purposes
    return `/placeholder.svg?height=400&width=400&query=animated-${Date.now()}`;
  }
}

// Function to transform the image to its opposite using Replicate API
export async function createOppositeVersion(
  imageUrl: string,
  type: string,
  targetAnimalType?: string
): Promise<string | null> {
  try {
    if (!targetAnimalType) {
      // biome-ignore lint/style/noParameterAssign: This is a valid use case
      targetAnimalType = type === "human" ? "cat" : "human";
    }
    console.log(
      `Starting opposite version creation (${type} to ${targetAnimalType})...`
    );

    // Check if the image URL is valid
    if (!imageUrl || typeof imageUrl !== "string") {
      throw new Error(`Invalid image URL: ${imageUrl}`);
    }

    // Create a specific prompt based on the detected animal type
    const prompt = `Transform this ${type} into a ${targetAnimalType}, maintain the personality and aesthetics, cartoon-style`;
    console.debug("Prompt:", prompt);

    const { image } = await generateImage({
      model: luma.image("photon-flash-1"),
      prompt,
      providerOptions: {
        luma: {
          modify_image_ref: {
            url: imageUrl,
            weight: 1.0,
          },
        },
      },
    });

    console.log("Luma model response received");
    return imageToBlobUrl(image);
  } catch (error) {
    console.error("Error in createOppositeVersion:", error);
    throw error;
  }
}

// Function to save image data to Supabase
export async function saveImageData(
  originalUrl: string,
  animatedUrl: string,
  oppositeUrl: string | null, // Can be null initially for human uploads
  imageType: string,
  targetAnimalType?: string // New optional parameter
) {
  try {
    console.log("Saving image data to Supabase with params:", {
      originalUrl: `${originalUrl?.substring(0, 50)}...`,
      animatedUrl: `${animatedUrl?.substring(0, 50)}...`,
      oppositeUrl: oppositeUrl ? `${oppositeUrl.substring(0, 50)}...` : "null",
      imageType,
      targetAnimalType,
    });

    // Validate image type against allowed values
    const validImageTypes = [...ANIMAL_TYPES, "human", "other"];
    if (!validImageTypes.includes(imageType)) {
      throw new Error(`Invalid image type: ${imageType}`);
    }

    const supabase = createServerClient();
    if (!supabase) {
      throw new Error(
        "Failed to create Supabase client - check environment variables"
      );
    }

    // Get visitor ID
    const visitorId = await getVisitorId();

    // Generate a UUID for this image if needed
    const imageId = uuidv4();

    // Truncate URLs if they're too long
    const MAX_URL_LENGTH = 1000;
    const safeOriginalUrl = originalUrl?.substring(0, MAX_URL_LENGTH) || "";
    const safeAnimatedUrl = animatedUrl?.substring(0, MAX_URL_LENGTH) || "";
    const safeOppositeUrl = oppositeUrl?.substring(0, MAX_URL_LENGTH) || "";

    console.log(`Attempting to save with image_type: ${imageType}`);

    // Now attempt the insert
    const { data, error } = await supabase
      .from("images")
      .insert({
        id: imageId,
        original_url: safeOriginalUrl,
        animated_url: safeAnimatedUrl,
        opposite_url: safeOppositeUrl,
        image_type: imageType,
        uploader_id: visitorId,
        target_animal_type: targetAnimalType,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
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

// Update the vote stats interface
export interface VoteStats {
  animalVotes: number;
  humanVotes: number;
  animalPercentage: number;
  humanPercentage: number;
}

// Update the vote function
export async function recordVote(
  imageId: string,
  vote: "animal" | "human"
): Promise<{
  voteStats: VoteStats;
  originalType: string;
}> {
  try {
    console.log(`Recording vote for image ${imageId}: ${vote}`);
    const supabase = createServerClient();
    if (!supabase) {
      throw new Error("Failed to create Supabase client");
    }

    // Get visitor ID
    const visitorId = await getVisitorId();

    // Get the image data to check the original type
    const { data: imageData, error: imageError } = await supabase
      .from("images")
      .select("*")
      .eq("id", imageId)
      .single();

    if (imageError) {
      console.error("Error fetching image:", imageError);
      throw new Error(`Failed to fetch image: ${imageError.message}`);
    }

    // Record the vote
    const { error: voteError } = await supabase.from("votes").insert({
      image_id: imageId,
      voter_id: visitorId,
      vote_type: vote,
    });

    if (voteError) {
      console.error("Error recording vote:", voteError);
      throw new Error(`Failed to record vote: ${voteError.message}`);
    }

    // Get updated vote counts
    const { data: voteData, error: statsError } = await supabase
      .from("votes")
      .select("vote_type")
      .eq("image_id", imageId);

    if (statsError) {
      console.error("Error fetching vote stats:", statsError);
      throw new Error(`Failed to fetch vote stats: ${statsError.message}`);
    }

    // Calculate vote statistics
    const animalVotes = voteData.filter((v) => v.vote_type === "animal").length;
    const humanVotes = voteData.filter((v) => v.vote_type === "human").length;
    const totalVotes = animalVotes + humanVotes;

    const animalPercentage =
      totalVotes > 0 ? (animalVotes / totalVotes) * 100 : 0;
    const humanPercentage =
      totalVotes > 0 ? (humanVotes / totalVotes) * 100 : 0;

    return {
      voteStats: {
        animalVotes,
        humanVotes,
        animalPercentage,
        humanPercentage,
      },
      originalType: imageData.image_type,
    };
  } catch (error) {
    console.error("Error in recordVote:", error);
    throw error;
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

// Function to update the opposite image after user selects an animal type
export async function updateOppositeImage(
  imageId: string,
  targetAnimalType: string
) {
  try {
    console.log(
      `Updating opposite image for ID: ${imageId} to ${targetAnimalType}`
    );

    const supabase = createServerClient();
    if (!supabase) {
      throw new Error("Failed to create Supabase client");
    }

    // Get the current image data
    const { data: imageData, error: fetchError } = await supabase
      .from("images")
      .select("*")
      .eq("id", imageId)
      .single();

    if (fetchError) {
      console.error("Error fetching image data:", fetchError);
      throw new Error(`Failed to fetch image data: ${fetchError.message}`);
    }

    if (!imageData) {
      throw new Error(`No image found with ID: ${imageId}`);
    }

    // Verify this is a human image
    if (imageData.image_type !== "human") {
      throw new Error("Can only update opposite image for human images");
    }

    // Generate the new opposite image
    const newOppositeUrl = await createOppositeVersion(
      imageData.original_url,
      "human",
      targetAnimalType
    );

    if (!newOppositeUrl) {
      throw new Error("Failed to generate new opposite image");
    }

    // Update the database record
    const { data, error } = await supabase
      .from("images")
      .update({
        opposite_url: newOppositeUrl,
        target_animal_type: targetAnimalType,
        updated_at: new Date().toISOString(),
      })
      .eq("id", imageId)
      .select()
      .single();

    if (error) {
      console.error("Error updating opposite image:", error);
      throw new Error(`Failed to update opposite image: ${error.message}`);
    }

    console.log("Opposite image updated successfully");
    return data;
  } catch (error) {
    console.error("Error in updateOppositeImage:", error);
    throw new Error(
      `Failed to update opposite image: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
