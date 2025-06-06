// filepath: /Users/elsigh/src/elsigh/paws-or-peeps/lib/notification-service.ts
import { createClient } from "./supabase-server";
import type { UserAnalytics, Vote } from "./types";

export interface Notification {
  id: number;
  user_id: string;
  type: string;
  message: string;
  read: boolean;
  created_at: string;
  image_id?: string;
}

// Get all notifications for the current user
export async function getUserNotifications(): Promise<Notification[]> {
  try {
    const supabase = await createClient();
    if (!supabase) {
      throw new Error("Failed to create Supabase client");
    }

    const { data: session } = await supabase.auth.getSession();
    if (!session.session?.user?.id) {
      return [];
    }

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", session.session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching notifications:", error);
      throw new Error(`Failed to fetch notifications: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error("Error in getUserNotifications:", error);
    return [];
  }
}

// Mark a notification as read
export async function markNotificationAsRead(
  notificationId: number,
): Promise<boolean> {
  try {
    const supabase = await createClient();
    if (!supabase) {
      throw new Error("Failed to create Supabase client");
    }

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId);

    if (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in markNotificationAsRead:", error);
    return false;
  }
}

// Mark all notifications as read for the current user
export async function markAllNotificationsAsRead(): Promise<boolean> {
  try {
    const supabase = await createClient();
    if (!supabase) {
      throw new Error("Failed to create Supabase client");
    }

    const { data: session } = await supabase.auth.getSession();
    if (!session.session?.user?.id) {
      return false;
    }

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", session.session.user.id)
      .eq("read", false);

    if (error) {
      console.error("Error marking all notifications as read:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in markAllNotificationsAsRead:", error);
    return false;
  }
}

// Get unread notification count for the current user
export async function getUnreadNotificationCount(): Promise<number> {
  try {
    const supabase = await createClient();
    if (!supabase) {
      throw new Error("Failed to create Supabase client");
    }

    const { data: session } = await supabase.auth.getSession();
    if (!session.session?.user?.id) {
      return 0;
    }

    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", session.session.user.id)
      .eq("read", false);

    if (error) {
      console.error("Error getting unread notification count:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Error in getUnreadNotificationCount:", error);
    return 0;
  }
}

// Get user analytics data
export async function getUserAnalytics(): Promise<UserAnalytics> {
  try {
    const supabase = await createClient();
    if (!supabase) {
      throw new Error("Failed to create Supabase client");
    }

    const { data: session } = await supabase.auth.getSession();
    if (!session.session?.user?.id) {
      throw new Error("User is not authenticated");
    }

    // Get all images uploaded by the user
    const { data: images, error: imagesError } = await supabase
      .from("images")
      .select("id, created_at, image_type, target_animal_type, private")
      .eq("user_id", session.session.user.id);

    if (imagesError) {
      console.error("Error fetching user images:", imagesError);
      throw new Error(`Failed to fetch user images: ${imagesError.message}`);
    }

    // Get all votes for the user's images
    const imageIds = images?.map((image) => image.id) || [];
    let votes: Vote[] = [];

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
            humanPercentage:
              totalVotes > 0 ? (humanVotes / totalVotes) * 100 : 0,
          },
        };
      }) || [];

    // Calculate total stats
    const totalUploads = imagesWithVotes.length;
    const totalVotes = votes.length;
    const totalAnimalVotes = votes.filter(
      (vote) => vote.vote === "animal",
    ).length;
    const totalHumanVotes = votes.filter(
      (vote) => vote.vote === "human",
    ).length;

    // Group by date for trend analysis
    const votesByDate = votes.reduce<
      Record<string, { animal: number; human: number; total: number }>
    >((acc, vote) => {
      const date = new Date(vote.created_at).toISOString().split("T")[0];
      if (!acc[date]) acc[date] = { animal: 0, human: 0, total: 0 };

      acc[date][vote.vote]++;
      acc[date].total++;

      return acc;
    }, {});

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
  } catch (error) {
    console.error("Error in getUserAnalytics:", error);
    throw error;
  }
}
