"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, ThumbsUp, ImageIcon, Copy, Check } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CatButton } from "@/components/cat-button"
import { PawPrint } from "@/components/paw-print"
import { RandomCat } from "@/components/random-cat"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ResultsDisplayProps {
  imageId: string
  animatedUrl: string
  oppositeUrl: string
  type: "pet" | "human"
  confidence: number
  originalUrl: string
  isUploader: boolean
}

export default function ResultsDisplay({
  imageId,
  animatedUrl,
  oppositeUrl,
  type,
  confidence,
  originalUrl,
  isUploader,
}: ResultsDisplayProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [voted, setVoted] = useState(false)
  const [voteStats, setVoteStats] = useState<{
    petVotes: number
    humanVotes: number
    petPercentage: number
    humanPercentage: number
  } | null>(null)
  const [originalType, setOriginalType] = useState<string | null>(null)
  const [animatedImageLoaded, setAnimatedImageLoaded] = useState(false)
  const [oppositeImageLoaded, setOppositeImageLoaded] = useState(false)
  const [originalImageLoaded, setOriginalImageLoaded] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [copied, setCopied] = useState(false)
  const shareUrlRef = useRef<HTMLInputElement>(null)

  const handleVote = async (vote: "pet" | "human") => {
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

  const copyShareLink = () => {
    if (shareUrlRef.current) {
      shareUrlRef.current.select()
      document.execCommand("copy")
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareUrl =
    typeof window !== "undefined" ? `${window.location.origin}/results/${imageId}` : `/results/${imageId}`

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="relative border-rose-200 overflow-hidden">
          {/* Cat ears for pet image */}
          {type === "pet" && (
            <>
              <div className="absolute -top-3 left-1/4 h-6 w-6 rotate-45 rounded-t-full bg-rose-200 z-10"></div>
              <div className="absolute -top-3 right-1/4 h-6 w-6 -rotate-45 rounded-t-full bg-rose-200 z-10"></div>
            </>
          )}

          {/* Tiny cat peeking from corner */}
          {type === "pet" && (
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
                {type === "pet" ? (
                  <>
                    <span>Pet</span>
                    <span className="text-xl">🐾</span>
                  </>
                ) : (
                  <>
                    <span>Human</span>
                    <span className="text-xl">👤</span>
                  </>
                )}
              </h3>
              {/* Only show confidence to the uploader */}
              {isUploader && <p className="text-sm text-gray-500">Detected with {confidence.toFixed(2)}% confidence</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="relative border-rose-200 overflow-hidden">
          {/* Cat ears for pet image (opposite) */}
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
                alt={`${type === "pet" ? "Human" : "Pet"} version`}
                className="object-cover w-full h-full"
                onLoad={() => setOppositeImageLoaded(true)}
                style={{ display: oppositeImageLoaded ? "block" : "none" }}
              />
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                {type === "pet" ? (
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

      {/* Voting section - only visible to non-uploaders who haven't voted yet */}
      {!isUploader && !voted ? (
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
                onClick={() => handleVote("pet")}
                disabled={loading}
                variant="outline"
                className="flex-1 max-w-[150px] border-rose-300 text-rose-600 hover:bg-rose-50"
              >
                <span className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4" />
                  Pet 🐾
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
      ) : voted ? (
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
                    Pet <span className="text-sm">🐾</span>
                  </span>
                  <span>{voteStats?.petPercentage.toFixed(1)}%</span>
                </div>
                <Progress
                  value={voteStats?.petPercentage || 0}
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
                <span className="text-xl">{originalType === "pet" ? "🐾" : "👤"}</span>
              </h4>
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
      ) : (
        /* For uploaders who can't vote, show a share card */
        <Card className="border-rose-200 relative">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                <span>Share with Friends</span>
                <span className="text-xl">🔗</span>
              </h3>

              <p className="text-gray-600">
                This is your upload! Share this link with friends so they can vote on which image they think is the
                original.
              </p>

              <div className="flex items-center gap-2 mt-4">
                <input
                  ref={shareUrlRef}
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  onClick={(e) => e.currentTarget.select()}
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={copyShareLink}
                        className="border-rose-200 hover:bg-rose-50"
                      >
                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{copied ? "Copied!" : "Copy link"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="flex justify-center gap-4 mt-4">
                <Link href="/">
                  <CatButton className="bg-rose-500 hover:bg-rose-600">
                    <span className="flex items-center gap-2">
                      Upload Another
                      <span className="text-sm">🐾</span>
                    </span>
                  </CatButton>
                </Link>
                <Link href="/gallery">
                  <Button variant="outline" className="gap-2 border-rose-200">
                    <ImageIcon className="h-4 w-4" />
                    View Gallery
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Original image section - always visible to uploaders, visible to others after voting */}
      {(isUploader || voted) && (
        <Card className="border-rose-200 relative">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold text-center mb-4 flex items-center justify-center gap-2">
              <span>Original Image</span>
              <span className="text-xl">{type === "pet" ? "🐾" : "👤"}</span>
            </h3>
            <div className="aspect-square w-full max-w-sm mx-auto overflow-hidden rounded-lg relative">
              {!originalImageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
                </div>
              )}
              <img
                src={originalUrl || "/placeholder.svg"}
                alt="Original image"
                className="object-cover w-full h-full"
                onLoad={() => setOriginalImageLoaded(true)}
                style={{ display: originalImageLoaded ? "block" : "none" }}
              />
              {/* Add a tiny cat in the corner of the original image */}
              <div className="absolute right-2 bottom-2 z-10">
                <RandomCat size="tiny" index={2} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
