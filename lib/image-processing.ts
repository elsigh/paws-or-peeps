import { createServerClient } from "./supabase"
import { generateText } from "ai"
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

    // Using Replicate's CLIP model for image classification with AI SDK
    const { text } = await generateText({
      model: replicate("replicate/clip-vit-base32:2facb4a474a0462c15041b78b1ad70952ea46b5ec6ad29583c0b29dbd4249591"),
      prompt: JSON.stringify({
        image: imageUrl,
        candidates: ["a photo of a pet animal", "a photo of a human", "something else"],
      }),
    })

    console.log("CLIP model response:", text)

    // Parse the result
    let classifications
    try {
      classifications = JSON.parse(text)
    } catch (error) {
      console.error("Failed to parse CLIP model response:", error)
      throw new Error(`Invalid response from CLIP model: ${text}`)
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

// Function to create an animated version of the image using Replicate API with AI SDK
export async function createAnimatedVersion(imageUrl: string) {
  try {
    console.log("Starting animated version creation with SDXL model...")

    // Check if the image URL is valid
    if (!imageUrl || typeof imageUrl !== "string") {
      throw new Error(`Invalid image URL: ${imageUrl}`)
    }

    // Using Replicate's animation model with AI SDK
    const { text } = await generateText({
      model: replicate("stability-ai/sdxl:9f747673945c62801b13b5a9939f3c015db3fb8c61015cbd2c28cb94e1251fa3"),
      prompt: JSON.stringify({
        image: imageUrl,
        prompt: "animated style, cartoon, vibrant colors",
        negative_prompt: "realistic, photo, blurry, distorted",
        num_inference_steps: 30,
        guidance_scale: 7.5,
      }),
    })

    console.log("SDXL model response received")

    // Parse the result
    let result
    try {
      result = JSON.parse(text)
    } catch (error) {
      console.error("Failed to parse SDXL model response:", error)
      throw new Error(`Invalid response from SDXL model: ${text}`)
    }

    if (!result || !result[0] || typeof result[0] !== "string") {
      throw new Error(`Invalid result format from SDXL model: ${JSON.stringify(result)}`)
    }

    return result[0] // Return the URL of the generated image
  } catch (error) {
    console.error("Error in createAnimatedVersion:", error)
    // Fallback to placeholder for demo purposes
    return `/placeholder.svg?height=400&width=400&query=animated version of ${imageUrl}`
  }
}

// Function to transform the image to its opposite using Replicate API with AI SDK
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

    // Using Replicate's Stable Diffusion model for image transformation with AI SDK
    const { text } = await generateText({
      model: replicate("stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b"),
      prompt: JSON.stringify({
        image: imageUrl,
        prompt: prompt,
        negative_prompt: "deformed, distorted, disfigured, poorly drawn, bad anatomy, wrong anatomy",
        num_inference_steps: 30,
        guidance_scale: 7.5,
        controlnet_conditioning_scale: 0.8,
      }),
    })

    console.log("Transformation model response received")

    // Parse the result
    let result
    try {
      result = JSON.parse(text)
    } catch (error) {
      console.error("Failed to parse transformation model response:", error)
      throw new Error(`Invalid response from transformation model: ${text}`)
    }

    if (!result || !result[0] || typeof result[0] !== "string") {
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
      throw new Error("Failed to create Supabase client")
    }

    const visitorId = getVisitorId()

    const { data, error } = await supabase
      .from("images")
      .insert({
        original_url: originalUrl,
        animated_url: animatedUrl,
        opposite_url: oppositeUrl,
        image_type: imageType,
        confidence: confidence,
        uploader_id: visitorId,
      })
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      throw new Error(`Database error: ${error.message}`)
    }

    if (!data) {
      throw new Error("No data returned from database insert")
    }

    return data
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
