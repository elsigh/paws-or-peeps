import type { TransformationStyle } from "./types";

// Define the animal types
export const ANIMAL_TYPES = [
  "bird",
  "cat",
  "dog",
  "ferret",
  "fish",
  "goat",
  "guinea pig",
  "hamster",
  "hedgehog",
  "lizard",
  "rabbit",
  "snake",
  "turtle",
] as const;
[];

export const STYLE_EMOJI_MAP: Record<TransformationStyle, string> = {
  CHARMING: "🌟",
  REALISTIC: "📸",
  APOCALYPTIC: "👿",
  CHIBI: "🎎",
};

export const DEFAULT_RESULT_IMG_SRC = "/images/cat-yawning.png";
