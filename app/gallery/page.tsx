import { GalleryCard } from "@/components/gallery-card";
import { GalleryFilter } from "@/components/gallery-filter";
import { GalleryWrapper } from "@/components/gallery-wrapper";
import { PawPrint } from "@/components/paw-print";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { ANIMAL_TYPES } from "@/lib/constants";
import { getRecentTransformations } from "@/lib/image-processing";
import { createClient } from "@/lib/supabase-server";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ValidType = "all" | "mine" | "human" | (typeof ANIMAL_TYPES)[number];
type ValidSort = "newest" | "oldest" | "most_votes";

interface GalleryContentProps {
  searchParams: Promise<{
    type?: ValidType;
    sort?: ValidSort;
    user_id?: string;
  }>;
}

async function GalleryContent({ searchParams }: GalleryContentProps) {
  const { type = "all", sort = "newest", user_id } = await searchParams;

  // If 'mine' is selected, get the current user's id and use it as the user_id param
  let effectiveUserId = user_id;
  if (type === "mine") {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const currentUserId = session?.user?.id;
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
    effectiveUserId = currentUserId;
  }

  // Fetch transformations, passing user_id if present
  let transformations = await getRecentTransformations(24, effectiveUserId);

  // Apply type filter (except for 'all' and 'mine')
  if (type && type !== "all" && type !== "mine") {
    transformations = transformations.filter(
      (item) => item.image_type === type,
    );
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
        <h2 className="text-xl font-semibold mb-4">No images found</h2>
        <p className="text-gray-500 mb-6">Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {transformations.map((item) => (
        <GalleryCard
          key={item.id}
          id={item.id}
          animatedUrl={item.animated_url || ""}
          oppositeUrl={item.opposite_url || ""}
          type={item.image_type as "human" | (typeof ANIMAL_TYPES)[number]}
          style={item.style}
          voteStats={item.voteStats}
          createdAt={item.created_at}
          private={item.private}
          userId={item.user_id}
          uploader_profile={item.uploader_profile}
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
      <TooltipProvider>
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
            <h1 className="text-3xl font-bold text-center mb-2">Gallery</h1>
            <p className="text-center text-gray-600 mb-8">
              Browse recent public creations
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
      </TooltipProvider>
    </GalleryWrapper>
  );
}
