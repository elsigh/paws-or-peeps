import { createServerClient } from "./supabase";
import { experimental_generateImage as generateImage, generateText } from "ai";
import { luma } from "@ai-sdk/luma";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { openai } from "@ai-sdk/openai";
import { put } from "@vercel/blob";
import { nanoid } from "nanoid";
import { GeneratedFile } from "ai";

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
            
        Determine if the image contains a human or one of these animals: ${ANIMAL_TYPES.join(
          ", "
        )}
        
        If it contains a human, respond with exactly "Human".
        If it contains one of the listed animals, respond with the animal type (e.g., "Cat", "Dog", etc.).
        If it contains both a human and an animal, respond with "Human and [animal type]".
        If it contains multiple animals but no human, list the animals (e.g., "Cat and Dog").
        If it doesn't contain a human or any of the listed animals, respond with "Neither human nor listed animal detected".
        
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

    return text.trim();
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
      prompt: "animated style, cartoon, vibrant colors",
      aspectRatio: "1:1",
      providerOptions: {
        luma: {
          image_ref: [
            {
              url: imageUrl,
              weight: 0.8,
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
  targetAnimalType?: string // New optional parameter for the target animal type
) {
  try {
    const isHuman = type === "human";
    const oppositeType = isHuman ? targetAnimalType || "animal" : "human";

    console.log(
      `Starting opposite version creation (${type} to ${oppositeType})...`
    );

    // Check if the image URL is valid
    if (!imageUrl || typeof imageUrl !== "string") {
      throw new Error(`Invalid image URL: ${imageUrl}`);
    }

    // If it's a human and no target animal type is specified, return null
    // This will signal the frontend that it needs to ask the user for an animal type
    if (isHuman && !targetAnimalType) {
      console.log(
        "Human detected but no target animal type specified. Returning null."
      );
      return null;
    }

    // Create a specific prompt based on the detected animal type
    let prompt;
    if (isHuman && targetAnimalType) {
      // Human to specific animal
      prompt = `Transform this human into a ${targetAnimalType} character, maintain the personality and features, cartoon style`;
    } else {
      // Animal to human
      prompt = `Transform this ${
        type === "other" ? "animal" : type
      } into a human character, maintain the personality and features, cartoon style`;
    }

    const { image } = await generateImage({
      model: luma.image("photon-flash-1"),
      prompt,
      providerOptions: {
        luma: {
          image_ref: [
            {
              url: imageUrl,
              weight: 0.8,
            },
          ],
        },
      },
    });

    console.log("Luma model response received");
    return imageToBlobUrl(image);

    return image;
  } catch (error) {
    console.error("Error in createOppositeVersion:", error);
    // Fallback to placeholder for demo purposes
    const oppositeType =
      type === "human" ? targetAnimalType || "animal" : "human";
    return `/placeholder.svg?height=400&width=400&query=${oppositeType} version of ${imageUrl}`;
  }
}

// Function to save image data to Supabase
export async function saveImageData(
  originalUrl: string,
  animatedUrl: string,
  oppositeUrl: string | null, // Can be null initially for human uploads
  imageType: string,
  confidence: number,
  targetAnimalType?: string // New optional parameter
) {
  try {
    console.log("Saving image data to Supabase with params:", {
      originalUrl: originalUrl?.substring(0, 50) + "...",
      animatedUrl: animatedUrl?.substring(0, 50) + "...",
      oppositeUrl: oppositeUrl ? oppositeUrl.substring(0, 50) + "..." : "null",
      imageType,
      confidence,
      targetAnimalType,
    });

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

    // Ensure confidence is a valid number
    const safeConfidence =
      typeof confidence === "number" && !isNaN(confidence) ? confidence : 60.0;

    // Validate image type against allowed values
    const validImageTypes = [
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
      "human",
      "other",
    ];

    let safeImageType = "other";
    if (validImageTypes.includes(imageType)) {
      safeImageType = imageType;
    } else {
      console.log(`Invalid image type "${imageType}", defaulting to "other"`);
    }

    // Validate target animal type if provided
    let safeTargetAnimalType = null;
    if (targetAnimalType) {
      if (
        validImageTypes.includes(targetAnimalType) &&
        targetAnimalType !== "human" &&
        targetAnimalType !== "other"
      ) {
        safeTargetAnimalType = targetAnimalType;
      } else {
        console.log(
          `Invalid target animal type "${targetAnimalType}", ignoring`
        );
      }
    }

    console.log(`Attempting to save with image_type: ${safeImageType}`);

    // Now attempt the insert
    const { data, error } = await supabase
      .from("images")
      .insert({
        id: imageId,
        original_url: safeOriginalUrl,
        animated_url: safeAnimatedUrl,
        opposite_url: safeOppositeUrl,
        image_type: safeImageType,
        confidence: safeConfidence,
        uploader_id: visitorId,
        target_animal_type: safeTargetAnimalType, // New field
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
