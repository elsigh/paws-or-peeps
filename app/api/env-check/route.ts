import { NextResponse } from "next/server"
import { getEnvironmentStatus } from "@/lib/env-checker"

export async function GET() {
  const envStatus = getEnvironmentStatus()

  return NextResponse.json(envStatus)
}
