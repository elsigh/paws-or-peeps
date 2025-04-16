import { cn } from "@/lib/utils";

interface CatLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function CatLogo({ className, size = "md" }: CatLogoProps) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl md:text-3xl",
    lg: "text-3xl md:text-5xl",
  };

  return (
    <div
      className={cn(
        "relative inline-block font-bold",
        sizeClasses[size],
        className
      )}
    >
      {/* Logo text */}
      <span className="relative z-10">
        <span className="text-black">🐾 Paws</span>
        <span className="text-gray-500">Or</span>
        <span className="text-rose-500">Peeps 💁</span>
      </span>
    </div>
  );
}
