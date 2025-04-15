import { Suspense } from "react";
import { notFound } from "next/navigation";
import ResultsDisplay from "@/components/results-display";
import { getImageById } from "@/lib/image-processing";
import { CatLogo } from "@/components/cat-logo";
import { PawPrint } from "@/components/paw-print";
import { RandomCat } from "@/components/random-cat";
import { createClient } from "@/lib/supabase-server";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import Link from "next/link";

interface ResultsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { id } = await params;
  console.log("Results page loading for ID:", id);

  const imageData = await getImageById(id);
  console.log("Image data retrieved successfully", { id, imageData });

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
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="rounded-full">
                <Home className="h-5 w-5 text-rose-500" />
              </Button>
            </Link>
          </div>
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
        <Suspense fallback={<div>Loading results...</div>}>
          <ResultsDisplay
            imageId={imageData.id}
            animatedUrl={imageData.animated_url}
            oppositeUrl={imageData.opposite_url}
            type={imageData.image_type}
            originalUrl={imageData.original_url}
            uploaderId={imageData.uploader_id}
            hasVotes={imageData.hasVotes}
          />
        </Suspense>
      </div>
    </div>
  );
}
