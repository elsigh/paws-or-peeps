"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Toaster, toast } from "sonner";

export function GalleryWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("deleted")) {
      toast.success("Image successfully deleted");

      // Remove the deleted param by soft navigating to /gallery
      router.replace("/gallery");
    }
  }, [searchParams, router]);

  return (
    <>
      <Toaster />
      {children}
    </>
  );
}
