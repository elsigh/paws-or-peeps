"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Upload, ImageIcon, FileWarning } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CatButton } from "@/components/cat-button"
import { PawPrint } from "@/components/paw-print"
import { RandomCat } from "@/components/random-cat"
import { Progress } from "@/components/ui/progress"

// Pet facts about similarities and differences between pets and humans
const PET_FACTS = [
  "Pets and humans both have a similar brain structure responsible for emotions.",
  "Dogs can understand up to 250 words and gestures, similar to a 2-year-old human.",
  "Both pets and humans have dominant hands (or paws).",
  "A cat's brain is 90% similar to a human's brain.",
  "Pets can't taste all the same flavors humans can.",
  "Both pets and humans have a similar range of hearing.",
  "Dogs have about 300 million olfactory receptors, humans only have 6 million.",
  "Pets and humans both dream during sleep.",
  "A pet's heart beats faster than a human heart.",
  "Cats have better night vision than humans.",
  "Both pets and humans form social bonds and can feel loneliness.",
  "Dogs have 42 teeth, while adult humans have 32.",
  "Pets can jump much higher relative to their size than humans can.",
  "Both pets and humans use facial expressions to communicate.",
  "Many pets have a third eyelid, humans don't.",
  "Pets can sense changes in barometric pressure before storms, humans typically can't.",
  "Cats have 24 whiskers, humans have none (usually).",
  "Both pets and humans yawn when tired or stressed.",
  "Pets can rotate their ears to locate sounds, humans can't.",
  "Pets and humans both benefit from regular exercise and a healthy diet.",
]

// Maximum file size in bytes (4MB)
const MAX_FILE_SIZE = 4 * 1024 * 1024

