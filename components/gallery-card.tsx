"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RandomCat } from "@/components/random-cat"

interface GalleryCardProps {
  id: string
  animatedUrl: string
  oppositeUrl: string
  type: "pet" | "human"
  confidence: number
  voteStats: {
    petVotes: number
    humanVotes: number
    totalVotes: number
    petPercentage: number
    humanPercentage: number
  }
  createdAt: string
}

export function GalleryCard({
  id,
  animatedUrl,
  oppositeUrl,
  type,
  confidence,
  voteStats,
  createdAt,
}: GalleryCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const formattedDate = new Date(createdAt).toLocaleDateString()

  return (
    <Link href={`/results/${id}`}>
      <Card
        className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg border-rose-200 hover:border-rose-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-square overflow-hidden">
          {/* Show animated image by default, opposite on hover */}
          <img
            src={isHovered ? oppositeUrl : animatedUrl}
            alt={`${type} transformation`}
            className="object-cover w-full h-full transition-transform duration-500 hover:scale-110"
          />

          {/* Type indicator with cat ears for pet images */}
          <div className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium flex items-center gap-1">
            {type === "pet" ? (
              <>
                <span>Pet</span>
                <span className="text-sm">🐾</span>
              </>
            ) : (
              <>
                <span>Human</span>
                <span className="text-sm">👤</span>
              </>
            )}
          </div>

          {/* Tiny cat in corner */}
          <div className="absolute bottom-2 right-2 z-10">
            <RandomCat size="tiny" index={type === "pet" ? 0 : 2} />
          </div>

          {/* Hover instruction */}
          {isHovered && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-sm font-medium">
              <span>View Details</span>
            </div>
          )}
        </div>

        <CardContent className="p-3">
          <div className="text-xs text-gray-500 mb-2">{formattedDate}</div>

          {voteStats.totalVotes > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="flex items-center gap-1">
                  <span>Pet</span>
                  <span>🐾</span>
                </span>
                <span>{voteStats.petPercentage.toFixed(0)}%</span>
              </div>
              <Progress value={voteStats.petPercentage} className="h-1 bg-rose-100" indicatorClassName="bg-rose-500" />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
