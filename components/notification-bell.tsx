// filepath: /Users/elsigh/src/elsigh/paws-or-peeps/components/notification-bell.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";
import {
  getUnreadNotificationCount,
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/notification-service-client";
import type { Notification } from "@/lib/types";
import { showWebNotification } from "@/lib/web-notification-service";
import { Bell, BellRing } from "lucide-react";
import { useEffect, useState } from "react";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    const fetchNotifications = async () => {
      const [notifications, count] = await Promise.all([
        getUserNotifications(user.id),
        getUnreadNotificationCount(user.id),
      ]);

      // Get the most recent unread notification
      const mostRecentUnread = notifications.find((n) => !n.is_read);

      // console.debug("NotificationBell fetchNotifications:", {
      //   notifications,
      //   count,
      //   mostRecentUnread,
      // });

      // Show web notification only for the most recent unread notification
      if (mostRecentUnread) {
        showWebNotification(user.id, mostRecentUnread.id, "New Vote!", {
          body: mostRecentUnread.message,
          icon: "/favicon.ico",
        });
      }

      setNotifications(notifications);
      setUnreadCount(count);
    };

    // Initial fetch
    fetchNotifications();

    // Set up polling interval
    const intervalId = setInterval(fetchNotifications, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [user?.id]);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await markNotificationAsRead(id);
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
  };

  const handleMarkAllAsRead = async () => {
    console.debug("NotificationBell handleMarkAllAsRead", { user });
    if (!user?.id) return;
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    await markAllNotificationsAsRead(user.id);
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative focus-visible:ring-0"
        >
          {unreadCount > 0 ? (
            <BellRing className="h-6 w-6 text-yellow-500" />
          ) : (
            <Bell className="h-6 w-6" />
          )}
          {unreadCount > 0 && (
            <span
              className="absolute
						 right-1 top-1 h-2 w-2 rounded-full bg-blue-500"
            />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-2">
          <span className="text-sm font-medium">Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs"
            >
              Mark all as read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className="flex flex-col items-start gap-1"
              onClick={(e) => handleMarkAsRead(notification.id, e)}
            >
              <div className="flex w-full items-center justify-between">
                <span className="font-medium">{notification.type}</span>
                {!notification.is_read && (
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {notification.message}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(notification.created_at).toLocaleString()}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
