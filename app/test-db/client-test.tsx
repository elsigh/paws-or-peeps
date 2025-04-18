"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase-client";
import type { Session } from "@supabase/supabase-js";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

export function ClientTest() {
  const [connectionStatus, setConnectionStatus] = useState("Unknown");
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [tableStatus, setTableStatus] = useState("Unknown");
  const [tableError, setTableError] = useState<string | null>(null);
  const [recentImages, setRecentImages] = useState<
    { id: number; original_url: string; created_at: string }[]
  >([]);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test database connection
        const supabase = createClient();
        if (!supabase) {
          setConnectionStatus("Failed");
          setConnectionError("Failed to create Supabase client");
          return;
        }

        // Get current session
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setSession(session);

        try {
          // Test simple query
          const { error } = await supabase
            .from("images")
            .select("count(*)", { count: "exact", head: true });

          if (error) {
            setConnectionStatus("Failed");
            setConnectionError(error.message);
          } else {
            setConnectionStatus("Success");
          }
        } catch (error) {
          setConnectionStatus("Failed");
          setConnectionError(
            error instanceof Error ? error.message : String(error),
          );
        }

        // Check if tables exist
        if (connectionStatus === "Success") {
          try {
            const { error } = await supabase
              .from("images")
              .select("id")
              .limit(1);

            if (error) {
              setTableStatus("Failed");
              setTableError(error.message);
            } else {
              setTableStatus("Success");

              // Get recent images
              const { data: recentData, error: recentError } = await supabase
                .from("images")
                .select("id, original_url, created_at")
                .order("created_at", { ascending: false })
                .limit(5);

              if (!recentError && recentData) {
                setRecentImages(recentData);
              }
            }
          } catch (error) {
            setTableStatus("Failed");
            setTableError(
              error instanceof Error ? error.message : String(error),
            );
          }
        }
      } catch (error) {
        setConnectionStatus("Failed");
        setConnectionError(
          error instanceof Error ? error.message : String(error),
        );
      }
    };

    testConnection();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Client-Side Database Connection</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert
            variant={connectionStatus === "Success" ? "default" : "destructive"}
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
          <CardTitle>Client-Side Tables Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert
            variant={tableStatus === "Success" ? "default" : "destructive"}
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

      <Card>
        <CardHeader>
          <CardTitle>Client-Side Session Info</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant={session ? "default" : "destructive"}>
            {session ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>{session ? "Session Active" : "No Session"}</AlertTitle>
            <AlertDescription>
              {session
                ? `User ID: ${session.user.id}`
                : "No active session found"}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {recentImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Client-Side Recent Images</CardTitle>
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
  );
}
