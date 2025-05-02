import { Badge } from "@/components/ui/badge";
import { STYLE_EMOJI_MAP } from "@/lib/constants";
import type { TransformationStyle } from "@/lib/types";

export function StyleBadge({ style }: { style: TransformationStyle }) {
  const styleData = STYLE_EMOJI_MAP[style];
  return (
    <Badge className="bg-slate-100 text-slate-800 font-medium">
      {styleData ? (
        <>
          {styleData.emoji} {styleData.label}
        </>
      ) : (
        <>❓ Other</>
      )}
    </Badge>
  );
}
