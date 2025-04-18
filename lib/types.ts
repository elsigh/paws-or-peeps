import type { ANIMAL_TYPES } from "./constants";

// Define the ImageData type
export interface ImageData {
  id: string;
  animated_url: string;
  opposite_url: string;
  image_type: "human" | (typeof ANIMAL_TYPES)[number];
  original_url: string;
  uploader_id: string;
  target_animal_type: string;
  created_at: string;
  updated_at?: string;
  hasVotes: boolean;
  isUploader: boolean;
  private: boolean;
}

// Update the vote stats interface
export interface VoteStats {
  animalVotes: number;
  humanVotes: number;
  animalPercentage: number;
  humanPercentage: number;
  totalVotes: number;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  image_id?: string;
}

export interface Settings {
  user_id: string;
  last_notified_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserAnalyticsDetail {
  id: string;
  created_at: string;
  image_type: string;
  target_animal_type: string;
  private: boolean;
  votes: {
    total: number;
    animal: number;
    human: number;
    animalPercentage: number;
    humanPercentage: number;
  };
}

export interface UserAnalytics {
  summary: {
    totalUploads: number;
    totalVotes: number;
    totalAnimalVotes: number;
    totalHumanVotes: number;
    averageVotesPerUpload: number;
  };
  details: Array<UserAnalyticsDetail>;
  trends: Array<{
    date: string;
    animal: number;
    human: number;
    total: number;
  }>;
}

export interface Vote {
  image_id: string;
  vote: "animal" | "human";
  created_at: string;
}
