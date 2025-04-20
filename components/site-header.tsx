"use client";

import { ImageIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function HomePageLink() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isGalleryPage = pathname === "/gallery";
  const isResultsPage = pathname.indexOf("/results") === 0;

  return (
    <div className="flex items-center gap-4">
      {!isHomePage && (
        <Link href="/" className="text-gray-600 hover:text-gray-900">
          <PlusIcon className="h-5 w-5" />
        </Link>
      )}
      {!isGalleryPage && (
        <Link
          href="/gallery"
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <ImageIcon className="h-5 w-5" />
          {!isResultsPage && (
            <span className="text-sm font-medium">Gallery</span>
          )}
        </Link>
      )}
    </div>
  );
}
