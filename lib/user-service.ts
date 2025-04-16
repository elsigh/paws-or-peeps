import { createClient } from "@/lib/supabase-client";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  email: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
}

// Create a separate admin client with service role key
function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase service role credentials");
    return null;
  }

  return createAdminClient(supabaseUrl, supabaseServiceKey);
}

export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  // Use service role client for admin operations
  const adminClient = createServiceRoleClient();
  if (!adminClient) return null;

  try {
    const { data, error } = await adminClient.auth.admin.getUserById(userId);
    const { user } = data;

    if (error) {
      console.error("Error fetching user:", error);
      return null;
    }

    if (!user) return null;
    console.log("User data:", user);

    return {
      id: user.id,
      email: user.email || null,
      display_name:
        user.user_metadata?.display_name || user.user_metadata?.full_name,
      avatar_url: user.user_metadata?.avatar_url,
    };
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    return null;
  }
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  return {
    id: user.id,
    email: user.email || null,
    display_name:
      user.user_metadata?.display_name || user.user_metadata?.full_name,
    avatar_url: user.user_metadata?.avatar_url,
  };
}
