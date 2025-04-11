import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // For API routes that handle file uploads
  if (request.nextUrl.pathname.startsWith("/api/process-image")) {
    // Check content length header
    const contentLength = request.headers.get("content-length")
    if (contentLength && Number.parseInt(contentLength) > 4 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds the 4MB limit" }, { status: 413 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/api/process-image",
}
