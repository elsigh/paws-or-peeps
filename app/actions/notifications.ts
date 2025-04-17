"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function markNotificationAsRead(notificationId: number) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId);

  if (error) {
    console.error("Error marking notification as read:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/notifications");
  return { success: true };
}

export async function markAllNotificationsAsRead() {
  const supabase = await createClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", session.user.id)
    .eq("read", false);

  if (error) {
    console.error("Error marking all notifications as read:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/notifications");
  return { success: true };
} 