"use client";

import { RandomCat } from "@/components/random-cat";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ANIMAL_TYPES } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface GalleryCardProps {
  id: string;
  animatedUrl: string;
  oppositeUrl: string;
  type: "human" | (typeof ANIMAL_TYPES)[number];
  voteStats: {
    animalVotes: number;
    humanVotes: number;
    animalPercentage: number;
    humanPercentage: number;
    totalVotes: number;
  };
  createdAt: string;
  private: boolean;
}

export function GalleryCard({
  id,
  animatedUrl,
  oppositeUrl,
  type,
  voteStats,
  createdAt,
  private: isPrivate,
}: GalleryCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const formattedDate = new Date(createdAt).toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <Link href={`/results/${id}`}>
      <Card
        className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg border-rose-200 hover:border-rose-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-square w-full overflow-hidden">
          {/* Show animated image by default, opposite on hover */}
          <Image
            src={isHovered ? oppositeUrl : animatedUrl}
            alt={`${type} transformation`}
            className="object-cover transition-transform duration-500 hover:scale-110"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />

          <div className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium flex items-center gap-1">
            {type === "human" ? (
              <>
                <span>Human</span>
                <span className="text-sm">👤</span>
              </>
            ) : (
              <>
                <span>Animal</span>
                <span className="text-sm">🐾</span>
              </>
            )}
          </div>

          {/* Tiny cat in corner */}
          <div className="absolute bottom-2 right-2 z-10">
            <RandomCat size="tiny" index={type === "human" ? 2 : 0} />
          </div>

          {/* Hover instruction */}
          {isHovered && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-sm font-medium">
              <span>View Details</span>
            </div>
          )}
        </div>

        <CardContent className="p-3">
          <div className="flex justify-between">
            <div className="text-xs text-gray-500 mb-2">{formattedDate}</div>
            <div className="text-xs text-gray-500 mb-2">
              {isPrivate ? "🔐" : ""}
            </div>
          </div>

          {voteStats.totalVotes > 0 && (
            <div className="space-y-1 mt-2">
              <div className="flex justify-between text-xs">
                <span className="flex items-center gap-1">
                  <span>Animal</span>
                  <span>🐾</span>
                </span>
                <span>
                  {voteStats.animalVotes || 0}{" "}
                  {voteStats.animalVotes === 1 ? "vote" : "votes"}
                </span>
                <span>{voteStats.animalPercentage.toFixed(0)}%</span>
              </div>
              <Progress
                value={voteStats.animalPercentage}
                className="h-1 bg-rose-100"
                indicatorClassName="bg-rose-500"
              />

              <div className="flex justify-between text-xs mt-1">
                <span className="flex items-center gap-1">
                  <span>Human</span>
                  <span>👤</span>
                </span>
                <span>
                  {voteStats.humanVotes || 0}{" "}
                  {voteStats.humanVotes === 1 ? "vote" : "votes"}
                </span>
                <span>{voteStats.humanPercentage.toFixed(0)}%</span>
              </div>
              <Progress
                value={voteStats.humanPercentage}
                className="h-1 bg-rose-100"
                indicatorClassName="bg-rose-500"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
