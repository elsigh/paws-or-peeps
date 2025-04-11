"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function SimpleTestPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
    setError(null)
    setResult(null)
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

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

      const response = await fetch("/api/simple-upload", {
        method: "POST",
        body: formData,
      })

      console.log("Response received:", response.status, response.statusText)

      const data = await response.json()
      console.log("Response data:", data)

      setResult(data)

      if (!response.ok) {
        setError(data.error || "Upload failed")
      }
    } catch (err) {
      console.error("Error in handleUpload:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Simple Upload Test</h1>

      <Card>
        <CardHeader>
          <CardTitle>Test Basic File Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Input type="file" onChange={handleFileChange} ref={fileInputRef} />
              <p className="text-sm text-gray-500 mt-1">Select any image file</p>
            </div>

            <Button onClick={handleUpload} disabled={!file || loading} className="w-full">
              {loading ? "Uploading..." : "Test Simple Upload"}
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result && (
              <Alert variant={result.success ? "default" : "destructive"}>
                {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
                <AlertDescription>
                  <pre className="mt-2 text-xs whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
