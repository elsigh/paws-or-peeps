import { createClient } from "./supabase-server";
import { experimental_generateImage as generateImage, generateText } from "ai";
import { luma } from "@ai-sdk/luma";
import { v4 as uuidv4 } from "uuid";
import { openai } from "@ai-sdk/openai";
import { put } from "@vercel/blob";
import { nanoid } from "nanoid";
import type { GeneratedFile } from "ai";
import getVisitorId from "./get-visitor-id";
import { ANIMAL_TYPES } from "./constants";
import type { ImageData, VoteStats } from "./types";

// Export ANIMAL_TYPES for backward compatibility
export { ANIMAL_TYPES };
export type { ImageData, VoteStats };

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
    throw error;
  }
}

// Function to transform the image to its opposite using Replicate API
export async function createOppositeVersion(
  imageUrl: string,
  type: string,
  targetAnimalType: string
): Promise<string> {
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
    let prompt = "";
    if (type === "human") {
      prompt = `Transform this ${type} into a light cartoon-style animal: ${targetAnimalType}, Retain realism. Do not put clothes on the ${targetAnimalType}.`;
    } else {
      prompt = `Transform this ${type} into a human, subtly cartoonish, retaining realism and making sure that the final image is definitively human and not a ${type}.`;
    }

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
  targetAnimalType: string
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

    const supabase = await createClient();
    if (!supabase) {
      throw new Error(
        "Failed to create Supabase client - check environment variables"
      );
    }

    // Get the current user's ID from the session
    const {
      data: { session },
      // @ts-ignore
    } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      throw new Error("User must be authenticated to save images");
    }

    const userId = session.user.id;
    console.log(`Using authenticated user ID: ${userId}`);

    // Generate a UUID for this image if needed
    const imageId = uuidv4();

    // Truncate URLs if they're too long
    const MAX_URL_LENGTH = 1000;
    const safeOriginalUrl = originalUrl?.substring(0, MAX_URL_LENGTH) || "";
    const safeAnimatedUrl = animatedUrl?.substring(0, MAX_URL_LENGTH) || "";
    const safeOppositeUrl = oppositeUrl?.substring(0, MAX_URL_LENGTH) || "";

    console.log(
      `Attempting to save with image_type: ${imageType} and uploader_id: ${userId}`
    );

    // Now attempt the insert
    const { data, error } = await supabase
      .from("images")
      .insert({
        id: imageId,
        original_url: safeOriginalUrl,
        animated_url: safeAnimatedUrl,
        opposite_url: safeOppositeUrl,
        image_type: imageType,
        uploader_id: userId,
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
export async function getImageById(id: string): Promise<ImageData> {
  try {
    console.log(`Getting image data for ID: ${id}`);

    const supabase = await createClient();
    if (!supabase) {
      throw new Error("Failed to create Supabase client");
    }

    // Get current user's ID from session
    const {
      data: { session },
      // @ts-ignore
    } = await supabase.auth.getSession();
    const currentUserId = session?.user?.id;

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

    console.log(
      `Image data retrieved. Uploader ID: ${data.uploader_id}, Current user ID: ${currentUserId}`
    );

    // Check if the current user is the uploader
    const isUploader = data.uploader_id === currentUserId;

    // Check if there are votes for this image
    const { count, error: voteError } = await supabase
      .from("votes")
      .select("*", { count: "exact", head: true })
      .eq("image_id", id);

    if (voteError) {
      console.error(`Error checking votes for image ${id}:`, voteError);
    }

    const hasVotes = count !== null && count > 0;

    return {
      ...data,
      isUploader,
      hasVotes,
    } as ImageData;
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
    const supabase = await createClient();
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
    // @ts-ignore
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
    // @ts-ignore
    const { data: voteData, error: statsError } = await supabase
      .from("votes")
      .select("vote_type")
      .eq("image_id", imageId);

    if (statsError) {
      console.error("Error fetching vote stats:", statsError);
      throw new Error(`Failed to fetch vote stats: ${statsError.message}`);
    }

    // Calculate vote statistics
    // @ts-ignore
    const animalVotes = voteData.filter((v) => v.vote_type === "animal").length;
    // @ts-ignore
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
  const supabase = await createClient();

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
      uploader_id,
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
    // @ts-ignore
    const votes = (item.votes as { vote: "animal" | "human" }[]) || [];
    const petVotes = votes.filter((v) => v.vote === "animal").length;
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

// Function to save a vote for an image
export async function saveVote(
  imageId: string,
  vote: "animal" | "human"
): Promise<VoteStats> {
  try {
    console.log(`Saving vote for image ${imageId}: ${vote}`);

    const supabase = await createClient();
    if (!supabase) {
      throw new Error("Failed to create Supabase client");
    }

    // Get visitor ID
    const visitorId = await getVisitorId();

    // Check if user already voted
    const { data: existingVote, error: checkError } = await supabase
      .from("votes")
      .select("id")
      .eq("image_id", imageId)
      // @ts-ignore
      .eq("voter_id", visitorId)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking existing vote:", checkError);
      throw new Error(`Failed to check existing vote: ${checkError.message}`);
    }

    // If user already voted, update their vote
    if (existingVote) {
      const { error: updateError } = await supabase
        .from("votes")
        // @ts-ignore
        .update({ vote: vote })
        .eq("id", existingVote.id);

      if (updateError) {
        console.error("Error updating vote:", updateError);
        throw new Error(`Failed to update vote: ${updateError.message}`);
      }
    } else {
      // Otherwise insert a new vote
      // @ts-ignore
      const { error: insertError } = await supabase.from("votes").insert({
        image_id: imageId,
        voter_id: visitorId,
        vote: vote,
      });

      if (insertError) {
        console.error("Error inserting vote:", insertError);
        throw new Error(`Failed to insert vote: ${insertError.message}`);
      }
    }

    // Get updated vote counts using the getVoteStats function
    return await getVoteStats(imageId);
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
export async function getVoteStats(imageId: string): Promise<VoteStats> {
  try {
    console.log(`Getting vote stats for image ${imageId}`);

    const supabase = await createClient();
    if (!supabase) {
      throw new Error("Failed to create Supabase client");
    }

    // Get all votes for this image
    // @ts-ignore
    const { data: voteData, error: statsError } = await supabase
      .from("votes")
      .select("vote")
      .eq("image_id", imageId);

    if (statsError) {
      console.error("Error fetching vote stats:", statsError);
      throw new Error(`Failed to fetch vote stats: ${statsError.message}`);
    }

    // Calculate vote statistics
    // @ts-ignore
    const animalVotes = voteData.filter((v) => v.vote === "animal").length;
    // @ts-ignore
    const humanVotes = voteData.filter((v) => v.vote === "human").length;
    const totalVotes = animalVotes + humanVotes;

    const animalPercentage =
      totalVotes > 0 ? (animalVotes / totalVotes) * 100 : 0;
    const humanPercentage =
      totalVotes > 0 ? (humanVotes / totalVotes) * 100 : 0;

    return {
      animalVotes,
      humanVotes,
      animalPercentage,
      humanPercentage,
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

// Function to check if a user has already voted for an image
export async function hasUserVoted(imageId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    if (!supabase) {
      throw new Error("Failed to create Supabase client");
    }

    // Get visitor ID
    const visitorId = await getVisitorId();

    // Check if user already voted for this image
    const { data, error } = await supabase
      .from("votes")
      .select("id")
      .eq("image_id", imageId)
      // @ts-ignore
      .eq("voter_id", visitorId)
      .maybeSingle();

    if (error) {
      console.error("Error checking if user voted:", error);
      throw new Error(`Failed to check if user voted: ${error.message}`);
    }

    return !!data;
  } catch (error) {
    console.error("Error in hasUserVoted:", error);
    throw new Error(
      `Failed to check if user voted: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
