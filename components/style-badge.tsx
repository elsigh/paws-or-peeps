import { Badge } from "@/components/ui/badge";
import type { TransformationStyle } from "@/lib/image-processing";

export function StyleBadge({ style }: { style: TransformationStyle }) {
  return (
    <Badge
      variant={style === "CHARMING" ? "default" : "secondary"}
      className={`
        ${style === "CHARMING" ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-800"}
        font-medium
      `}
    >
      {style === "CHARMING" ? "Delightful" : "Realistic"}
    </Badge>
  );
}
