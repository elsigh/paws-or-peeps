import { Suspense } from "react";
import Link from "next/link";
import { getRecentTransformations } from "@/lib/image-processing";
import { CatLogo } from "@/components/cat-logo";
import { PawPrint } from "@/components/paw-print";
import { RandomCat } from "@/components/random-cat";
import { GalleryCard } from "@/components/gallery-card";
import { GalleryFilter } from "@/components/gallery-filter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface GalleryContentProps {
  searchParams: Promise<{
    type?: string;
    sort?: string;
  }>;
}

async function GalleryContent({ searchParams }: GalleryContentProps) {
  const { type, sort } = await searchParams;
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
        (item) => item.uploader_id === currentUserId
      );
    } else if (type !== "all" && type !== "mine") {
      // Apply regular type filter
      transformations = transformations.filter(
        (item) => item.image_type === type
      );
    }
  }

  // Apply sorting
  if (sort) {
    switch (sort) {
      case "oldest":
        transformations.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        break;
      case "most_votes":
        transformations.sort(
          (a, b) => b.voteStats.totalVotes - a.voteStats.totalVotes
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
          animatedUrl={item.animated_url}
          oppositeUrl={item.opposite_url}
          type={item.image_type}
          voteStats={item.voteStats}
          createdAt={item.created_at}
        />
      ))}
    </div>
  );
}

export default async function GalleryPage({
  searchParams,
}: GalleryContentProps) {
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

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Link href="/">
            <Button variant="ghost" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Home
            </Button>
          </Link>
          <div className="flex justify-center relative">
            <CatLogo size="md" />
            {/* Tiny cat peeking from behind the logo */}
            <div className="absolute -right-8 top-1/2 transform -translate-y-1/2">
              <RandomCat size="tiny" index={2} className="opacity-90" />
            </div>
          </div>
        </div>

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
                <div className="inline-block animate-bounce mb-4">
                  <RandomCat size="medium" index={1} />
                </div>
                <p className="text-gray-500">Loading transformations...</p>
              </div>
            }
          >
            <GalleryContent searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
