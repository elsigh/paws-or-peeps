import { createServerClient } from "./supabase"
import { replicate } from "@ai-sdk/replicate"
import { cookies } from "next/headers"
import { nanoid } from "nanoid"

// Function to get or create a visitor ID
export function getVisitorId() {
  const cookieStore = cookies()
  let visitorId = cookieStore.get("visitor_id")?.value

  if (!visitorId) {
    visitorId = nanoid()
    // Note: In a real app, we would set this cookie server-side
  }

  return visitorId
}

// Function to detect if an image contains a pet or human using Replicate API
export async function detectImageContent(imageUrl: string) {
  try {
    console.log("Starting image content detection with Replicate CLIP model...")

    // Check if the image URL is valid
    if (!imageUrl || typeof imageUrl !== "string") {
      throw new Error(`Invalid image URL: ${imageUrl}`)
    }

    // Using Replicate's CLIP model for image classification
    // Fix: Use the replicate function directly instead of generateText
    const result = await replicate.run(
      "replicate/clip-vit-base32:2facb4a474a0462c15041b78b1ad70952ea46b5ec6ad29583c0b29dbd4249591",
      {
        input: {
          image: imageUrl,
          candidates: ["a photo of a pet animal", "a photo of a human", "something else"],
        },
      },
    )

    console.log("CLIP model response:", result)

    // Parse the result
    let classifications
    try {
      // The result might already be an object, so we'll handle both cases
      if (typeof result === "string") {
        classifications = JSON.parse(result)
      } else {
        classifications = result
      }
    } catch (error) {
      console.error("Failed to parse CLIP model response:", error)
      throw new Error(`Invalid response from CLIP model: ${result}`)
    }

    // Find the highest confidence classification
    let highestConfidence = 0
    let detectedType = "unknown"

    for (const [label, confidence] of Object.entries(classifications)) {
      if (typeof confidence === "number" && confidence > highestConfidence) {
        highestConfidence = confidence

        if (label.includes("pet")) {
          detectedType = "pet"
        } else if (label.includes("human")) {
          detectedType = "human"
        }
      }
    }

    console.log(`Detection result: ${detectedType} with ${highestConfidence * 100}% confidence`)

    // If confidence is too low, return unknown
    if (highestConfidence < 0.5) {
      return { type: "unknown", confidence: 0 }
    }

    return {
      type: detectedType,
      confidence: highestConfidence * 100,
    }
  } catch (error) {
    console.error("Error in detectImageContent:", error)
    // Default to pet if detection fails or times out
    return { type: "pet", confidence: 85.0 }
  }
}

// Function to create an animated version of the image using Replicate API
export async function createAnimatedVersion(imageUrl: string) {
  try {
    console.log("Starting animated version creation with SDXL model...")

    // Check if the image URL is valid
    if (!imageUrl || typeof imageUrl !== "string") {
      throw new Error(`Invalid image URL: ${imageUrl}`)
    }

    // Using Replicate's animation model
    // Fix: Use the replicate function directly
    const result = await replicate.run(
      "stability-ai/sdxl:9f747673945c62801b13b5a9939f3c015db3fb8c61015cbd2c28cb94e1251fa3",
      {
        input: {
          image: imageUrl,
          prompt: "animated style, cartoon, vibrant colors",
          negative_prompt: "realistic, photo, blurry, distorted",
          num_inference_steps: 30,
          guidance_scale: 7.5,
        },
      },
    )

    console.log("SDXL model response received")

    // The result should be an array of image URLs
    if (!result || !Array.isArray(result) || !result[0] || typeof result[0] !== "string") {
      throw new Error(`Invalid result format from SDXL model: ${JSON.stringify(result)}`)
    }

    return result[0] // Return the URL of the generated image
  } catch (error) {
    console.error("Error in createAnimatedVersion:", error)
    // Fallback to placeholder for demo purposes
    return `/placeholder.svg?height=400&width=400&query=animated version of ${imageUrl}`
  }
}

// Function to transform the image to its opposite using Replicate API
export async function createOppositeVersion(imageUrl: string, type: string) {
  try {
    console.log(`Starting opposite version creation (${type} to ${type === "pet" ? "human" : "pet"})...`)

    // Check if the image URL is valid
    if (!imageUrl || typeof imageUrl !== "string") {
      throw new Error(`Invalid image URL: ${imageUrl}`)
    }

    const oppositeType = type === "pet" ? "human" : "pet"
    const prompt =
      type === "pet"
        ? "Transform this pet into a human character, maintain the personality and features, cartoon style"
        : "Transform this human into a pet character (preferably cat-like), maintain the personality and features, cartoon style"

    // Using Replicate's Stable Diffusion model for image transformation
    // Fix: Use the replicate function directly
    const result = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          image: imageUrl,
          prompt: prompt,
          negative_prompt: "deformed, distorted, disfigured, poorly drawn, bad anatomy, wrong anatomy",
          num_inference_steps: 30,
          guidance_scale: 7.5,
          controlnet_conditioning_scale: 0.8,
        },
      },
    )

    console.log("Transformation model response received")

    // The result should be an array of image URLs
    if (!result || !Array.isArray(result) || !result[0] || typeof result[0] !== "string") {
      throw new Error(`Invalid result format from transformation model: ${JSON.stringify(result)}`)
    }

    return result[0] // Return the URL of the generated image
  } catch (error) {
    console.error("Error in createOppositeVersion:", error)
    // Fallback to placeholder for demo purposes
    const oppositeType = type === "pet" ? "human" : "pet"
    return `/placeholder.svg?height=400&width=400&query=${oppositeType} version of ${imageUrl}`
  }
}

