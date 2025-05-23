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
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth-context";
import {
  getUnreadNotificationCount,
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/notification-service-client";
import type { Notification } from "@/lib/types";
import { showWebNotification } from "@/lib/web-notification-service";
import { Bell, X } from "lucide-react";
import { useEffect, useState } from "react";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isMobile = useIsMobile();
  const isDisabled = !user;

  useEffect(() => {
    if (!user?.id) return;
    const fetchNotifications = async () => {
      const [notifications, count] = await Promise.all([
        getUserNotifications(user.id),
        getUnreadNotificationCount(user.id),
      ]);
      const mostRecentUnread = notifications.find((n) => !n.is_read);
      if (mostRecentUnread) {
        showWebNotification(user.id, mostRecentUnread.id, "New Vote!", {
          body: mostRecentUnread.message,
          icon: "/favicon.ico",
        });
      }
      setNotifications(notifications);
      setUnreadCount(count);
    };
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 30000);
    return () => clearInterval(intervalId);
  }, [user?.id]);

  // Always render the bell, but show skeleton if not signed in
  if (!user) {
    return (
      <span className="relative p-2 rounded-full">
        <span className="block h-6 w-6 animate-pulse">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-6 h-6 text-gray-300 dark:text-gray-700"
          >
            <title>Notifications</title>
            <path
              d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2zm6-6V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2z"
              fill="currentColor"
            />
          </svg>
        </span>
      </span>
    );
  }

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await markNotificationAsRead(id);
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    // Optimistically update UI
    const prevNotifications = [...notifications];
    const prevUnreadCount = unreadCount;
    setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    try {
      await markAllNotificationsAsRead(user.id);
    } catch (err) {
      // Revert UI on error
      setNotifications(prevNotifications);
      setUnreadCount(prevUnreadCount);
      toast({
        title: "Failed to mark all as read",
        description: "Please try again.",
        variant: "destructive",
      });
      throw err;
    }
  };

  // Mobile full-screen overlay
  if (isMobile && isMobileOpen) {
    return (
      <div className="fixed inset-0 z-[200] bg-white dark:bg-black flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <span className="text-lg font-semibold">Notifications</span>
          <button
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close notifications"
            type="button"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className="p-4 border-b flex flex-col gap-1 cursor-pointer"
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
              </div>
            ))
          )}
        </div>
        <div className="p-4 border-t flex justify-end">
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
      </div>
    );
  }

  // Desktop dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`relative p-2 rounded-full transition-colors ${isDisabled ? "opacity-50 pointer-events-none" : "hover:bg-gray-100"}`}
          disabled={isDisabled}
          aria-label="Notifications"
        >
          <Bell className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-blue-500" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 max-h-[50vh] overflow-y-auto"
      >
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
