"use client";

import { HomeIcon, ImageIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function HomePageLink() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isGalleryPage = pathname === "/gallery";

  return (
    <div className="flex items-center gap-4">
      {!isHomePage && (
        <Link href="/" className="text-gray-600 hover:text-gray-900">
          <HomeIcon className="h-5 w-5" />
        </Link>
      )}
      {!isGalleryPage && (
        <Link
          href="/gallery"
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <ImageIcon className="h-5 w-5" />
          <span className="text-sm font-medium">Gallery</span>
        </Link>
      )}
    </div>
  );
}
