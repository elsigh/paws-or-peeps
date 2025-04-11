"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, ThumbsUp, ImageIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CatButton } from "@/components/cat-button"
import { PawPrint } from "@/components/paw-print"
import { RandomCat } from "@/components/random-cat"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface ResultsDisplayProps {
  imageId: string
  animatedUrl: string
  oppositeUrl: string
  type: "cat" | "human"
  confidence: number
  originalUrl: string
}

export default function ResultsDisplay({
  imageId,
  animatedUrl,
  oppositeUrl,
  type,
  confidence,
  originalUrl,
}: ResultsDisplayProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [voted, setVoted] = useState(false)
  const [voteStats, setVoteStats] = useState<{
    catVotes: number
    humanVotes: number
    catPercentage: number
    humanPercentage: number
  } | null>(null)
  const [originalType, setOriginalType] = useState<string | null>(null)
  const [animatedImageLoaded, setAnimatedImageLoaded] = useState(false)
  const [oppositeImageLoaded, setOppositeImageLoaded] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)

  const handleVote = async (vote: "cat" | "human") => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageId, vote }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit vote")
      }

      setVoted(true)
      setVoteStats(data.voteStats)
      setOriginalType(data.originalType)
      setShowCelebration(true)

      // Hide celebration after 3 seconds
      setTimeout(() => {
        setShowCelebration(false)
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="relative border-rose-200 overflow-hidden">
          {/* Cat ears for cat image */}
          {type === "cat" && (
            <>
              <div className="absolute -top-3 left-1/4 h-6 w-6 rotate-45 rounded-t-full bg-rose-200 z-10"></div>
              <div className="absolute -top-3 right-1/4 h-6 w-6 -rotate-45 rounded-t-full bg-rose-200 z-10"></div>
            </>
          )}

          {/* Tiny cat peeking from corner */}
          {type === "cat" && (
            <div className="absolute -left-2 -top-2 z-10 transform -rotate-12">
              <RandomCat size="tiny" index={0} />
            </div>
          )}

          <CardContent className="pt-6">
            <div className="aspect-square w-full overflow-hidden rounded-lg relative">
              {!animatedImageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
                </div>
              )}
              <img
                src={animatedUrl || "/placeholder.svg"}
                alt={`Animated ${type}`}
                className="object-cover w-full h-full"
                onLoad={() => setAnimatedImageLoaded(true)}
                style={{ display: animatedImageLoaded ? "block" : "none" }}
              />
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                {type === "cat" ? (
                  <>
                    <span>Cat</span>
                    <span className="text-xl">🐱</span>
                  </>
                ) : (
                  <>
                    <span>Human</span>
                    <span className="text-xl">👤</span>
                  </>
                )}
              </h3>
              <p className="text-sm text-gray-500">Detected with {confidence.toFixed(2)}% confidence</p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative border-rose-200 overflow-hidden">
          {/* Cat ears for cat image (opposite) */}
          {type === "human" && (
            <>
              <div className="absolute -top-3 left-1/4 h-6 w-6 rotate-45 rounded-t-full bg-rose-200 z-10"></div>
              <div className="absolute -top-3 right-1/4 h-6 w-6 -rotate-45 rounded-t-full bg-rose-200 z-10"></div>
            </>
          )}

          {/* Tiny cat peeking from corner */}
          {type === "human" && (
            <div className="absolute -right-2 -top-2 z-10 transform rotate-12">
              <RandomCat size="tiny" index={2} />
            </div>
          )}

          <CardContent className="pt-6">
            <div className="aspect-square w-full overflow-hidden rounded-lg relative">
              {!oppositeImageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
                </div>
              )}
              <img
                src={oppositeUrl || "/placeholder.svg"}
                alt={`${type === "cat" ? "Human" : "Cat"} version`}
                className="object-cover w-full h-full"
                onLoad={() => setOppositeImageLoaded(true)}
                style={{ display: oppositeImageLoaded ? "block" : "none" }}
              />
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                {type === "cat" ? (
                  <>
                    <span>Peep</span>
                    <span className="text-xl">👤</span>
                  </>
                ) : (
                  <>
                    <span>Paw</span>
                    <span className="text-xl">🐱</span>
                  </>
                )}
              </h3>
              <p className="text-sm text-gray-500">Transformed version</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!voted ? (
        <Card className="border-rose-200 relative">
          {/* Decorative paw prints */}
          <div className="absolute -left-6 -top-6 opacity-30">
            <PawPrint size="md" color="text-rose-300" rotation={-15} />
          </div>
          <div className="absolute -right-6 -bottom-6 opacity-30">
            <PawPrint size="md" color="text-rose-300" rotation={45} />
          </div>

          {/* Tiny cat peeking from corner */}
          <div className="absolute -right-3 -top-3 z-10 transform rotate-12">
            <RandomCat size="tiny" index={1} />
          </div>

          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold text-center mb-4 flex items-center justify-center">
              <span>Which one do you think is the original?</span>
              <span className="ml-2 text-xl">🤔</span>
            </h3>
            <div className="flex justify-center gap-4">
              <CatButton
                onClick={() => handleVote("cat")}
                disabled={loading}
                variant="outline"
                className="flex-1 max-w-[150px] border-rose-300 text-rose-600 hover:bg-rose-50"
              >
                <span className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4" />
                  Cat 🐱
                </span>
              </CatButton>
              <CatButton
                onClick={() => handleVote("human")}
                disabled={loading}
                variant="outline"
                className="flex-1 max-w-[150px] border-rose-300 text-rose-600 hover:bg-rose-50"
              >
                <span className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4" />
                  Human 👤
                </span>
              </CatButton>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-rose-200 relative">
          {/* Decorative paw prints */}
          <div className="absolute -left-6 -top-6 opacity-30">
            <PawPrint size="md" color="text-rose-300" rotation={-15} />
          </div>
          <div className="absolute -right-6 -bottom-6 opacity-30">
            <PawPrint size="md" color="text-rose-300" rotation={45} />
          </div>

          {/* Celebration cats */}
          {showCelebration && (
            <>
              <div className="absolute left-1/4 -top-8 z-10 animate-bounce">
                <RandomCat size="small" index={0} />
              </div>
              <div className="absolute right-1/4 -top-8 z-10 animate-bounce" style={{ animationDelay: "0.2s" }}>
                <RandomCat size="small" index={1} />
              </div>
              <div className="absolute left-1/2 -top-8 z-10 animate-bounce" style={{ animationDelay: "0.4s" }}>
                <RandomCat size="small" index={2} />
              </div>
            </>
          )}

          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold text-center mb-4 flex items-center justify-center">
              <span>Vote Results</span>
              <span className="ml-2 text-xl">📊</span>
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="flex items-center gap-1">
                    Cat <span className="text-sm">🐱</span>
                  </span>
                  <span>{voteStats?.catPercentage.toFixed(1)}%</span>
                </div>
                <Progress
                  value={voteStats?.catPercentage || 0}
                  className="h-2 bg-rose-100"
                  indicatorClassName="bg-rose-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="flex items-center gap-1">
                    Human <span className="text-sm">👤</span>
                  </span>
                  <span>{voteStats?.humanPercentage.toFixed(1)}%</span>
                </div>
                <Progress
                  value={voteStats?.humanPercentage || 0}
                  className="h-2 bg-rose-100"
                  indicatorClassName="bg-rose-500"
                />
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-md font-medium text-center mb-2 flex items-center justify-center gap-2">
                <span>The original was actually a {originalType}!</span>
                <span className="text-xl">{originalType === "cat" ? "🐱" : "👤"}</span>
              </h4>
              <div className="aspect-square w-full max-w-sm mx-auto overflow-hidden rounded-lg relative">
                <img
                  src={originalUrl || "/placeholder.svg"}
                  alt="Original image"
                  className="object-cover w-full h-full"
                />
                {/* Add a tiny cat in the corner of the original image */}
                <div className="absolute right-2 bottom-2 z-10">
                  <RandomCat size="tiny" index={2} />
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <CatButton onClick={() => router.push("/")} className="bg-rose-500 hover:bg-rose-600">
                <span className="flex items-center gap-2">
                  Try Another Image
                  <span className="text-sm">🐾</span>
                </span>
              </CatButton>
            </div>
            <div className="mt-2">
              <Link href="/gallery">
                <Button variant="outline" className="w-full gap-2 border-rose-200">
                  <ImageIcon className="h-4 w-4" />
                  View Gallery
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
