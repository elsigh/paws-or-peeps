"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Github, Mail } from "lucide-react";
// import { createBrowserClient } from "@supabase/ssr";

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
}: AuthModalProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const handleSocialSignIn = async (provider: "google" | "github") => {
    setLoading(true);

    try {
      if (!supabase) throw new Error("Supabase client not initialized");

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        // options: {
        //   redirectTo: `${window.location.origin}/auth/callback`,
        // },
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
              Continue with Google
            </Button>
            {/* <Button
              variant="outline"
              className="w-full"
              onClick={() => handleSocialSignIn("github")}
              disabled={loading}
            >
              <Github className="mr-2 h-4 w-4" />
              Continue with GitHub
            </Button> */}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
