import { GalleryCard } from "@/components/gallery-card";
import { GalleryFilter } from "@/components/gallery-filter";
import { GalleryWrapper } from "@/components/gallery-wrapper";
import { PawPrint } from "@/components/paw-print";
import { Button } from "@/components/ui/button";
import type { ANIMAL_TYPES } from "@/lib/constants";
import { getRecentTransformations } from "@/lib/image-processing";
import { createClient } from "@/lib/supabase-server";
import Link from "next/link";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ValidType = "all" | "mine" | "human" | (typeof ANIMAL_TYPES)[number];
type ValidSort = "newest" | "oldest" | "most_votes";

interface GalleryContentProps {
  searchParams: Promise<{
    type?: ValidType;
    sort?: ValidSort;
  }>;
}

async function GalleryContent({ searchParams }: GalleryContentProps) {
  const { type = "all", sort = "newest" } = await searchParams;
  let transformations = await getRecentTransformations(24);

  // Get current user if we need to filter by "mine"
  let currentUserId = null;
  if (type === "mine") {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    currentUserId = session?.user?.id;

    // If user is not logged in but "mine" filter is selected, show no results
    if (!currentUserId) {
      return (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">Please sign in</h2>
          <p className="text-gray-500 mb-6">
            You need to be signed in to view your transformations
          </p>
        </div>
      );
    }
  }

  // Apply type filter
  if (type) {
    if (type === "mine" && currentUserId) {
      // Filter by uploader_id for "mine" filter
      transformations = transformations.filter(
        (item) => String(item.uploader_id) === String(currentUserId),
      );
    } else if (type !== "all" && type !== "mine") {
      // Apply regular type filter
      transformations = transformations.filter(
        (item) => item.image_type === type,
      );
    }
  }

  // Apply sorting
  if (sort) {
    switch (sort) {
      case "oldest":
        transformations.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );
        break;
      case "most_votes":
        transformations.sort(
          (a, b) => b.voteStats.totalVotes - a.voteStats.totalVotes,
        );
        break;
      // Default is "newest" which is already sorted from the database query
    }
  }

  if (transformations.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-4">No transformations found</h2>
        <p className="text-gray-500 mb-6">
          Try adjusting your filters or create a new transformation
        </p>
        <Link href="/">
          <Button className="bg-rose-500 hover:bg-rose-600">
            Create a Transformation
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {transformations.map((item) => (
        <GalleryCard
          key={item.id}
          id={item.id}
          // @ts-ignore
          animatedUrl={item.animated_url}
          // @ts-ignore
          oppositeUrl={item.opposite_url}
          // @ts-ignore
          type={item.image_type}
          voteStats={item.voteStats}
          createdAt={item.created_at}
          private={item.private}
        />
      ))}
    </div>
  );
}

export default async function GalleryPage({
  searchParams,
}: GalleryContentProps) {
  return (
    <GalleryWrapper>
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

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">
            Transformation Gallery
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Browse recent cat-human transformations created by our users
          </p>

          <GalleryFilter />

          <div className="relative">
            <Suspense
              fallback={
                <div className="text-center py-12">
                  <p className="text-gray-500">Loading ...</p>
                </div>
              }
            >
              <GalleryContent searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </div>
    </GalleryWrapper>
  );
}
