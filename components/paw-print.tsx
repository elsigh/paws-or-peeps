import { cn } from "@/lib/utils"

interface PawPrintProps {
  className?: string
  size?: "sm" | "md" | "lg"
  color?: string
  rotation?: number
}

export function PawPrint({ className, size = "md", color = "text-gray-300", rotation = 0 }: PawPrintProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  }

  return (
    <div
      className={cn("relative", sizeClasses[size], color, className)}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {/* Main pad */}
      <div className="absolute bottom-0 left-1/2 h-1/2 w-1/2 -translate-x-1/2 rounded-b-full bg-current"></div>

      {/* Toe beans */}
      <div className="absolute left-0 top-0 h-2/5 w-2/5 rounded-full bg-current"></div>
      <div className="absolute right-0 top-0 h-2/5 w-2/5 rounded-full bg-current"></div>
      <div className="absolute bottom-1/3 left-0 h-2/5 w-2/5 rounded-full bg-current"></div>
      <div className="absolute bottom-1/3 right-0 h-2/5 w-2/5 rounded-full bg-current"></div>
    </div>
  )
}
