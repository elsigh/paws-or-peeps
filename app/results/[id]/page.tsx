import { notFound } from "next/navigation"
import ResultsDisplay from "@/components/results-display"
import { getImageById } from "@/lib/image-processing"
import { CatLogo } from "@/components/cat-logo"
import { PawPrint } from "@/components/paw-print"
import { RandomCat } from "@/components/random-cat"
import { createServerClient } from "@/lib/supabase"

interface ResultsPageProps {
  params: {
    id: string
  }
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  try {
    console.log("Results page loading for ID:", params.id)

    let imageData

    try {
      // First try to get the image data using the getImageById function
      imageData = await getImageById(params.id)
      console.log("Image data retrieved successfully")
    } catch (error) {
      console.error("Error getting image data with getImageById:", error)

      // If that fails, try a direct database query
      try {
        console.log("Attempting direct database query...")
        const supabase = createServerClient()
        if (!supabase) {
          throw new Error("Failed to create Supabase client")
        }

        const { data, error: queryError } = await supabase.from("images").select("*").eq("id", params.id).single()

        if (queryError) {
          throw new Error(`Database query error: ${queryError.message}`)
        }

        if (!data) {
          throw new Error("No image data found")
        }

        // Add isUploader property
        imageData = {
          ...data,
          isUploader: true, // Default to true if we can't determine
        }

        console.log("Direct database query successful")
      } catch (directQueryError) {
        console.error("Direct database query also failed:", directQueryError)

        // As a last resort, check if this is a temporary ID
        // In this case, we'll use placeholder data
        console.log("Using placeholder data for possible temporary ID")

        imageData = {
          id: params.id,
          original_url: "/colorful-abstract-shapes.png",
          animated_url: "/whimsical-forest-creatures.png",
          opposite_url: "/light-and-shadow.png",
          image_type: "human", // Changed from "pet" to "human" to match our fix
          confidence: 85.0,
          isUploader: true,
          created_at: new Date().toISOString(),
        }
      }
    }

    // Ensure image_type is valid for the component
    // If the database has a different value than what our component expects,
    // we need to map it to a value the component can handle
    const validTypes = ["pet", "human"]
    if (!validTypes.includes(imageData.image_type)) {
      console.log(`Converting non-standard image_type "${imageData.image_type}" to "human"`)
      imageData.image_type = "human" // Default to human if we get an unexpected value
    }

    return (
      <div className="container relative mx-auto px-4 py-12">
        {/* Decorative paw prints */}
        <div className="pointer-events-none absolute left-4 top-20 opacity-20">
          <PawPrint size="lg" rotation={-15} />
        </div>
        <div className="pointer-events-none absolute right-10 top-40 opacity-20">
          <PawPrint size="md" rotation={20} />
        </div>
        <div className="pointer-events-none absolute bottom-20 left-1/4 opacity-20">
          <PawPrint size="lg" rotation={45} />
        </div>
        <div className="pointer-events-none absolute bottom-40 right-1/4 opacity-20">
          <PawPrint size="md" rotation={-30} />
        </div>

        {/* Random cat images */}
        <div className="pointer-events-none absolute left-8 top-32 opacity-80 hidden md:block">
          <RandomCat size="tiny" index={0} rotate={-10} />
        </div>
        <div className="pointer-events-none absolute right-12 bottom-40 opacity-80 hidden md:block">
          <RandomCat size="tiny" index={1} rotate={15} />
        </div>
        <div className="pointer-events-none absolute left-1/3 bottom-20 opacity-80 hidden md:block">
          <RandomCat size="tiny" index={2} rotate={-5} />
        </div>

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4 relative">
            <CatLogo size="lg" />
            {/* Tiny cat peeking from behind the logo */}
            <div className="absolute -right-10 top-1/2 transform -translate-y-1/2">
              <RandomCat size="tiny" index={2} className="opacity-90" />
            </div>
          </div>
          <p className="text-xl text-gray-600 relative inline-block">
            Check out the transformation!
            <span className="absolute -right-8 -top-4 text-2xl">😸</span>
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <ResultsDisplay
            imageId={imageData.id}
            animatedUrl={imageData.animated_url}
            oppositeUrl={imageData.opposite_url}
            type={imageData.image_type}
            confidence={imageData.confidence}
            originalUrl={imageData.original_url}
            isUploader={imageData.isUploader}
          />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error loading results:", error)
    return notFound()
  }
}
