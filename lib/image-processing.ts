import { createClient } from "@/lib/supabase-server";
import type { ImageData, VoteStats } from "@/lib/types";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { put } from "@vercel/blob";
import type { GeneratedFile } from "ai";
import { generateText } from "ai";
import { nanoid } from "nanoid";
import { ANIMAL_TYPES } from "./constants";
import getVisitorId from "./get-visitor-id";
import {
  ANIMAL_TO_HUMAN_PROMPT_V2 as ANIMAL_TO_HUMAN_PROMPT,
  HUMAN_TO_ANIMAL_PROMPT_V2 as HUMAN_TO_ANIMAL_PROMPT,
  ORIGINAL_IMAGE_PROMPT_V2 as ORIGINAL_IMAGE_PROMPT,
} from "./prompts";

// const ORIGINAL_IMAGE_PROMPT = `Stylize this image with a touch of stylized realism, subtle sharpening, maintaining original composition,
//   aspect ratio, and subject positioning/direction.`;

// const HUMAN_TO_ANIMAL_PROMPT = (
//   targetAnimalType: string,
// ) => `Generate a portrait of a ${targetAnimalType} that is a representation in animal form of the input human image.

// Style:
// * Subtle, stylized realistic style.
// * Emphasize expressive eyes and subtle shifts in muscle tension to convey emotional state.

// Core Task:
// * Analyze: Carefully examine the input human image to identify and extract the primary colors, facial expression and emotional
//   mood (e.g., happiness, sadness, anger, surprise).
// * Translate: Translate this specific emotional state onto the face of the ${targetAnimalType} in a manner that feels natural
//   and believable for that species. Consider how this particular emotion would be expressed through the animal's unique facial features.`;

// const ANIMAL_TO_HUMAN_PROMPT = (type: string) =>
//   `Render this image of a ${type} as a human with subtle, stylized photorealism (like Pixar or Dreamworks)
// with shot-on-iPhone level quality. Maintain the essential features and overall composition of the original photo.
// Ensure the final image depicts a human with standard human anatomy and facial features, with no ${type} characteristics
// like fur, feathers, tails, claws, or animal-like features.`;

type ImageRow = {
  id: string;
  original_url: string;
  animated_url?: string;
  opposite_url?: string;
  image_type: string;
  created_at: string;
  uploader_id?: string;
  private: boolean;
};

type VoteRow = {
  vote: "animal" | "human";
};

type ImageWithVotes = ImageRow & {
  votes: VoteRow[];
};

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
          ", ",
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
    console.log("Starting animated version creation...");

    // Check if the image URL is valid
    if (!imageUrl || typeof imageUrl !== "string") {
      throw new Error(`Invalid image URL: ${imageUrl}`);
    }

    // const { image } = await generateImage({
    //   model: luma.image("photon-flash-1"),
    //   prompt: "light cartoon style",
    //   aspectRatio: "1:1",
    //   providerOptions: {
    //     luma: {
    //       image_ref: [
    //         {
    //           url: imageUrl,
    //           weight: 1.0,
    //         },
    //       ],
    //     },
    //   },
    // });

    const result = await generateText({
      model: google("gemini-2.0-flash-exp"),
      messages: [
        {
          role: "user",
          content: ORIGINAL_IMAGE_PROMPT,
        },
        {
          role: "user",
          content: [
            {
              type: "image",
              image: imageUrl,
            },
          ],
        },
      ],
      providerOptions: {
        google: { responseModalities: ["TEXT", "IMAGE"] },
      },
    });

    console.log("Animated image response received");

    if (!result.files || result.files.length === 0) {
      throw new Error("No image files returned");
    }

    return imageToBlobUrl(result.files[0]);
  } catch (error) {
    console.error("Error in createAnimatedVersion:", error);
    throw error;
  }
}

