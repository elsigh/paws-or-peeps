import { createClient } from "@/lib/supabase-server";
import type { UserAnalytics } from "@/lib/types";

export async function getAnalyticsData(): Promise<UserAnalytics> {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user?.id) {
    throw new Error("User is not authenticated");
  }

  // Get all images uploaded by the user
  const { data: images, error: imagesError } = await supabase
    .from("images")
    .select("id, created_at, image_type, target_animal_type, private")
    .eq("user_id", session.user.id);

  if (imagesError) {
    console.error("Error fetching user images:", imagesError);
    throw new Error(`Failed to fetch user images: ${imagesError.message}`);
  }

  // Get all votes for the user's images
  const imageIds = images?.map((image) => image.id) || [];
  let votes: Array<{
    image_id: string;
    vote: "animal" | "human";
    created_at: string;
  }> = [];

  if (imageIds.length > 0) {
    const { data: votesData, error: votesError } = await supabase
      .from("votes")
      .select("image_id, vote, created_at")
      .in("image_id", imageIds);

    if (votesError) {
      console.error("Error fetching votes:", votesError);
    } else {
      votes = votesData || [];
    }
  }

  // Process the data to create analytics
  const imagesWithVotes =
    images?.map((image) => {
      const imageVotes = votes.filter((vote) => vote.image_id === image.id);
      const animalVotes = imageVotes.filter(
        (vote) => vote.vote === "animal",
      ).length;
      const humanVotes = imageVotes.filter(
        (vote) => vote.vote === "human",
      ).length;
      const totalVotes = animalVotes + humanVotes;

      return {
        ...image,
        votes: {
          total: totalVotes,
          animal: animalVotes,
          human: humanVotes,
          animalPercentage:
            totalVotes > 0 ? (animalVotes / totalVotes) * 100 : 0,
          humanPercentage: totalVotes > 0 ? (humanVotes / totalVotes) * 100 : 0,
        },
      };
    }) || [];

  // Calculate total stats
  const totalUploads = imagesWithVotes.length;
  const totalVotes = votes.length;
  const totalAnimalVotes = votes.filter(
    (vote) => vote.vote === "animal",
  ).length;
  const totalHumanVotes = votes.filter((vote) => vote.vote === "human").length;

  // Group by date for trend analysis
  const votesByDate = votes.reduce(
    (acc, vote) => {
      const date = new Date(vote.created_at).toISOString().split("T")[0];
      if (!acc[date]) acc[date] = { animal: 0, human: 0, total: 0 };

      acc[date][vote.vote]++;
      acc[date].total++;

      return acc;
    },
    {} as Record<string, { animal: number; human: number; total: number }>,
  );

  // Convert to array for easier consumption in frontend
  const voteTrends = Object.entries(votesByDate)
    .map(([date, counts]) => ({
      date,
      ...counts,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    summary: {
      totalUploads,
      totalVotes,
      totalAnimalVotes,
      totalHumanVotes,
      averageVotesPerUpload: totalUploads > 0 ? totalVotes / totalUploads : 0,
    },
    details: imagesWithVotes,
    trends: voteTrends,
  };
}
