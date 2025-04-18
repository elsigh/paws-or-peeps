import type { Notification } from "./types";
import supabase from "./supabase-client";

// Get all notifications for the current user
export async function getUserNotifications(userId: string): Promise<Notification[]> {
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

// Mark a notification as read
export async function markNotificationAsRead(notificationId: string): Promise<void> {
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
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
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
export async function getUnreadNotificationCount(userId: string): Promise<number> {
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