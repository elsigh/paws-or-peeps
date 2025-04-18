"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase-client";
import type { Settings } from "@/lib/types";
import { showWebNotification } from "@/lib/web-notification-service";
import { useEffect, useState } from "react";

export default function TestNotificationsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user?.id) return;

      const supabase = createClient();
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setSettings(data);
      }
    };

    fetchSettings();
  }, [user?.id]);

  const handleTestNotification = async () => {
    if (!user?.id) {
      alert("Please log in to test notifications");
      return;
    }

    // Create a test notification in the database
    const supabase = createClient();
    const { data: notification, error } = await supabase
      .from("notifications")
      .insert({
        user_id: user.id,
        type: "test",
        message: "This is a test notification.",
        is_read: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating test notification:", error);
      return;
    }

    // Show the web notification
    await showWebNotification(user.id, notification.id, "Test Notification", {
      body: "This is a test notification to verify the web notification functionality is working correctly.",
      icon: "/favicon.ico",
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Test Notifications</h1>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>User Settings</CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-2">
                <p>
                  <strong>User ID:</strong> {user.id}
                </p>
                {settings && (
                  <>
                    <p>
                      <strong>Last Notified ID:</strong>{" "}
                      {settings.last_notified_id || "None"}
                    </p>
                    <p>
                      <strong>Settings Created:</strong>{" "}
                      {new Date(settings.created_at).toLocaleString()}
                    </p>
                    <p>
                      <strong>Settings Updated:</strong>{" "}
                      {new Date(settings.updated_at).toLocaleString()}
                    </p>
                  </>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">
                Please log in to view settings
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Web Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground mb-4">
              Click the button below to test web notifications. This will:
              <ul className="list-disc ml-6 mt-2">
                <li>Create a test notification in the database</li>
                <li>Show a web notification</li>
                <li>Update your last notified ID</li>
              </ul>
            </div>
            <Button onClick={handleTestNotification} disabled={!user}>
              Test Web Notification
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
