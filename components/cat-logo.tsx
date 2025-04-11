import { cn } from "@/lib/utils"

interface CatLogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function CatLogo({ className, size = "md" }: CatLogoProps) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-5xl",
  }

  return (
    <div className={cn("relative inline-block font-bold", sizeClasses[size], className)}>
      {/* Cat ears */}
      <div className="absolute -top-5 left-1/4 h-6 w-6 rotate-45 rounded-t-full bg-black"></div>
      <div className="absolute -top-5 right-1/4 h-6 w-6 -rotate-45 rounded-t-full bg-black"></div>

      {/* Logo text */}
      <span className="relative z-10">
        <span className="text-black">Paws</span>
        <span className="text-rose-500">OrPeeps</span>
      </span>
    </div>
  )
}
