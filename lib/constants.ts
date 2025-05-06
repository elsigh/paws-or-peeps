import type { TransformationStyle } from "./types";

export const OG_HEADLINE = "Which one came from a real photo?";

export const APP_TITLE_WITH_EMOJI = "🐾 PawsOrPeeps 💁";

export const STYLE_EMOJI_MAP: Record<
  TransformationStyle,
  { emoji: string; label: string }
> = {
  CHARMING: { emoji: "🌟", label: "Delightful" },
  REALISTIC: { emoji: "📸", label: "Realistic" },
  APOCALYPTIC: { emoji: "👿", label: "Demonic" },
  CHIBI: { emoji: "🎎", label: "Chibi" },
  ANGELIC: { emoji: "👼", label: "Angelic" },
  GOTHIC: { emoji: "🦇", label: "Gothic" },
  DECO: { emoji: "🎭", label: "Art Deco" },
  LEGO: { emoji: "🧱", label: "Lego" },
  KOGAL: { emoji: "👗", label: "Kogal" },
};

export const DEFAULT_RESULT_IMG_SRC = "/images/cat-yawning.png";

// Define the animal types
export const ANIMAL_TYPES = [
  "bird",
  "cat",
  "dog",
  "ferret",
  "fish",
  "goat",
  "hamster",
  "hedgehog",
  "lizard",
  "rabbit",
  "snake",
  "turtle",
] as const;
[];

export const ANIMAL_EMOJI_MAP: Record<(typeof ANIMAL_TYPES)[number], string> = {
  bird: "🦜",
  cat: "🐱",
  dog: "🐶",
  ferret: "🦡",
  fish: "🐠",
  goat: "🐐",
  hamster: "🐹",
  hedgehog: "🦔",
  lizard: "🦎",
  rabbit: "🐰",
  snake: "🐍",
  turtle: "🐢",
};
