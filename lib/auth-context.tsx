"use client";

import { AuthModal } from "@/components/auth-modal";
import { createClient } from "@/lib/supabase-client";
import type { User } from "@supabase/supabase-js";
import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  requireAuth: (callback: () => void) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signOut: async () => {},
  requireAuth: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(
    null,
  );

  useEffect(() => {
    const getUser = async () => {
      try {
        const supabase = createClient();
        // Get current session
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user || null);

        // Listen for auth changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user || null);
          if (session?.user && pendingCallback) {
            // Execute the pending action after successful auth
            pendingCallback();
            setPendingCallback(null);
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Error getting auth session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getUser();
  }, [pendingCallback]);

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
  };

  const requireAuth = (callback: () => void) => {
    if (user) {
      // User is already authenticated, proceed with the action
      callback();
    } else {
      // Store the callback and show auth modal
      setPendingCallback(() => callback);
      setShowAuthModal(true);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // The callback will be executed by the auth state change listener
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signOut,
        requireAuth,
      }}
    >
      {children}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
          if (pendingCallback) {
            pendingCallback();
            setPendingCallback(null);
          }
        }}
      />
    </AuthContext.Provider>
  );
}
