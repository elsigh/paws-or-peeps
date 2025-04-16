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
}

// Update the vote stats interface
export interface VoteStats {
  animalVotes: number;
  humanVotes: number;
  animalPercentage: number;
  humanPercentage: number;
}
