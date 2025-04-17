"use client";

import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface VoteTrendsChartProps {
	data: Array<{
		date: string;
		animal: number;
		human: number;
		total: number;
	}>;
}

export function VoteTrendsChart({ data }: VoteTrendsChartProps) {
	const chartConfig = {
		animal: { label: "Animal Votes", color: "hsl(var(--chart-1))" },
		human: { label: "Human Votes", color: "hsl(var(--chart-2))" },
	};

	return (
		<ChartContainer config={chartConfig} className="h-[300px] w-full">
			<BarChart accessibilityLayer data={data}>
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
	);
}
