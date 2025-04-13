"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Info } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function DatabaseStatus() {
  const [status, setStatus] = useState<"loading" | "ok" | "warning" | "error">("loading")
  const [details, setDetails] = useState<any>(null)
  const [hasErrorMessage, setHasErrorMessage] = useState(false)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch("/api/health")

        if (!response.ok) {
          setStatus("error")
          setDetails({
            message: `Health API returned status ${response.status}`,
            status: response.status,
          })
          setHasErrorMessage(true)
          return
        }

        const data = await response.json()

        // Check if there's an actual error message in the database error
        const hasDbErrorMessage =
          data.checks.database.status === "error" &&
          data.checks.database.message &&
          data.checks.database.message !== "Database error:" &&
          !data.checks.database.message.includes("undefined")

        if (hasDbErrorMessage) {
          setStatus("error")
          setDetails(data.checks.database)
          setHasErrorMessage(true)
        } else if (data.status === "warning") {
          setStatus("warning")
          setDetails(data)
          setHasErrorMessage(!!data.message)
        } else {
          setStatus("ok")
          setDetails(data)
          setHasErrorMessage(false)
        }
      } catch (err) {
        setStatus("error")
        setDetails({
          message: err instanceof Error ? err.message : String(err),
          error: err,
        })
        setHasErrorMessage(true)
      }
    }

    checkStatus()
  }, [])

  if (status === "loading") {
    return (
      <Alert className="bg-gray-100 border-gray-200 mb-4">
        <Info className="h-4 w-4" />
        <AlertTitle>Checking database connection...</AlertTitle>
      </Alert>
    )
  }

  // Don't show anything if everything is OK or if there's no specific error message
  if (status === "ok" || !hasErrorMessage) {
    return null
  }

  return (
    <Alert variant={status === "error" ? "destructive" : "warning"} className="mb-4">
      {status === "error" ? <AlertTriangle className="h-4 w-4" /> : <Info className="h-4 w-4" />}
      <AlertTitle>Database {status === "error" ? "Error" : "Warning"}</AlertTitle>
      <AlertDescription>
        <p>
          {details?.message ||
            (status === "error"
              ? "There was an error connecting to the database."
              : "There are some issues with the database connection.")}
        </p>

        {details && details.details && (
          <details className="mt-2 text-xs">
            <summary className="cursor-pointer font-medium">Technical Details</summary>
            <div className="mt-1 pl-2 border-l-2 border-gray-200">
              <pre className="mt-1 whitespace-pre-wrap overflow-auto max-h-40 bg-gray-100 p-2 rounded text-xs">
                {typeof details.details === "object" ? JSON.stringify(details.details, null, 2) : details.details}
              </pre>
            </div>
          </details>
        )}

        <div className="mt-3">
          <Link href="/supabase-diagnostic">
            <Button size="sm" variant={status === "error" ? "outline" : "secondary"}>
              View Diagnostic Information
            </Button>
          </Link>
        </div>
      </AlertDescription>
    </Alert>
  )
}
