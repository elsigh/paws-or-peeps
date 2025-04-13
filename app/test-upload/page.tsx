"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function TestUploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [blobTestResult, setBlobTestResult] = useState<any>(null)
  const [blobTestError, setBlobTestError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
    setError(null)
    setResult(null)
  }

  const handleBlobTest = async () => {
    setBlobTestResult(null)
    setBlobTestError(null)

    try {
      const response = await fetch("/api/blob-test")
      const data = await response.json()

      if (data.status === "error") {
        setBlobTestError(data.message)
      } else {
        setBlobTestResult(data)
      }
    } catch (err) {
      setBlobTestError(err instanceof Error ? err.message : "Unknown error")
    }
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
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/test-upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      setResult(data)

      if (!response.ok) {
        setError(data.error || "Upload failed")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Upload Testing Tool</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Test Direct File Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Input type="file" onChange={handleFileChange} />
                <p className="text-sm text-gray-500 mt-1">Select any file to test the upload functionality</p>
              </div>

              <Button onClick={handleUpload} disabled={!file || loading} className="w-full">
                {loading ? "Uploading..." : "Test Upload"}
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

        <Card>
          <CardHeader>
            <CardTitle>Test Blob Storage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                This will test if Vercel Blob storage is working correctly by uploading a small text file.
              </p>

              <Button onClick={handleBlobTest} className="w-full">
                Test Blob Storage
              </Button>

              {blobTestError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Blob Test Error</AlertTitle>
                  <AlertDescription>{blobTestError}</AlertDescription>
                </Alert>
              )}

              {blobTestResult && (
                <Alert variant="default">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Blob Test Success</AlertTitle>
                  <AlertDescription>
                    <p>Successfully uploaded test file to Blob storage.</p>
                    <p className="mt-1">
                      <a
                        href={blobTestResult.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        View uploaded file
                      </a>
                    </p>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
