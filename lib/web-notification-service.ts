// Web notification service for browser notifications
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

export function showWebNotification(title: string, options?: NotificationOptions) {
  const hasNotificationCapability = "Notification" in window;
  const hasPermission = Notification.permission === "granted";
  console.debug("showWebNotification:", {title, options, hasNotificationCapability, hasPermission});
  if (!hasNotificationCapability) {
    console.debug("showWebNotification: No notification capability");
    return;
  }
  if (!hasPermission) {
    console.debug("showWebNotification: No permission");
    return;
  }

  if (Notification.permission === "granted") {
    try {
      new Notification(title, options);
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