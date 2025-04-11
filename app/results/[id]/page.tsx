import { notFound } from "next/navigation"
import ResultsDisplay from "@/components/results-display"
import { getImageById } from "@/lib/image-processing"
import { CatLogo } from "@/components/cat-logo"
import { PawPrint } from "@/components/paw-print"
import { RandomCat } from "@/components/random-cat"

interface ResultsPageProps {
  params: {
    id: string
  }
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  try {
    const imageData = await getImageById(params.id)

    if (!imageData) {
      return notFound()
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
