import { Suspense } from "react";
import { createClient } from "@/lib/supabase-server";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import type { UserAnalyticsDetail } from "@/lib/types";
import { VoteTrendsChart } from "./vote-trends-chart";
import { getAnalyticsData } from "./get-analytics";

async function AnalyticsContent() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		// Redirect to login or show an error if user is not logged in
		// For now, let's redirect to the home page, but a login page might be better
		redirect("/");
	}

	const analytics = await getAnalyticsData();

	if (!analytics) {
		return <p>Could not load analytics data.</p>;
	}

	const { summary, details, trends } = analytics;

	const formattedTrends = trends.map((trend) => ({
		...trend,
		date: format(new Date(trend.date), "MMM d"),
	}));

	return (
		<div className="container mx-auto p-4 md:p-8">
			<h1 className="text-3xl font-bold mb-6">Your Upload Analytics</h1>

			{/* Summary Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
				<Card>
					<CardHeader>
						<CardTitle>Total Uploads</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-4xl font-bold">{summary.totalUploads}</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Total Votes Received</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-4xl font-bold">{summary.totalVotes}</p>
						<p className="text-sm text-muted-foreground">
							{summary.totalAnimalVotes} Animal / {summary.totalHumanVotes}{" "}
							Human
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Avg. Votes per Upload</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-4xl font-bold">
							{summary.averageVotesPerUpload.toFixed(1)}
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Vote Trends Chart */}
			{trends.length > 0 && (
				<Card className="mb-8">
					<CardHeader>
						<CardTitle>Vote Trends Over Time</CardTitle>
						<CardDescription>
							Votes received on your uploads daily
						</CardDescription>
					</CardHeader>
					<CardContent>
						<VoteTrendsChart data={formattedTrends} />
					</CardContent>
				</Card>
			)}

			{/* Detailed Upload Stats Table */}
			<Card>
				<CardHeader>
					<CardTitle>Detailed Upload Statistics</CardTitle>
					<CardDescription>
						Vote breakdown for each of your uploads.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Uploaded</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Target</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="text-right">Animal</TableHead>
								<TableHead className="text-right">Human</TableHead>
								<TableHead className="text-right">Total</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{details.length > 0 ? (
								details.map((detail: UserAnalyticsDetail) => (
									<TableRow key={detail.id}>
										<TableCell>
											<span className="text-nowrap">
												{format(new Date(detail.created_at), "PP")}
											</span>
										</TableCell>
										<TableCell className="capitalize">
											{detail.image_type}
										</TableCell>
										<TableCell className="capitalize">
											{detail.target_animal_type}
										</TableCell>
										<TableCell>
											{detail.private ? "Private" : "Public"}
										</TableCell>
										<TableCell className="text-right">
											{detail.votes.animal} (
											{detail.votes.animalPercentage.toFixed(1)}%)
										</TableCell>
										<TableCell className="text-right">
											{detail.votes.human} (
											{detail.votes.humanPercentage.toFixed(1)}%)
										</TableCell>
										<TableCell className="text-right">
											{detail.votes.total}
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={7} className="text-center">
										No uploads found or no votes received yet.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}

export default function AnalyticsPage() {
	return (
		<Suspense
			fallback={
				<div className="container mx-auto p-8">Loading analytics...</div>
			}
		>
			<AnalyticsContent />
		</Suspense>
	);
}
