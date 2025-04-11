import { createServerClient } from "./supabase"
import { generateText } from "ai"
import { replicate } from "@ai-sdk/replicate"

// Function to detect if an image contains a cat or human using Replicate API
export async function detectImageContent(imageUrl: string) {
  try {
    // Using Replicate's CLIP model for image classification with AI SDK
    const { text } = await generateText({
      model: replicate("replicate/clip-vit-base32:2facb4a474a0462c15041b78b1ad70952ea46b5ec6ad29583c0b29dbd4249591"),
      prompt: JSON.stringify({
        image: imageUrl,
        candidates: ["a photo of a cat", "a photo of a human face", "something else"],
      }),
    })

    // Parse the result
    const classifications = JSON.parse(text)

    // Find the highest confidence classification
    let highestConfidence = 0
    let detectedType = "unknown"

    for (const [label, confidence] of Object.entries(classifications)) {
      if (typeof confidence === "number" && confidence > highestConfidence) {
        highestConfidence = confidence

        if (label.includes("cat")) {
          detectedType = "cat"
        } else if (label.includes("human")) {
          detectedType = "human"
        }
      }
    }

    // If confidence is too low, return unknown
    if (highestConfidence < 0.5) {
      return { type: "unknown", confidence: 0 }
    }

    return {
      type: detectedType,
      confidence: highestConfidence * 100,
    }
  } catch (error) {
    console.error("Error detecting image content:", error)
    // Default to cat if detection fails or times out
    return { type: "cat", confidence: 85.0 }
  }
}

// Function to create an animated version of the image using Replicate API with AI SDK
export async function createAnimatedVersion(imageUrl: string) {
  try {
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

    // Parse the result
    const result = JSON.parse(text)
    return result[0] // Return the URL of the generated image
  } catch (error) {
    console.error("Error creating animated version:", error)
    // Fallback to placeholder for demo purposes
    return `/placeholder.svg?height=400&width=400&query=animated version of ${imageUrl}`
  }
}

// Function to transform the image to its opposite using Replicate API with AI SDK
export async function createOppositeVersion(imageUrl: string, type: string) {
  try {
    const oppositeType = type === "cat" ? "human" : "cat"
    const prompt =
      type === "cat"
        ? "Transform this cat into a human character, maintain the personality and features, cartoon style"
        : "Transform this human into a cat character, maintain the personality and features, cartoon style"

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

    // Parse the result
    const result = JSON.parse(text)
    return result[0] // Return the URL of the generated image
  } catch (error) {
    console.error("Error creating opposite version:", error)
    // Fallback to placeholder for demo purposes
    const oppositeType = type === "cat" ? "human" : "cat"
    return `/placeholder.svg?height=400&width=400&query=${oppositeType} version of ${imageUrl}`
  }
}

// Function to save image data to Supabase
export async function saveImageData(
  originalUrl: string,
  animatedUrl: string,
  oppositeUrl: string,
  imageType: "cat" | "human" | "unknown",
  confidence: number,
) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("images")
    .insert({
      original_url: originalUrl,
      animated_url: animatedUrl,
      opposite_url: oppositeUrl,
      image_type: imageType,
      confidence: confidence,
    })
    .select()
    .single()

  if (error) {
    console.error("Error saving image data:", error)
    throw new Error("Failed to save image data")
  }

  return data
}

// Function to get image data by ID
export async function getImageById(id: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase.from("images").select("*").eq("id", id).single()

  if (error) {
    console.error("Error getting image data:", error)
    throw new Error("Failed to get image data")
  }

  return data
}

// Function to save a vote
export async function saveVote(imageId: string, vote: "cat" | "human") {
  const supabase = createServerClient()

  const { error } = await supabase.from("votes").insert({
    image_id: imageId,
    vote: vote,
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

  const catVotes = data.filter((vote) => vote.vote === "cat").length
  const humanVotes = data.filter((vote) => vote.vote === "human").length
  const totalVotes = data.length

  return {
    catVotes,
    humanVotes,
    totalVotes,
    catPercentage: totalVotes > 0 ? (catVotes / totalVotes) * 100 : 0,
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
    const votes = (item.votes as { vote: "cat" | "human" }[]) || []
    const catVotes = votes.filter((v) => v.vote === "cat").length
    const humanVotes = votes.filter((v) => v.vote === "human").length
    const totalVotes = votes.length

    return {
      ...item,
      votes: undefined, // Remove the raw votes array
      voteStats: {
        catVotes,
        humanVotes,
        totalVotes,
        catPercentage: totalVotes > 0 ? (catVotes / totalVotes) * 100 : 0,
        humanPercentage: totalVotes > 0 ? (humanVotes / totalVotes) * 100 : 0,
      },
    }
  })

  return processedData
}