// Function to transform the image to its opposite using Replicate API
export async function createOppositeVersion(
  imageUrl: string,
  type: string,
  targetAnimalType: string,
): Promise<string> {
  try {
    if (!targetAnimalType) {
      // biome-ignore lint/style/noParameterAssign: This is a valid use case
      targetAnimalType = type === "human" ? "cat" : "human";
    }
    console.log(
      `Starting opposite version creation (${type} to ${targetAnimalType})...`,
    );

    // Check if the image URL is valid
    if (!imageUrl || typeof imageUrl !== "string") {
      throw new Error(`Invalid image URL: ${imageUrl}`);
    }

    // Create a specific prompt based on the detected animal type
    let prompt = "";
    if (type === "human") {
      prompt = HUMAN_TO_ANIMAL_PROMPT(targetAnimalType);
    } else {
      prompt = ANIMAL_TO_HUMAN_PROMPT(type);
    }

    console.debug("createOppositeVersion prompt:", prompt);

    // const { image } = await generateImage({
    //   model: luma.image("photon-flash-1"),
    //   prompt,
    //   providerOptions: {
    //     luma: {
    //       modify_image_ref: {
    //         url: imageUrl,
    //         weight: 1.0,
    //       },
    //     },
    //   },
    // });

    const result = await generateText({
      model: google("gemini-2.0-flash-exp"),
      messages: [
        {
          role: "user",
          content: prompt,
        },
        {
          role: "user",
          content: [
            {
              type: "image",
              image: imageUrl,
            },
          ],
        },
      ],
      providerOptions: {
        google: { responseModalities: ["TEXT", "IMAGE"] },
      },
    });

    if (!result.files || result.files.length === 0) {
      throw new Error("No image files returned");
    }

    console.log("Opposite version image response received");
    return imageToBlobUrl(result.files[0]);
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
  targetAnimalType: string,
  isPrivate = true, // Changed default to true
) {
  try {
    console.log("Saving image data to Supabase with params:", {
      originalUrl: `${originalUrl?.substring(0, 50)}...`,
      animatedUrl: `${animatedUrl?.substring(0, 50)}...`,
      oppositeUrl: oppositeUrl ? `${oppositeUrl.substring(0, 50)}...` : "null",
      imageType,
      targetAnimalType,
      isPrivate,
    });

    // Validate image type against allowed values
    const validImageTypes = [...ANIMAL_TYPES, "human", "other"];
    if (!validImageTypes.includes(imageType)) {
      throw new Error(`Invalid image type: ${imageType}`);
    }

    // Get the current user's ID
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      throw new Error("User must be authenticated to save image data");
    }

    const userId = session.user.id;

    // Insert the image data
    const { data, error } = await supabase
      .from("images")
      .insert({
        original_url: originalUrl,
        animated_url: animatedUrl,
        opposite_url: oppositeUrl,
        image_type: imageType,
        target_animal_type: targetAnimalType,
        uploader_id: userId,
        private: isPrivate,
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving image data:", error);
      throw new Error(`Failed to save image data: ${error.message}`);
    }

    console.log("Successfully saved image data:", data);
    return data;
  } catch (error) {
    console.error("Error in saveImageData:", error);
    throw error;
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
      `Image data retrieved. Uploader ID: ${data.uploader_id}, Current user ID: ${currentUserId}`,
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
      }`,
    );
  }
}

// Update the vote function
export async function recordVote(
  imageId: string,
  vote: "animal" | "human",
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
      vote: vote,
    });

    if (voteError) {
      console.error("Error recording vote:", voteError);
      throw new Error(`Failed to record vote: ${voteError.message}`);
    }

    // Get updated vote counts
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
      voteStats: {
        animalVotes,
        humanVotes,
        animalPercentage,
        humanPercentage,
        totalVotes,
      },
      originalType: imageData.image_type,
    };
  } catch (error) {
    console.error("Error in recordVote:", error);
    throw error;
  }
}

// Function to get recent transformations
export async function getRecentTransformations(limit = 100) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userId = user?.id;

    // Base query to get images
    let query = supabase.from("images").select(
      `
        id,
        original_url,
        animated_url,
        opposite_url,
        image_type,
        created_at,
        uploader_id,
        private,
        votes (
          vote
        )
      `,
    );

    // Only show private/incomplete images to their owners
    if (userId) {
      query = query.or(
        `and(private.eq.false,opposite_url.neq.''),uploader_id.eq.${userId}`,
      );
    } else {
      query = query.eq("private", false).neq("opposite_url", "");
    }

    const { data: images, error } = await query
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching recent transformations:", error);
      return [];
    }

    // Process and validate each image
    const validImages = (images as ImageWithVotes[]).filter((image) => {
      // For non-owners, require both original and opposite URLs
      if (image.uploader_id !== userId) {
        return image.original_url && image.opposite_url;
      }

      // For owners, just check if required URLs exist
      return image.original_url && (image.animated_url || image.opposite_url);
    });

    return validImages.map((image) => {
      const votes = image.votes || [];
      const animalVotes = votes.filter(
        (v: VoteRow) => v.vote === "animal",
      ).length;
      const humanVotes = votes.filter(
        (v: VoteRow) => v.vote === "human",
      ).length;
      const totalVotes = animalVotes + humanVotes;

      return {
        ...image,
        voteStats: {
          animalVotes,
          humanVotes,
          totalVotes,
          animalPercentage:
            totalVotes > 0 ? (animalVotes / totalVotes) * 100 : 50,
          humanPercentage:
            totalVotes > 0 ? (humanVotes / totalVotes) * 100 : 50,
        },
      };
    });
  } catch (error) {
    console.error("Error in getRecentTransformations:", error);
    return [];
  }
}

// Function to save a vote for an image
export async function saveVote(
  imageId: string,
  vote: "animal" | "human",
): Promise<VoteStats> {
  try {
    console.log(`Saving vote for image ${imageId}: ${vote}`);

    const supabase = await createClient();
    if (!supabase) {
      throw new Error("Failed to create Supabase client");
    }

    // Get the authenticated user ID
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      throw new Error("User must be authenticated to vote");
    }

    const userId = session.user.id;

    // Check if user already voted
    const { data: existingVote, error: checkError } = await supabase
      .from("votes")
      .select("id")
      .eq("image_id", imageId)
      .eq("voter_id", userId)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking existing vote:", checkError);
      throw new Error(`Failed to check existing vote: ${checkError.message}`);
    }

    // If user already voted, update their vote
    if (existingVote) {
      const { error: updateError } = await supabase
        .from("votes")
        .update({ vote: vote })
        .eq("id", existingVote.id);

      if (updateError) {
        console.error("Error updating vote:", updateError);
        throw new Error(`Failed to update vote: ${updateError.message}`);
      }
    } else {
      // Otherwise insert a new vote
      const { error: insertError } = await supabase.from("votes").insert({
        image_id: imageId,
        voter_id: userId,
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
      }`,
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
      totalVotes,
    };
  } catch (error) {
    console.error("Error in getVoteStats:", error);
    throw new Error(
      `Failed to get vote stats: ${
        error instanceof Error ? error.message : String(error)
      }`,
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
      }`,
    );
  }
}

// Function to toggle private status of an image
export async function toggleImagePrivacy(imageId: string): Promise<boolean> {
  try {
    console.log(`Toggling privacy for image ${imageId}`);
    const supabase = await createClient();
    if (!supabase) {
      throw new Error("Failed to create Supabase client");
    }

    // Get current user's ID from session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const currentUserId = session?.user?.id;

    if (!currentUserId) {
      throw new Error("User must be authenticated to change privacy settings");
    }

    // Get the current image data
    const { data: imageData, error: getError } = await supabase
      .from("images")
      .select("private, uploader_id")
      .eq("id", imageId)
      .single();

    if (getError) {
      throw new Error(`Failed to get image data: ${getError.message}`);
    }

    // Check if user is the uploader
    if (imageData.uploader_id !== currentUserId) {
      throw new Error("Only the uploader can change privacy settings");
    }

    // Toggle the private status
    const newPrivateStatus = !imageData.private;

    // Update the image
    const { error: updateError } = await supabase
      .from("images")
      .update({ private: newPrivateStatus })
      .eq("id", imageId);

    if (updateError) {
      throw new Error(`Failed to update privacy: ${updateError.message}`);
    }

    return newPrivateStatus;
  } catch (error) {
    console.error("Error in toggleImagePrivacy:", error);
    throw error;
  }
}

// Function to check if user has voted on an image and get vote stats
export async function getVoteInfo(imageId: string): Promise<{
  userVote: "animal" | "human" | null;
  voteStats: VoteStats;
}> {
  try {
    const supabase = await createClient();
    if (!supabase) {
      throw new Error("Failed to create Supabase client");
    }

    // Get current user's ID from session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const currentUserId = session?.user?.id;

    // Get all votes for this image
    const { data: votes, error: statsError } = await supabase
      .from("votes")
      .select("vote, voter_id")
      .eq("image_id", imageId);

    if (statsError) {
      console.error("Error fetching votes:", statsError);
      throw new Error(`Failed to fetch votes: ${statsError.message}`);
    }

    // Calculate vote statistics
    const animalVotes = votes.filter((v) => v.vote === "animal").length;
    const humanVotes = votes.filter((v) => v.vote === "human").length;
    const totalVotes = animalVotes + humanVotes;

    const voteStats = {
      animalVotes,
      humanVotes,
      animalPercentage: totalVotes > 0 ? (animalVotes / totalVotes) * 100 : 0,
      humanPercentage: totalVotes > 0 ? (humanVotes / totalVotes) * 100 : 0,
      totalVotes,
    };

    // Check if current user has voted
    const userVote = currentUserId
      ? votes.find((v) => v.voter_id === currentUserId)?.vote || null
      : null;

    return {
      userVote,
      voteStats,
    };
  } catch (error) {
    console.error("Error in getVoteInfo:", error);
    throw new Error(
      `Failed to get vote info: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

// Function to auto-generate missing opposite image
export async function autoGenerateOppositeIfNeeded(
  imageData: ImageData,
): Promise<ImageData> {
  try {
    // If opposite_url exists, return as is
    if (imageData.opposite_url) {
      return imageData;
    }

    console.log("Auto-generating missing opposite image for:", imageData.id);

    // Generate the opposite image
    const oppositeUrl = await createOppositeVersion(
      imageData.original_url,
      imageData.image_type,
      imageData.target_animal_type || "cat",
    );

    // Update the image in the database
    const supabase = await createClient();
    const { data: updatedImage, error: updateError } = await supabase
      .from("images")
      .update({
        opposite_url: oppositeUrl,
        private: false, // Make public once complete
        updated_at: new Date().toISOString(),
      })
      .eq("id", imageData.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating image with opposite URL:", updateError);
      throw new Error(`Failed to update image: ${updateError.message}`);
    }

    return {
      ...updatedImage,
      isUploader: imageData.isUploader,
      hasVotes: imageData.hasVotes,
    } as ImageData;
  } catch (error) {
    console.error("Error in autoGenerateOppositeIfNeeded:", error);
    return imageData; // Return original data if generation fails
  }
}
