"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { HomeIcon } from "lucide-react";

export function HomePageLink() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <div className="flex items-center">
      {!isHomePage && (
        <Link href="/" className="mr-4 text-gray-600 hover:text-gray-900">
          <HomeIcon className="h-5 w-5" />
        </Link>
      )}
    </div>
  );
}
