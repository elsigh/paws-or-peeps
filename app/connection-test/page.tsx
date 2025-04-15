import { createClient } from "@/lib/supabase-server";
import { checkEnvironmentVariables } from "@/lib/env-checker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Info } from "lucide-react";

export default async function ConnectionTestPage() {
  // Check environment variables
  const { defined, issues } = checkEnvironmentVariables();

  // Test database connection
  let connectionStatus = "Unknown";
  let connectionError = null;
  let connectionDetails = null;

  try {
    console.log("Testing Supabase connection...");
    const supabase = await createClient();

    if (!supabase) {
      connectionStatus = "Failed";
      connectionError = "Failed to create Supabase client";
    } else {
      try {
        // Test simple query
        // @ts-ignore
        const { data, error } = await supabase
          .from("images")
          .select("count(*)", { count: "exact", head: true });

        if (error) {
          connectionStatus = "Failed";
          connectionError = error.message;
          connectionDetails = error;

          // Add more specific diagnostics based on the error
          if (error.message.includes("authentication")) {
            connectionError +=
              " (Authentication error - check your Supabase service role key)";
          } else if (error.message.includes("does not exist")) {
            connectionError +=
              " (Table does not exist - check your database schema)";
          } else if (error.message.includes("permission denied")) {
            connectionError += " (Permission denied - check your RLS policies)";
          }
        } else {
          connectionStatus = "Success";
          connectionDetails = data;
        }
      } catch (error) {
        connectionStatus = "Failed";
        connectionError =
          error instanceof Error ? error.message : String(error);
      }
    }
  } catch (error) {
    connectionStatus = "Failed";
    connectionError = error instanceof Error ? error.message : String(error);
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Supabase Connection Test</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant={issues.length === 0 ? "default" : "destructive"}>
              {issues.length === 0 ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Info className="h-4 w-4" />
              )}
              <AlertTitle>
                {issues.length === 0
                  ? "All Variables Set"
                  : `${issues.length} Issues Found`}
              </AlertTitle>
              <AlertDescription>
                {issues.length === 0 ? (
                  "All required environment variables are defined"
                ) : (
                  <div className="mt-2">
                    <ul className="list-disc pl-4">
                      {issues.map((issue, i) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                        <li key={i}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-4">
                  <h4 className="font-medium mb-2">Variable Status:</h4>
                  <ul className="space-y-1">
                    {Object.entries(defined).map(([key, value]) => (
                      <li key={key} className="flex items-center">
                        {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
                        <span
                          className={`inline-block w-4 h-4 rounded-full mr-2 ${
                            value ? "bg-green-500" : "bg-red-500"
                          }`}
                        ></span>
                        <code className="text-xs">{key}</code>
                      </li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

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

                {connectionDetails && (
                  <details className="mt-2 text-xs">
                    <summary className="cursor-pointer">
                      Technical Details
                    </summary>
                    <pre className="mt-1 whitespace-pre-wrap overflow-auto max-h-40">
                      {JSON.stringify(connectionDetails, null, 2)}
                    </pre>
                  </details>
                )}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">1. Check Environment Variables</h3>
                <p className="text-sm text-gray-600">
                  Make sure all required environment variables are set correctly
                  in your Vercel project settings or .env file.
                </p>
              </div>

              <div>
                <h3 className="font-medium">
                  2. Verify Supabase Service Role Key
                </h3>
                <p className="text-sm text-gray-600">
                  Ensure your SUPABASE_SERVICE_ROLE_KEY is correct and has the
                  necessary permissions.
                </p>
              </div>

              <div>
                <h3 className="font-medium">3. Check Database Schema</h3>
                <p className="text-sm text-gray-600">
                  Verify that the "images" table exists in your Supabase
                  database with the correct schema.
                </p>
              </div>

              <div>
                <h3 className="font-medium">4. Review RLS Policies</h3>
                <p className="text-sm text-gray-600">
                  Check Row Level Security (RLS) policies in Supabase to ensure
                  they're not blocking access.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