export default function FileUpload() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [currentFactIndex, setCurrentFactIndex] = useState(0)
  const [currentCatIndex, setCurrentCatIndex] = useState(0)
  const [fileSize, setFileSize] = useState<number>(0)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Cycle through pet facts during loading
  useEffect(() => {
    let factInterval: NodeJS.Timeout | null = null
    let catInterval: NodeJS.Timeout | null = null

    if (loading) {
      factInterval = setInterval(() => {
        setCurrentFactIndex((prevIndex) => (prevIndex + 1) % PET_FACTS.length)
      }, 3000) // Change fact every 3 seconds

      catInterval = setInterval(() => {
        setCurrentCatIndex((prevIndex) => (prevIndex + 1) % 3)
      }, 2000) // Change cat image every 2 seconds
    }

    return () => {
      if (factInterval) clearInterval(factInterval)
      if (catInterval) clearInterval(catInterval)
    }
  }, [loading])

  // Handle file selection from input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    processFile(selectedFile)
  }

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Process the file regardless of source (input, paste, or drop)
  const processFile = (selectedFile: File | null) => {
    setFile(selectedFile)
    setError(null)
    setErrorDetails(null)

    if (selectedFile) {
      // Set file size for display
      setFileSize(selectedFile.size)

      // Validate file type
      if (!selectedFile.type.startsWith("image/")) {
        setError("Please select an image file")
        return
      }

      // Add file size validation (limit to 4MB)
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError(
          `Image size (${formatFileSize(selectedFile.size)}) exceeds the 4MB limit. Please select a smaller image.`,
        )
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    } else {
      setPreview(null)
      setFileSize(0)
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setError("Please select an image to upload")
      return
    }

    // Double-check file size before submission
    if (file.size > MAX_FILE_SIZE) {
      setError(`Image size (${formatFileSize(file.size)}) exceeds the 4MB limit. Please select a smaller image.`)
      return
    }

    setLoading(true)
    setError(null)
    setErrorDetails(null)
    // Reset to first fact when starting loading
    setCurrentFactIndex(0)
    setCurrentCatIndex(0)

    try {
      const formData = new FormData()
      formData.append("image", file)

      const response = await fetch("/api/process-image", {
        method: "POST",
        body: formData,
      })

      // Check if the response is JSON
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        // Handle non-JSON responses
        const text = await response.text()
        if (text.includes("Request Entity Too Large")) {
          throw new Error("Image is too large. Please use an image smaller than 4MB.")
        } else {
          throw new Error(`Server error: ${text.substring(0, 100)}...`)
        }
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to process image")
      }

      if (data.error) {
        setError(data.error)
        if (data.details) {
          setErrorDetails(data.details)
        }
        setLoading(false)
        return
      }

      // Redirect to the results page
      router.push(`/results/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      setLoading(false)
    }
  }

  // Handle drag events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      processFile(droppedFiles[0])
    }
  }

  // Handle paste from clipboard
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const pastedFile = e.clipboardData.files[0]
        if (pastedFile.type.startsWith("image/")) {
          processFile(pastedFile)
        }
      }
    }

    // Add paste event listener to the document
    document.addEventListener("paste", handlePaste)

    // Clean up
    return () => {
      document.removeEventListener("paste", handlePaste)
    }
  }, [])

  // Handle click on the drop zone to trigger file input
  const handleDropZoneClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Calculate file size percentage of max
  const fileSizePercentage = file ? Math.min((file.size / MAX_FILE_SIZE) * 100, 100) : 0
  const isFileTooLarge = file && file.size > MAX_FILE_SIZE

  return (
    <Card className="w-full max-w-md mx-auto relative border-rose-200">
      {/* Decorative paw prints on the card */}
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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="image" className="flex items-center">
              <span>Upload an image</span>
              <span className="ml-2 text-lg">🐱</span>
            </Label>

            {/* Hidden file input */}
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={loading}
              className="hidden"
              ref={fileInputRef}
            />

            {/* Custom drop zone */}
            <div
              ref={dropZoneRef}
              onClick={handleDropZoneClick}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                relative border-2 border-dashed rounded-lg p-6 cursor-pointer
                transition-colors duration-200 ease-in-out
                flex flex-col items-center justify-center
                ${isDragging ? "border-rose-400 bg-rose-50" : "border-rose-200 hover:border-rose-400"}
                ${loading ? "opacity-50 cursor-not-allowed" : ""}
                ${isFileTooLarge ? "border-red-400 bg-red-50" : ""}
              `}
            >
              {/* Cat ears on the drop zone when empty */}
              {!preview && (
                <>
                  <div className="absolute -top-3 left-1/2 ml-6 h-6 w-6 rotate-45 rounded-t-full bg-rose-200"></div>
                  <div className="absolute -top-3 left-1/2 -ml-12 h-6 w-6 -rotate-45 rounded-t-full bg-rose-200"></div>
                </>
              )}

              {preview ? (
                <div className="relative aspect-square w-full max-w-sm mx-auto overflow-hidden rounded-lg">
                  <img src={preview || "/placeholder.svg"} alt="Preview" className="object-cover w-full h-full" />

                  {/* File size warning overlay for large files */}
                  {isFileTooLarge && (
                    <div className="absolute inset-0 bg-red-500/70 flex flex-col items-center justify-center text-white p-4 text-center">
                      <FileWarning className="h-12 w-12 mb-2" />
                      <p className="font-bold text-lg">File Too Large!</p>
                      <p>Maximum size: 4MB</p>
                      <p>Your file: {formatFileSize(file.size)}</p>
                      <p className="mt-2 text-sm">Please select a smaller image</p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <ImageIcon className="h-12 w-12 text-rose-300 mb-2" />
                  <p className="text-sm font-medium">Click to browse, drag & drop, or paste an image</p>
                  <p className="text-xs text-gray-500 mt-1">Supports: JPG, PNG, GIF, WebP</p>
                </>
              )}
            </div>

            {/* File size indicator */}
            {file && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>File size: {formatFileSize(file.size)}</span>
                  <span className={isFileTooLarge ? "text-red-500 font-bold" : ""}>Max: 4MB</span>
                </div>
                <Progress
                  value={fileSizePercentage}
                  className="h-1 bg-gray-100"
                  indicatorClassName={isFileTooLarge ? "bg-red-500" : "bg-green-500"}
                />
              </div>
            )}

            <p className="text-sm text-gray-500">
              Upload a photo of a pet or a human. AI processing may take up to 30 seconds.
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="animate-pulse">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error}
                {errorDetails && (
                  <div className="mt-2 text-xs border-t border-red-200 pt-2">
                    <details>
                      <summary className="cursor-pointer">Technical Details</summary>
                      <p className="mt-1 whitespace-pre-wrap">{errorDetails}</p>
                    </details>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <CatButton
            type="submit"
            className="w-full bg-rose-500 hover:bg-rose-600"
            disabled={loading || !file || isFileTooLarge}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Transforming...
              </span>
            ) : isFileTooLarge ? (
              <span className="flex items-center gap-2">
                <FileWarning className="h-4 w-4" />
                Image Too Large
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload & Transform
              </span>
            )}
          </CatButton>

          {/* Pet facts during loading with cycling cat images */}
          {loading && (
            <div className="relative text-center text-sm text-gray-600 mt-2 px-8">
              <div className="flex items-center justify-center mb-2">
                <RandomCat size="small" index={currentCatIndex} className="animate-bounce" />
              </div>
              <div className="flex items-center">
                <span className="text-lg mr-2">🐾</span>
                <p className="animate-pulse">Pet Fact: {PET_FACTS[currentFactIndex]}</p>
                <span className="text-lg ml-2">🐾</span>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
