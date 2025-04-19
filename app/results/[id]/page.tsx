import { CatLogo } from "@/components/cat-logo";
import { PawPrint } from "@/components/paw-print";
import { RandomCat } from "@/components/random-cat";
import ResultsDisplay from "@/components/results-display";
import { Button } from "@/components/ui/button";
import { getImageById, getVoteInfo } from "@/lib/image-processing";
import { createClient } from "@/lib/supabase-server";
import { type UserProfile, getUserProfile } from "@/lib/user-service";
import { Home } from "lucide-react";
import type { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface ResultsPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Generate metadata for the page
export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  // Await the params promise to get the id
  const { id } = await params;

  // Get the image data
  const imageData = await getImageById(id);

  if (!imageData) {
    return {
      title: "Transformation Not Found | Paws or Peeps",
      description: "This transformation could not be found.",
    };
  }

  // Determine the type of transformation
  const transformationType =
    imageData.image_type === "human"
      ? "human to cat"
      : `${imageData.image_type} to human`;

  // Get the base URL for absolute URLs
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://pawsorpeeps.com";

  return {
    title: `Which is the real ${imageData.image_type}? | Paws or Peeps`,
    description: `Check out this amazing ${transformationType} transformation and vote on which one you think is the original!`,
    openGraph: {
      title: `Which is the real ${imageData.image_type}? | Paws or Peeps`,
      description: `Check out this amazing ${transformationType} transformation and vote on which one you think is the original!`,
      images: [
        {
          url: `${baseUrl}/api/og/${id}`,
          width: 1200,
          height: 630,
          alt: `${transformationType} transformation`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Which is the real ${imageData.image_type}? | Paws or Peeps`,
      description: `Check out this amazing ${transformationType} transformation and vote on which one you think is the original!`,
      images: [`${baseUrl}/api/og/${id}`],
    },
  };
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { id } = await params;

  const imageData = await getImageById(id);
  console.log("Image data retrieved successfully", { id, imageData });

  if (!imageData) {
    notFound();
  }

  // Fetch uploader profile on the server
  let uploaderProfile: UserProfile | null = null;
  if (imageData.uploader_id) {
    uploaderProfile = await getUserProfile(imageData.uploader_id);
  }

  // Get vote info on the server
  const { userVote, voteStats } = await getVoteInfo(id);

  return (
    <div className="container relative mx-auto px-4 py-8">
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
        <p className="text-xl text-gray-600 relative inline-block">
          Check out the transformation!
          <span className="absolute -right-8 -top-4 text-2xl">😸</span>
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Suspense fallback={<div>Loading results...</div>}>
          <ResultsDisplay
            imageData={imageData}
            uploaderProfile={uploaderProfile}
            initialVote={userVote}
            initialVoteStats={voteStats}
          />
        </Suspense>
      </div>
    </div>
  );
}
