import { createClient } from "./supabase-server";

// Function to get the authenticated user ID
export default async function getVisitorId() {
  const supabase = await createClient();

  if (!supabase) {
    console.error("Failed to create Supabase client");
    throw new Error("Failed to create Supabase client");
  }

  // Get the current user's session
  const {
    data: { session },
    // @ts-ignore
  } = await supabase.auth.getSession();

  // Return the user ID if authenticated
  if (session?.user?.id) {
    return session.user.id;
  }

  // If no authenticated user, throw an error
  //throw new Error("User must be authenticated");
  return null;
}
