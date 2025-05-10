"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase-client";
import { BarChart3, Image, LogOut } from "lucide-react";
import { default as NextImage } from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ThemeSelectorInline } from "./theme-selector-inline";

export function UserMenu() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  // Direct Google sign-in
  const handleGoogleSignIn = async () => {
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${window.location.pathname}`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <span>
          <Avatar className="h-8 w-8 border border-gray-200 relative">
            {user ? (
              <AvatarImage
                src={user.user_metadata?.avatar_url || undefined}
                alt={user.user_metadata?.display_name || "Profile"}
              />
            ) : (
              // Skeleton avatar with user icon
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-gray-200 animate-pulse">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5 text-gray-400"
                >
                  <title>User</title>
                  <circle cx="12" cy="8" r="4" fill="currentColor" />
                  <path
                    d="M4 20c0-2.21 3.582-4 8-4s8 1.79 8 4"
                    fill="currentColor"
                  />
                </svg>
              </span>
            )}
            <AvatarFallback>
              {user?.user_metadata?.display_name?.[0] || null}
            </AvatarFallback>
          </Avatar>
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        {user ? (
          <>
            <div className="flex flex-col space-y-1 p-2">
              <p className="text-sm font-medium leading-none">{user.email}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.id.substring(0, 8)}...
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/gallery?filter=mine"
                className="flex w-full cursor-pointer items-center"
              >
                <Image className="mr-2 h-4 w-4" />
                <span>My Submissions</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/analytics"
                className="flex w-full cursor-pointer items-center"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                <span>Analytics</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <div className="px-3 py-2">
              <span className="block text-xs text-muted-foreground mb-1">
                Theme
              </span>
              <ThemeSelectorInline />
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-red-600 focus:text-red-600"
              onClick={signOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem asChild>
            <Button
              onClick={handleGoogleSignIn}
              className="w-full"
              variant="outline"
            >
              <NextImage
                src="/images/google-logo.png"
                alt="Google Logo"
                width={20}
                height={20}
              />
              Sign in with Google
            </Button>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
