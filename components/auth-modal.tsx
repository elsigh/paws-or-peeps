"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase-client";
import type { Provider } from "@supabase/supabase-js";
import Image from "next/image";
import { useState } from "react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode?: "signin" | "signup";
}

export function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  mode = "signin",
}: AuthModalProps & { redirectUrl?: string }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const handleSocialSignIn = async (provider: Provider) => {
    setLoading(true);
    const redirectTo = `${window.location.origin}/auth/callback?next=${window.location.pathname}`;
    console.debug("handleSocialSignIn:", redirectTo);
    try {
      if (!supabase) throw new Error("Supabase client not initialized");

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      });

      if (error) throw error;

      // No need for toast here as we're redirecting to the provider
    } catch (error) {
      toast({
        title: `Error signing in with ${provider}`,
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sign in</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="grid gap-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleSocialSignIn("google")}
              disabled={loading}
            >
              <Image
                src="/images/google-logo.png"
                alt="Google Logo"
                width={20}
                height={20}
              />
              Sign in with Google
            </Button>
            {/*
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleSocialSignIn("github")}
              disabled={true || loading}
            >
              <Github className="mr-2 h-4 w-4" />
              Sign in with Github
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleSocialSignIn("twitter")}
              disabled={true || loading}
            >
              <Image
                src="/images/x-logo.png"
                alt="X Logo"
                width={20}
                height={20}
              />
              Sign in with X
            </Button>
            */}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
