import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { requestNotificationPermission } from "@/lib/web-notification-service";

export default function AuthCallback() {
	const router = useRouter();

	useEffect(() => {
		const handleCallback = async () => {
			const supabase = createClient();

			try {
				// Handle the OAuth callback
				const { error } = await supabase.auth.getSession();
				if (error) throw error;

				// Request notification permission after successful login
				await requestNotificationPermission();

				// Redirect to the home page
				router.push("/");
			} catch (error) {
				console.error("Error during auth callback:", error);
				router.push("/error");
			}
		};

		handleCallback();
	}, [router]);

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="text-center">
				<h2 className="text-2xl font-semibold mb-4">Signing you in...</h2>
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto" />
			</div>
		</div>
	);
}
