import { cn } from "@/lib/utils";

interface PawPrintProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  color?: string;
  rotation?: number;
}

export function PawPrint({
  className,
  size = "md",
  color = "text-foreground",
  rotation = 0,
}: PawPrintProps) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-5xl",
  };

  return (
    <div
      className={cn(sizeClasses[size], color, className)}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      🐾
    </div>
  );
}
