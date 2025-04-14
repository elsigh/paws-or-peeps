import Image from "next/image";
import { cn } from "@/lib/utils";

interface RandomCatProps {
  className?: string;
  size?: "tiny" | "small" | "medium";
  rotate?: number;
  index?: number;
}

export function RandomCat({
  className,
  size = "small",
  rotate = 0,
  index,
}: RandomCatProps) {
  const catImages = [
    "/images/cat-sleeping.png",
    "/images/cat-yawning.png",
    "/images/cat-paw.png",
  ];

  const sizes = {
    tiny: { width: 24, height: 24 },
    small: { width: 48, height: 48 },
    medium: { width: 80, height: 80 },
  };

  // Use provided index or pick a random one
  const imageIndex =
    index !== undefined ? index : Math.floor(Math.random() * catImages.length);
  const { width, height } = sizes[size];

  return (
    <div
      className={cn("relative overflow-hidden rounded-full", className)}
      style={{
        transform: `rotate(${rotate}deg)`,
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      <Image
        src={catImages[imageIndex] || "/placeholder.svg"}
        alt="Cute cat"
        width={width}
        height={height}
        className="object-cover w-full h-full"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
