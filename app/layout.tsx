import "./globals.css";

import type React from "react";
import { unstable_ViewTransition as ViewTransition } from "react";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import { UserMenu } from "@/components/user-menu";
import { Toaster } from "@/components/ui/toaster";
import { CatLogo } from "@/components/cat-logo";
import { HomeIcon } from "lucide-react";
import { HomePageLink } from "@/components/site-header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title:
    "🐾 Paws or Peeps 💁 - Transform Animals to Humans and Humans to Animals",
  description:
    "Upload a photo of a cat or human and see the magical transformation!",
  generator: "v0.dev",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: { url: "/apple-icon.png" },
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex h-14 items-center justify-between px-4 md:px-6">
                  <div className="flex items-center">
                    <HomePageLink />
                  </div>

                  {/* Centered logo */}
                  <div className="absolute left-1/2 transform -translate-x-1/2">
                    <CatLogo size="sm" />
                  </div>

                  <div className="flex items-center">
                    <UserMenu />
                  </div>
                </div>
              </header>
              <main className="flex-1">{children}</main>
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
