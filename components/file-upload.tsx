"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Upload, ImageIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CatButton } from "@/components/cat-button"
import { PawPrint } from "@/components/paw-print"
import { RandomCat } from "@/components/random-cat"

// Cat facts about similarities and differences between cats and humans
const CAT_FACTS = [
  "Cats and humans both have a similar brain structure responsible for emotions.",
  "Cats sleep twice as much as humans do on average.",
  "Both cats and humans have dominant hands (or paws).",
  "A cat's brain is 90% similar to a human's brain.",
  "Cats can't taste sweetness, unlike humans.",
  "Both cats and humans have a similar range of hearing.",
  "Cats have 230 bones, while humans have 206.",
  "Cats and humans both dream during sleep.",
  "A cat's heart beats twice as fast as a human heart.",
  "Cats have better night vision than humans.",
  "Both cats and humans have a similar social structure in groups.",
  "Cats have 30 teeth, while adult humans have 32.",
  "Cats can jump 6 times their length, humans can't even jump their own height.",
  "Both cats and humans use facial expressions to communicate.",
  "Cats have a third eyelid, humans don't.",
  "Cats and humans both have a similar response to catnip... just kidding!",
  "Cats have 24 whiskers, humans have none (usually).",
  "Both cats and humans yawn when tired or stressed.",
  "Cats can rotate their ears 180 degrees, humans can't.",
  "Cats and humans both get hairballs... wait, that's not right.",
]

export default function FileUpload() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [currentFactIndex, setCurrentFactIndex] = useState(0)
  const [currentCatIndex, setCurrentCatIndex] = useState(0)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Cycle through cat facts during loading
  useEffect(() => {
    let factInterval: NodeJS.Timeout | null = null
    let catInterval: NodeJS.Timeout | null = null

    if (loading) {
      factInterval = setInterval(() => {
        setCurrentFactIndex((prevIndex) => (prevIndex + 1) % CAT_FACTS.length)
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

  // Process the file regardless of source (input, paste, or drop)
  const processFile = (selectedFile: File | null) => {
    setFile(selectedFile)
    setError(null)

    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.startsWith("image/")) {
        setError("Please select an image file")
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    } else {
      setPreview(null)
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setError("Please select an image to upload")
      return
    }

    setLoading(true)
    setError(null)
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

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to process image")
      }

      if (data.error) {
        setError(data.error)
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
                </div>
              ) : (
                <>
                  <ImageIcon className="h-12 w-12 text-rose-300 mb-2" />
                  <p className="text-sm font-medium">Click to browse, drag & drop, or paste an image</p>
                  <p className="text-xs text-gray-500 mt-1">Supports: JPG, PNG, GIF, WebP</p>
                </>
              )}
            </div>

            <p className="text-sm text-gray-500">
              Upload a photo of a cat or a human face. AI processing may take up to 30 seconds.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <CatButton type="submit" className="w-full bg-rose-500 hover:bg-rose-600" disabled={loading || !file}>
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Meowifying...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload & Transform
              </span>
            )}
          </CatButton>

          {/* Cat facts during loading with cycling cat images */}
          {loading && (
            <div className="relative text-center text-sm text-gray-600 mt-2 px-8">
              <div className="flex items-center justify-center mb-2">
                <RandomCat size="small" index={currentCatIndex} className="animate-bounce" />
              </div>
              <div className="flex items-center">
                <span className="text-lg mr-2">🐾</span>
                <p className="animate-pulse">Cat Fact: {CAT_FACTS[currentFactIndex]}</p>
                <span className="text-lg ml-2">🐾</span>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
