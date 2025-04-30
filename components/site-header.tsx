"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ImageIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function HomePageLink() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isGalleryPage = pathname === "/gallery";
  const isResultsPage = pathname.indexOf("/results") === 0;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-4">
        {!isHomePage && (
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                <PlusIcon className="h-5 w-5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent
              className="pointer-events-none select-none hidden md:block"
              side="bottom"
            >
              <span className="block md:hidden">New image</span>
              <span className="hidden md:block">New image</span>
            </TooltipContent>
          </Tooltip>
        )}
        {!isGalleryPage && (
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <Link
                href="/gallery"
                className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
              >
                <ImageIcon className="h-5 w-5" />
                {!isResultsPage && (
                  <span className="text-sm font-medium">Gallery</span>
                )}
              </Link>
            </TooltipTrigger>
            <TooltipContent
              className="pointer-events-none select-none hidden md:block"
              side="bottom"
            >
              <span className="block md:hidden">Gallery</span>
              <span className="hidden md:block">Gallery</span>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
