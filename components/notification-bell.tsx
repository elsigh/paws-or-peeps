// filepath: /Users/elsigh/src/elsigh/paws-or-peeps/components/notification-bell.tsx
"use client";

import { useEffect, useState } from "react";
import { Bell, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
	getUserNotifications,
	markAllNotificationsAsRead,
	markNotificationAsRead,
	getUnreadNotificationCount,
} from "@/lib/notification-service-client";
import type { Notification } from "@/lib/types";
import { showWebNotification } from "@/lib/web-notification-service";

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
			console.debug("NotificationBell fetchNotifications:", {
				notifications,
				count,
			});

			// Check for new unread notifications
			const newUnreadNotifications = notifications.filter(
				(n) =>
					!n.is_read &&
					!notifications.some((oldN) => oldN.id === n.id && oldN.is_read),
			);

			// Show web notification for each new unread notification
			if (newUnreadNotifications.length > 0) {
				for (const notification of newUnreadNotifications) {
					showWebNotification("New Vote!", {
						body: notification.message,
						icon: "/favicon.ico",
					});
				}
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

	const handleMarkAsRead = async (id: number, e: React.MouseEvent) => {
		e.stopPropagation();
		await markNotificationAsRead(id.toString());
		setNotifications(
			notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
		);
	};

	const handleMarkAllAsRead = async () => {
		if (!user?.id) return;
		await markAllNotificationsAsRead(user.id);
		setNotifications(notifications.map((n) => ({ ...n, read: true })));
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
