import { createClient } from "@/lib/supabase-server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  console.debug("Callback route triggered with URL:", requestUrl.toString());
  const code = requestUrl.searchParams.get("code");
  const redirectTo = requestUrl.searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.redirect(
        new URL("/auth-error?error=failed_to_create_client", requestUrl.origin)
      );
    }

    try {
      // @ts-ignore
      await supabase.auth.exchangeCodeForSession(code);
    } catch (error) {
      console.error("Error exchanging code for session:", error);
      return NextResponse.redirect(
        new URL("/auth-error?error=session_exchange_failed", requestUrl.origin)
      );
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL(redirectTo || "/", requestUrl.origin));
}
