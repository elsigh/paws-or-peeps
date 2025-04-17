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
  if (!("Notification" in window)) {
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