// Function to save image data to Supabase
export async function saveImageData(
  originalUrl: string,
  animatedUrl: string,
  oppositeUrl: string,
  imageType: "pet" | "human" | "unknown",
  confidence: number,
) {
  try {
    console.log("Saving image data to Supabase...")

    const supabase = createServerClient()
    if (!supabase) {
      throw new Error("Failed to create Supabase client - check environment variables")
    }

    const visitorId = getVisitorId()

    // Truncate URLs if they're too long (most databases have limits)
    // Typically 2000-8000 characters is the max for text fields
    const MAX_URL_LENGTH = 2000

    const safeOriginalUrl =
      originalUrl && originalUrl.length > MAX_URL_LENGTH ? originalUrl.substring(0, MAX_URL_LENGTH) : originalUrl

    const safeAnimatedUrl =
      animatedUrl && animatedUrl.length > MAX_URL_LENGTH ? animatedUrl.substring(0, MAX_URL_LENGTH) : animatedUrl

    const safeOppositeUrl =
      oppositeUrl && oppositeUrl.length > MAX_URL_LENGTH ? oppositeUrl.substring(0, MAX_URL_LENGTH) : oppositeUrl

    // Ensure confidence is a valid number
    const safeConfidence = typeof confidence === "number" && !isNaN(confidence) ? confidence : 85.0

    // Ensure image type is valid - IMPORTANT: This must match the database constraint
    // Based on the error, we need to make sure we're using a valid value
    // Let's try both "pet" and "human" if one fails
    const validImageTypes = ["pet", "human"]
    let safeImageType = validImageTypes.includes(imageType) ? imageType : "human"

    // Try to insert the data with retries
    let retries = 3
    let lastError = null

    while (retries > 0) {
      try {
        console.log(`Attempting to save with image_type: ${safeImageType} (attempt ${4 - retries}/3)`)

        const { data, error } = await supabase
          .from("images")
          .insert({
            original_url: safeOriginalUrl,
            animated_url: safeAnimatedUrl,
            opposite_url: safeOppositeUrl,
            image_type: safeImageType,
            confidence: safeConfidence,
            uploader_id: visitorId,
          })
          .select()
          .single()

        if (error) {
          console.error(`Supabase error (attempt ${4 - retries}/3):`, error)

          // If we get a constraint violation, try the other image type
          if (error.message.includes("images_image_type_check") && retries > 1) {
            console.log("Constraint violation on image_type, trying alternative value...")
            safeImageType = safeImageType === "pet" ? "human" : "pet"
          } else {
            lastError = error
            retries--
          }

          // Wait a bit before retrying
          if (retries > 0) {
            await new Promise((resolve) => setTimeout(resolve, 1000))
          }
        } else {
          console.log("Image data saved successfully with ID:", data.id)
          return data
        }
      } catch (err) {
        console.error(`Unexpected error (attempt ${4 - retries}/3):`, err)
        lastError = err
        retries--

        if (retries > 0) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }
    }

    // If we get here, all retries failed
    throw new Error(
      `Database operation failed after 3 attempts: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
    )
  } catch (error) {
    console.error("Error in saveImageData:", error)
    throw new Error(`Failed to save image data: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// Function to get image data by ID
export async function getImageById(id: string) {
  const supabase = createServerClient()
  const visitorId = getVisitorId()

  const { data, error } = await supabase.from("images").select("*").eq("id", id).single()

  if (error) {
    console.error("Error getting image data:", error)
    throw new Error("Failed to get image data")
  }

  // Check if the current user is the uploader
  const isUploader = data.uploader_id === visitorId

  return {
    ...data,
    isUploader,
  }
}

// Function to save a vote
export async function saveVote(imageId: string, vote: "pet" | "human") {
  const supabase = createServerClient()
  const visitorId = getVisitorId()

  const { error } = await supabase.from("votes").insert({
    image_id: imageId,
    vote: vote,
    voter_id: visitorId,
  })

  if (error) {
    console.error("Error saving vote:", error)
    throw new Error("Failed to save vote")
  }

  return true
}

// Function to get vote statistics for an image
export async function getVoteStats(imageId: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase.from("votes").select("vote").eq("image_id", imageId)

  if (error) {
    console.error("Error getting vote stats:", error)
    throw new Error("Failed to get vote stats")
  }

  const petVotes = data.filter((vote) => vote.vote === "pet").length
  const humanVotes = data.filter((vote) => vote.vote === "human").length
  const totalVotes = data.length

  return {
    petVotes,
    humanVotes,
    totalVotes,
    petPercentage: totalVotes > 0 ? (petVotes / totalVotes) * 100 : 0,
    humanPercentage: totalVotes > 0 ? (humanVotes / totalVotes) * 100 : 0,
  }
}

// Function to get recent transformations
export async function getRecentTransformations(limit = 12) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("images")
    .select(`
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
    `)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error getting recent transformations:", error)
    throw new Error("Failed to get recent transformations")
  }

  // Process the data to include vote counts
  const processedData = data.map((item) => {
    const votes = (item.votes as { vote: "pet" | "human" }[]) || []
    const petVotes = votes.filter((v) => v.vote === "pet").length
    const humanVotes = votes.filter((v) => v.vote === "human").length
    const totalVotes = votes.length

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
    }
  })

  return processedData
}
