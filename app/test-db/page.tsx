import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase-server";
import type { Session } from "@supabase/supabase-js";
import { AlertCircle, CheckCircle } from "lucide-react";
import { ClientTest } from "./client-test";

export default async function TestDbPage() {
  let connectionStatus = "Unknown";
  let connectionError = null;
  let tableStatus = "Unknown";
  let tableError = null;
  let recentImages: { id: number; original_url: string; created_at: string }[] =
    [];
  let serverSession: Session | null = null;

  try {
    // Test database connection
    const supabase = await createClient();
    if (!supabase) {
      connectionStatus = "Failed";
      connectionError = "Failed to create Supabase client";
    } else {
      console.debug("supabase:", supabase);
      try {
        // Get server session
        const {
          data: { session },
        } = await supabase.auth.getSession();
        serverSession = session;
        console.debug("serverSession:", serverSession);
        // Test simple query
        const { error } = await supabase
          .from("images")
          .select("count(*)", { count: "exact", head: true });

        if (error) {
          connectionStatus = "Failed";
          connectionError = error.message;
        } else {
          connectionStatus = "Success";
        }
      } catch (error) {
        connectionStatus = "Failed";
        connectionError =
          error instanceof Error ? error.message : String(error);
      }
    }

    // Check if tables exist
    if (connectionStatus === "Success") {
      try {
        const { error } = await supabase.from("images").select("id").limit(1);

        if (error) {
          tableStatus = "Failed";
          tableError = error.message;
        } else {
          tableStatus = "Success";

          // Get recent images
          const { data: recentData, error: recentError } = await supabase
            .from("images")
            .select("id, original_url, created_at")
            .order("created_at", { ascending: false })
            .limit(5);

          if (!recentError && recentData) {
            // @ts-ignore
            recentImages = recentData;
          }
        }
      } catch (error) {
        tableStatus = "Failed";
        tableError = error instanceof Error ? error.message : String(error);
      }
    }
  } catch (error) {
    connectionStatus = "Failed";
    connectionError = error instanceof Error ? error.message : String(error);
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Database Test Page</h1>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Server-Side Tests</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Database Connection</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert
                  variant={
                    connectionStatus === "Success" ? "default" : "destructive"
                  }
                >
                  {connectionStatus === "Success" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>
                    {connectionStatus === "Success"
                      ? "Connected"
                      : "Connection Failed"}
                  </AlertTitle>
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
                <Alert
                  variant={
                    tableStatus === "Success" ? "default" : "destructive"
                  }
                >
                  {tableStatus === "Success" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>
                    {tableStatus === "Success" ? "Tables OK" : "Tables Error"}
                  </AlertTitle>
                  <AlertDescription>
                    {tableStatus === "Success"
                      ? "Required tables exist and are accessible"
                      : `Tables error: ${tableError}`}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Server Session Info</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert variant={serverSession ? "default" : "destructive"}>
                {serverSession ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertTitle>
                  {serverSession ? "Session Active" : "No Session"}
                </AlertTitle>
                <AlertDescription>
                  {serverSession
                    ? `User ID: ${serverSession.user.id}`
                    : "No active session found"}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

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
                        <strong>Created:</strong>{" "}
                        {new Date(image.created_at).toLocaleString()}
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

        <div>
          <h2 className="text-xl font-semibold mb-4">Client-Side Tests</h2>
          <ClientTest />
        </div>
      </div>
    </div>
  );
}
