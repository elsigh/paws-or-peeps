import { Badge } from "@/components/ui/badge";
import { STYLE_EMOJI_MAP } from "@/lib/constants";
import type { TransformationStyle } from "@/lib/types";

export function StyleBadge({ style }: { style: TransformationStyle }) {
  return (
    <Badge className="bg-slate-100 text-slate-800 font-medium">
      {STYLE_EMOJI_MAP[style].emoji} {STYLE_EMOJI_MAP[style].label}
    </Badge>
  );
}
