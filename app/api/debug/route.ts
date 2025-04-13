import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  // Check environment variables (don't expose actual values)
  const envStatus = {
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    BLOB_READ_WRITE_TOKEN: !!process.env.BLOB_READ_WRITE_TOKEN,
    REPLICATE_API_TOKEN: !!process.env.REPLICATE_API_TOKEN,
  }

  // Test Supabase connection
  let supabaseStatus = "Unknown"
  try {
    const supabase = createServerClient()
    if (!supabase) {
      supabaseStatus = "Failed to create Supabase client"
    } else {
      const { data, error } = await supabase.from("images").select("id").limit(1)
      if (error) {
        supabaseStatus = `Error: ${error.message}`
      } else {
        supabaseStatus = "Connected successfully"
      }
    }
  } catch (error) {
    supabaseStatus = `Exception: ${error instanceof Error ? error.message : String(error)}`
  }

  return NextResponse.json({
    status: "Debug information",
    environment: envStatus,
    supabase: supabaseStatus,
    timestamp: new Date().toISOString(),
  })
}
