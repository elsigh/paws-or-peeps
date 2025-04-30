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

export const OG_HEADLINE = "Which was the original picture?";

export const STYLE_EMOJI_MAP: Record<
  TransformationStyle,
  { emoji: string; label: string }
> = {
  CHARMING: { emoji: "🌟", label: "Delightful" },
  REALISTIC: { emoji: "📸", label: "Realistic" },
  APOCALYPTIC: { emoji: "👿", label: "Apocalyptic" },
  CHIBI: { emoji: "🎎", label: "Chibi" },
  ANGELIC: { emoji: "👼", label: "Angelic" },
};

export const DEFAULT_RESULT_IMG_SRC = "/images/cat-yawning.png";
