import { Suspense } from "react";
import { createServerClient } from "@/lib/supabase-server";
import { getUserAnalytics } from "@/lib/notification-service";
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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { redirect } from "next/navigation";
import { format } from "date-fns";

async function AnalyticsContent() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Redirect to login or show an error if user is not logged in
    // For now, let's redirect to the home page, but a login page might be better
    redirect("/");
  }

  const analytics = await getUserAnalytics(user.id);

  if (!analytics) {
    return <p>Could not load analytics data.</p>;
  }

  const { summary, details, trends } = analytics;

  const chartConfig = {
    animal: { label: "Animal Votes", color: "hsl(var(--chart-1))" },
    human: { label: "Human Votes", color: "hsl(var(--chart-2))" },
  };

  const formattedTrends = trends.map((trend) => ({
    ...trend,
    date: format(new Date(trend.date), "MMM d"), // Format date for display
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
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart accessibilityLayer data={formattedTrends}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="animal" fill="var(--color-animal)" radius={4} />
                <Bar dataKey="human" fill="var(--color-human)" radius={4} />
              </BarChart>
            </ChartContainer>
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
                <TableHead>Uploaded On</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Animal Votes</TableHead>
                <TableHead className="text-right">Human Votes</TableHead>
                <TableHead className="text-right">Total Votes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {details.length > 0 ? (
                details.map((detail) => (
                  <TableRow key={detail.id}>
                    <TableCell>
                      {format(new Date(detail.created_at), "PP")}
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
