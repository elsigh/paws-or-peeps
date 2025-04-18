import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// biome-ignore lint/style/noNonNullAssertion: <explanation>
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// biome-ignore lint/style/noNonNullAssertion: <explanation>
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a single instance of the Supabase client
const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

export default supabase;
