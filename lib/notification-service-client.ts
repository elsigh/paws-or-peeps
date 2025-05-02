import { createClient } from "./supabase-client";
import type { Notification } from "./types";

// Get all notifications for the current user
export async function getUserNotifications(
  userId: string,
): Promise<Notification[]> {
  const supabase = createClient();
  try {
    const { data: notifications, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }

    return notifications || [];
  } catch (error) {
    console.error("Unexpected error fetching notifications:", error);
    return [];
  }
}

// Get the last notification ID that was sent as a web notification
export async function getLastNotifiedId(
  userId: string,
): Promise<string | null> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("last_notified_id")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error getting last notified ID:", { userId, error });
      return null;
    }

    return data?.last_notified_id || null;
  } catch (error) {
    console.error("Unexpected error getting last notified ID:", error);
    return null;
  }
}

// Update the last notification ID that was sent as a web notification
export async function updateLastNotifiedId(
  userId: string,
  notificationId: string,
): Promise<void> {
  const supabase = createClient();
  try {
    const { error } = await supabase
      .from("profiles")
      .upsert({
        user_id: userId,
        last_notified_id: notificationId,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (error) {
      console.error("Error updating last notified ID:", error);
      throw error;
    }
  } catch (error) {
    console.error("Unexpected error updating last notified ID:", error);
    throw error;
  }
}

// Mark a notification as read
export async function markNotificationAsRead(
  notificationId: string,
): Promise<void> {
  const supabase = createClient();
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    if (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  } catch (error) {
    console.error("Unexpected error marking notification as read:", error);
    throw error;
  }
}

// Mark all notifications as read for the current user
export async function markAllNotificationsAsRead(
  userId: string,
): Promise<void> {
  const supabase = createClient();
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .is("is_read", false);

    if (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  } catch (error) {
    console.error("Unexpected error marking all notifications as read:", error);
    throw error;
  }
}

// Get unread notification count for the current user
export async function getUnreadNotificationCount(
  userId: string,
): Promise<number> {
  const supabase = createClient();
  try {
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("is_read", false);

    if (error) {
      console.error("Error getting unread notification count:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Unexpected error getting unread notification count:", error);
    return 0;
  }
}
