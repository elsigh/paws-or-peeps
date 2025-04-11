import { createClient } from "@supabase/supabase-js"

// Create a single supabase client for the browser
export const createBrowserClient = () => {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase environment variables for browser client")
      return null
    }

    return createClient(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.error("Error creating Supabase browser client:", error)
    return null
  }
}

// Create a server-side supabase client
export const createServerClient = () => {
  try {
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables for server client")
      return null
    }

    return createClient(supabaseUrl, supabaseServiceKey)
  } catch (error) {
    console.error("Error creating Supabase server client:", error)
    return null
  }
}
