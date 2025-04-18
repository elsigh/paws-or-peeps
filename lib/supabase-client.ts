import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from '@supabase/supabase-js';

// biome-ignore lint/style/noNonNullAssertion: <explanation>
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// biome-ignore lint/style/noNonNullAssertion: <explanation>
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let supabase: SupabaseClient;

export function createClient() {
  if (supabase) {
    return supabase;
  }
  supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return supabase;
}
