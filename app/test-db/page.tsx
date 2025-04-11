import { createServerClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

export default async function TestDbPage() {
  let connectionStatus = "Unknown"
  let connectionError = null
  let tableStatus = "Unknown"
  let tableError = null
  let recentImages = []

  try {
    // Test database connection
    const supabase = createServerClient()
    if (!supabase) {
      connectionStatus = "Failed"
      connectionError = "Failed to create Supabase client"
    } else {
      try {
        // Test simple query
        const { data, error } = await supabase.from("images").select("count(*)", { count: "exact", head: true })

        if (error) {
          connectionStatus = "Failed"
          connectionError = error.message
        } else {
          connectionStatus = "Success"
        }
      } catch (error) {
        connectionStatus = "Failed"
        connectionError = error instanceof Error ? error.message : String(error)
      }
    }

    // Check if tables exist
    if (connectionStatus === "Success") {
      try {
        const { data, error } = await supabase.from("images").select("id").limit(1)

        if (error) {
          tableStatus = "Failed"
          tableError = error.message
        } else {
          tableStatus = "Success"

          // Get recent images
          const { data: recentData, error: recentError } = await supabase
            .from("images")
            .select("id, original_url, created_at")
            .order("created_at", { ascending: false })
            .limit(5)

          if (!recentError && recentData) {
            recentImages = recentData
          }
        }
      } catch (error) {
        tableStatus = "Failed"
        tableError = error instanceof Error ? error.message : String(error)
      }
    }
  } catch (error) {
    connectionStatus = "Failed"
    connectionError = error instanceof Error ? error.message : String(error)
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Database Test Page</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Database Connection</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant={connectionStatus === "Success" ? "default" : "destructive"}>
              {connectionStatus === "Success" ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>{connectionStatus === "Success" ? "Connected" : "Connection Failed"}</AlertTitle>
              <AlertDescription>
                {connectionStatus === "Success"
                  ? "Successfully connected to the database"
                  : `Connection error: ${connectionError}`}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tables Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant={tableStatus === "Success" ? "default" : "destructive"}>
              {tableStatus === "Success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{tableStatus === "Success" ? "Tables OK" : "Tables Error"}</AlertTitle>
              <AlertDescription>
                {tableStatus === "Success" ? "Required tables exist and are accessible" : `Tables error: ${tableError}`}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      {recentImages.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentImages.map((image) => (
                <div key={image.id} className="border p-4 rounded-md">
                  <p>
                    <strong>ID:</strong> {image.id}
                  </p>
                  <p>
                    <strong>Created:</strong> {new Date(image.created_at).toLocaleString()}
                  </p>
                  <p className="truncate">
                    <strong>URL:</strong> {image.original_url}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
