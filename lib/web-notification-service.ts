// Web notification service for browser notifications
import {
  getLastNotifiedId,
  updateLastNotifiedId,
} from "./notification-service-client";

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    console.log("This browser does not support web notifications");
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return false;
  }
}

export async function showWebNotification(
  userId: string,
  notificationId: string,
  title: string,
  options?: NotificationOptions,
) {
  const hasNotificationCapability = "Notification" in window;
  const hasPermission = Notification.permission === "granted";

  if (!hasNotificationCapability) {
    console.debug("showWebNotification: No notification capability");
    return;
  }
  if (!hasPermission) {
    console.debug("showWebNotification: No permission");
    return;
  }

  // Check if we've already shown a notification for this ID
  const lastNotifiedId = await getLastNotifiedId(userId);
  if (lastNotifiedId && lastNotifiedId === notificationId) {
    console.debug(
      "showWebNotification: Already shown this notification",
      notificationId,
    );
    return;
  }

  if (Notification.permission === "granted") {
    try {
      new Notification(title, options);
      // Update the last notified ID
      await updateLastNotifiedId(userId, notificationId);
    } catch (error) {
      console.error("Error showing notification:", error);
    }
  }
}

// Function to check if notifications are supported and permission is granted
export function canShowNotifications(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    Notification.permission === "granted"
  );
}
