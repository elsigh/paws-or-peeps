"use client";

import { Button } from "@/components/ui/button";
import { showWebNotification } from "@/lib/web-notification-service";

export default function TestNotificationsPage() {
	const handleTestNotification = () => {
		showWebNotification("Test Notification", {
			body: "This is a test notification to verify the web notification functionality is working correctly.",
			icon: "/favicon.ico",
		});
	};

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">Test Notifications</h1>
			<div className="space-y-4">
				<div className="p-4 border rounded-lg">
					<h2 className="text-xl font-semibold mb-2">Web Notifications</h2>
					<p className="text-muted-foreground mb-4">
						Click the button below to test web notifications. Make sure you have
						granted notification permissions.
					</p>
					<Button onClick={handleTestNotification}>
						Test Web Notification
					</Button>
				</div>
			</div>
		</div>
	);
}
