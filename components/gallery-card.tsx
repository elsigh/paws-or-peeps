"use client";

import { RandomCat } from "@/components/random-cat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ANIMAL_TYPES } from "@/lib/constants";
import { STYLE_EMOJI_MAP } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface GalleryCardProps {
  id: string;
  animatedUrl: string;
  oppositeUrl: string;
  type: "human" | (typeof ANIMAL_TYPES)[number];
  style: keyof typeof STYLE_EMOJI_MAP;
  voteStats: {
    animalVotes: number;
    humanVotes: number;
    animalPercentage: number;
    humanPercentage: number;
    totalVotes: number;
  };
  createdAt: string;
  private: boolean;
  userId: string;
  profile?: {
    user_id: string;
    display_name?: string | null;
    avatar_url?: string | null;
  } | null;
}

export function GalleryCard({
  id,
  animatedUrl,
  oppositeUrl,
  type,
  style,
  voteStats,
  createdAt,
  private: isPrivate,
  userId,
  profile,
}: GalleryCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const formattedDate = new Date(createdAt).toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const handleFilterByUploader = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/gallery?user_id=${userId}`);
  };

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
                <span className="text-sm">👤</span>
              </>
            ) : (
              <>
                <span className="text-sm">🐾</span>
              </>
            )}
          </div>
          <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium flex items-center gap-1">
            {STYLE_EMOJI_MAP[style] ? (
              <>
                <span className="text-sm">{STYLE_EMOJI_MAP[style].emoji}</span>
                <span>{STYLE_EMOJI_MAP[style].label}</span>
              </>
            ) : (
              <>
                <span className="text-sm">❓</span>
                <span>Other</span>
              </>
            )}
          </div>

          {/* Hover instruction */}
          {isHovered && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-sm font-medium">
              <span>View Details</span>
              <RandomCat size="tiny" index={type === "human" ? 2 : 0} />
            </div>
          )}
        </div>

        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            {/* Uploader avatar + tooltip (always rendered) */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="focus:outline-none"
                  onClick={handleFilterByUploader}
                  onTouchEnd={handleFilterByUploader}
                  tabIndex={0}
                >
                  <Avatar className="h-6 w-6 border border-gray-200">
                    <AvatarImage
                      src={profile?.avatar_url || undefined}
                      alt={profile?.display_name || "Uploader"}
                    />
                    <AvatarFallback>?</AvatarFallback>
                  </Avatar>
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="flex flex-col items-center gap-2 p-3"
              >
                <Avatar className="h-12 w-12 border border-gray-200">
                  <AvatarImage
                    src={profile?.avatar_url || undefined}
                    alt={profile?.display_name || "Uploader"}
                  />
                  <AvatarFallback>?</AvatarFallback>
                </Avatar>
                <span className="font-medium text-base">
                  {profile?.display_name || "Uploader"}
                </span>
                <span className="text-xs text-gray-400">See all uploads</span>
              </TooltipContent>
            </Tooltip>
            <span className="text-xs text-gray-500">{formattedDate}</span>
            <span className="text-xs text-gray-500">
              {isPrivate ? "🔐" : ""}
            </span>
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
