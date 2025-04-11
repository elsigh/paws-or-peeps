import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  const healthChecks = {
    api: { status: "ok", message: "API is responding" },
    database: { status: "unknown", message: "Not checked yet" },
    blob: { status: "unknown", message: "Not checked yet" },
    replicate: { status: "unknown", message: "Not checked yet" },
  }

  // Check environment variables (don't expose actual values)
  const envStatus = {
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    POSTGRES_URL: !!process.env.POSTGRES_URL,
    POSTGRES_PRISMA_URL: !!process.env.POSTGRES_PRISMA_URL,
    POSTGRES_URL_NON_POOLING: !!process.env.POSTGRES_URL_NON_POOLING,
    POSTGRES_USER: !!process.env.POSTGRES_USER,
    POSTGRES_HOST: !!process.env.POSTGRES_HOST,
    POSTGRES_PASSWORD: !!process.env.POSTGRES_PASSWORD,
    POSTGRES_DATABASE: !!process.env.POSTGRES_DATABASE,
    BLOB_READ_WRITE_TOKEN: !!process.env.BLOB_READ_WRITE_TOKEN,
    REPLICATE_API_TOKEN: !!process.env.REPLICATE_API_TOKEN,
  }

  // Check database connection
  try {
    console.log("Testing database connection in health check...")
    let supabase

    try {
      supabase = createServerClient()
      if (!supabase) {
        healthChecks.database = {
          status: "error",
          message: "Failed to create Supabase client",
          details: "The createServerClient function returned null or undefined",
        }
      } else {
        console.log("Supabase client created, testing query...")
        try {
          const { data, error } = await supabase.from("images").select("count(*)", { count: "exact", head: true })

          if (error) {
            // Ensure we capture all error properties
            const errorDetails = {
              message: error.message || "No error message provided",
              code: error.code,
              details: error.details,
              hint: error.hint,
              fullError: JSON.stringify(error),
            }

            healthChecks.database = {
              status: "error",
              message: `Database error: ${errorDetails.message}`,
              details: errorDetails,
            }
          } else {
            healthChecks.database = {
              status: "ok",
              message: "Database connection successful",
              data,
            }
          }
        } catch (queryError) {
          // Capture full error details for exceptions
          const errorInfo =
            queryError instanceof Error
              ? {
                  name: queryError.name,
                  message: queryError.message,
                  stack: queryError.stack,
                  toString: queryError.toString(),
                }
              : String(queryError)

          healthChecks.database = {
            status: "error",
            message: `Database query exception: ${queryError instanceof Error ? queryError.message : String(queryError)}`,
            details: errorInfo,
          }
        }
      }
    } catch (clientError) {
      // Capture full error details for client creation exceptions
      const errorInfo =
        clientError instanceof Error
          ? {
              name: clientError.name,
              message: clientError.message,
              stack: clientError.stack,
              toString: clientError.toString(),
            }
          : String(clientError)

      healthChecks.database = {
        status: "error",
        message: `Failed to create Supabase client: ${clientError instanceof Error ? clientError.message : String(clientError)}`,
        details: errorInfo,
      }
    }
  } catch (error) {
    // Capture full error details for outer exceptions
    const errorInfo =
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
            toString: error.toString(),
          }
        : String(error)

    healthChecks.database = {
      status: "error",
      message: `Database connection exception: ${error instanceof Error ? error.message : String(error)}`,
      details: errorInfo,
    }
  }

  // Check Blob storage
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    healthChecks.blob = { status: "error", message: "BLOB_READ_WRITE_TOKEN is not set" }
  } else {
    healthChecks.blob = { status: "ok", message: "Blob token is configured" }
  }

  // Check Replicate API
  if (!process.env.REPLICATE_API_TOKEN) {
    healthChecks.replicate = { status: "error", message: "REPLICATE_API_TOKEN is not set" }
  } else {
    healthChecks.replicate = { status: "ok", message: "Replicate token is configured" }
  }

  // Overall status
  const overallStatus = Object.values(healthChecks).some((check) => check.status === "error") ? "error" : "ok"

  return NextResponse.json({
    status: overallStatus,
    checks: healthChecks,
    environment: envStatus,
    timestamp: new Date().toISOString(),
  })
}
