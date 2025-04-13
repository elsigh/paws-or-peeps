"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Upload, ImageIcon, FileWarning, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CatButton } from "@/components/cat-button"
import { PawPrint } from "@/components/paw-print"
import { RandomCat } from "@/components/random-cat"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

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
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [systemStatus, setSystemStatus] = useState<"ok" | "warning" | "error" | "unknown">("unknown")
  const [statusChecked, setStatusChecked] = useState(false)
  const [systemStatusDetails, setSystemStatusDetails] = useState<any>(null)
  const [hasRealError, setHasRealError] = useState(false)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check system status on component mount
  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        console.log("Checking system status...")
        const response = await fetch("/api/health")

        if (!response.ok) {
          console.error("Health check returned non-OK status:", response.status)
          setSystemStatus("error")
          setSystemStatusDetails({
            message: `Health API returned status ${response.status}`,
            status: response.status,
          })
          setHasRealError(true)
          setStatusChecked(true)
          return
        }

        const data = await response.json()
        console.log("Health check response:", data)

        setSystemStatus(data.status)

        // Check if there's a real database error with a specific message
        const hasDbError =
          data.checks.database.status === "error" &&
          data.checks.database.message &&
          data.checks.database.message !== "Database error:" &&
          !data.checks.database.message.includes("undefined")

        if (hasDbError) {
          setSystemStatusDetails({
            database: data.checks.database,
            environment: data.environment,
            timestamp: data.timestamp,
          })
          setHasRealError(true)
        } else {
          setHasRealError(false)
        }
      } catch (err) {
        console.error("Error checking system status:", err)
        setSystemStatus("error")

        const errorMessage = err instanceof Error ? err.message : String(err)
        if (errorMessage && errorMessage !== "undefined" && errorMessage !== "[object Object]") {
          setSystemStatusDetails({
            message: errorMessage,
            error: err,
          })
          setHasRealError(true)
        } else {
          setHasRealError(false)
        }
      } finally {
        setStatusChecked(true)
      }
    }

    checkSystemStatus()
  }, [])

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

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 5
        })
      }, 1000)

      return () => {
        if (factInterval) clearInterval(factInterval)
        if (catInterval) clearInterval(catInterval)
        clearInterval(progressInterval)
      }
    } else {
      setUploadProgress(0)
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
    setDebugInfo(null)

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
    setDebugInfo(null)
    setUploadProgress(0)
    // Reset to first fact when starting loading
    setCurrentFactIndex(0)
    setCurrentCatIndex(0)

    try {
      console.log("Creating FormData...")
      const formData = new FormData()
      formData.append("image", file)

      console.log("FormData created, sending request...")
      console.log("File details:", {
        name: file.name,
        type: file.type,
        size: file.size,
      })

      const response = await fetch("/api/process-image", {
        method: "POST",
        body: formData,
      })

      console.log("Response received:", response.status, response.statusText)

      // Check if the response is JSON
      const contentType = response.headers.get("content-type")
      console.log("Response content type:", contentType)

      if (!contentType || !contentType.includes("application/json")) {
        // Handle non-JSON responses
        const text = await response.text()
        console.log("Non-JSON response:", text.substring(0, 200))

        if (text.includes("Request Entity Too Large")) {
          throw new Error("Image is too large. Please use an image smaller than 4MB.")
        } else {
          throw new Error(`Server error: ${text.substring(0, 100)}...`)
        }
      }

      const data = await response.json()
      console.log("Response data:", data)

      // For debugging
      setDebugInfo(data)

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

      // Redirect to the results page if we have an ID
      if (data.id) {
        // Set progress to 100% before redirecting
        setUploadProgress(100)

        // Short delay to show 100% progress
        setTimeout(() => {
          console.log("Redirecting to results page:", `/results/${data.id}`)
          router.push(`/results/${data.id}`)
        }, 500)
      } else {
        setLoading(false)
        setError("No image ID returned from server")
      }
    } catch (err) {
      console.error("Error in handleSubmit:", err)
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
        {/* System status warning - only show if there's a real error with a message */}
        {statusChecked && systemStatus !== "ok" && hasRealError && (
          <Alert variant={systemStatus === "error" ? "destructive" : "warning"} className="mb-4">
            <Info className="h-4 w-4" />
            <AlertTitle>System Status: {systemStatus.toUpperCase()}</AlertTitle>
            <AlertDescription>
              {systemStatus === "error"
                ? "There are issues with the system that may affect functionality. Some features might not work correctly."
                : "The system is running with warnings. Some features might be limited."}

              {systemStatusDetails && (
                <div className="mt-2 text-xs">
                  <details open>
                    <summary className="cursor-pointer font-medium">Technical Details</summary>
                    <div className="mt-1 pl-2 border-l-2 border-gray-200">
                      {systemStatusDetails.message && (
                        <p className="mt-1">
                          <strong>Message:</strong> {systemStatusDetails.message}
                        </p>
                      )}

                      {systemStatusDetails.database && systemStatusDetails.database.message && (
                        <div className="mt-1">
                          <strong>Database:</strong> {systemStatusDetails.database.message || "Unknown error"}
                          {systemStatusDetails.database.details && (
                            <pre className="mt-1 whitespace-pre-wrap overflow-auto max-h-40 bg-gray-100 p-2 rounded text-xs">
                              {JSON.stringify(systemStatusDetails.database.details, null, 2)}
                            </pre>
                          )}
                        </div>
                      )}

                      {systemStatusDetails.environment && (
                        <div className="mt-2">
                          <strong>Environment Variables:</strong>
                          <pre className="mt-1 whitespace-pre-wrap overflow-auto max-h-40 bg-gray-100 p-2 rounded text-xs">
                            {JSON.stringify(systemStatusDetails.environment, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>

                  <div className="mt-2 text-center">
                    <Link href="/supabase-diagnostic" className="text-blue-500 hover:underline">
                      View Full Diagnostic Information
                    </Link>
                  </div>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

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

          {/* Debug info */}
          {debugInfo && (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertTitle>Debug Information</AlertTitle>
              <AlertDescription>
                <pre className="mt-2 text-xs whitespace-pre-wrap overflow-auto max-h-40">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
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

          {/* Upload progress bar */}
          {loading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Upload progress</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2 bg-gray-100" indicatorClassName="bg-rose-500" />
            </div>
          )}

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
