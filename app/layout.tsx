import "./globals.css";

import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { VisitorIdProvider } from "@/lib/visitor-id-context";
import getVisitorId from "@/lib/get-visitor-id";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title:
    "🐾 Paws or Peeps 💁 - Transform Animals to Humans and Humans to Animals",
  description:
    "Upload a photo of a cat or human and see the magical transformation!",
  generator: "v0.dev",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const visitorId = await getVisitorId();

  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-gradient-to-b from-white to-rose-50`}
      >
        <VisitorIdProvider visitorId={visitorId}>
          <main className="min-h-screen bg-[url('/placeholder.svg?key=epxw1')] bg-repeat bg-opacity-5">
            {children}
          </main>
        </VisitorIdProvider>
      </body>
    </html>
  );
}
