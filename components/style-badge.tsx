import { Badge } from "@/components/ui/badge";
import { STYLE_EMOJI_MAP } from "@/lib/constants";
import type { TransformationStyle } from "@/lib/types";

export function StyleBadge({ style }: { style: TransformationStyle }) {
  let label = "";
  let badgeClass = "";
  let variant: "default" | "secondary" | "destructive" = "default";
  switch (style) {
    case "CHARMING":
      label = "Delightful";
      badgeClass = "bg-blue-100 text-blue-800";
      variant = "default";
      break;
    case "REALISTIC":
      label = "Realistic";
      badgeClass = "bg-slate-100 text-slate-800";
      variant = "secondary";
      break;
    case "APOCALYPTIC":
      label = "Apocalyptic";
      badgeClass = "bg-red-900 text-red-100";
      variant = "destructive";
      break;
  }
  return (
    <Badge
      variant={variant}
      className={`
        ${badgeClass}
        font-medium
      `}
    >
      {STYLE_EMOJI_MAP[style]} {label}
    </Badge>
  );
}
