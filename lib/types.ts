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
  id: number;
  user_id: string;
  type: string;
  message: string;
  read: boolean;
  created_at: string;
  image_id?: string;
}

export interface UserAnalytics {
  summary: {
    totalUploads: number;
    totalVotes: number;
    totalAnimalVotes: number;
    totalHumanVotes: number;
    averageVotesPerUpload: number;
  };
  details: Array<{
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
  }>;
  trends: Array<{
    date: string;
    animal: number;
    human: number;
    total: number;
  }>;
}
