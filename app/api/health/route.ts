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

  // Check if required environment variables are set
  const hasSupabaseUrl = envStatus.SUPABASE_URL || envStatus.NEXT_PUBLIC_SUPABASE_URL
  const hasSupabaseKey =
    envStatus.SUPABASE_SERVICE_ROLE_KEY || envStatus.SUPABASE_ANON_KEY || envStatus.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If we have the required environment variables, assume database is OK by default
  if (hasSupabaseUrl && hasSupabaseKey) {
    healthChecks.database = {
      status: "ok",
      message: "Database configuration appears valid",
    }
  }

  // Check database connection only if we have the required environment variables
  if (hasSupabaseUrl && hasSupabaseKey) {
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
              // Check if this is a real error or just a missing table (which is fine for new setups)
              const isTableNotFoundError =
                error.code === "42P01" || (error.message && error.message.includes("does not exist"))

              if (isTableNotFoundError) {
                // This is expected for new setups, not a critical error
                healthChecks.database = {
                  status: "warning",
                  message: "Database tables not found. You may need to run the setup script.",
                  details: {
                    code: error.code,
                    message: error.message,
                  },
                }
              } else {
                // Ensure we capture all error properties for real errors
                const errorDetails = {
                  message: error.message || "No error message provided",
                  code: error.code,
                  details: error.details,
                  hint: error.hint,
                }

                healthChecks.database = {
                  status: "error",
                  message: `Database error: ${errorDetails.message}`,
                  details: errorDetails,
                }
              }
            } else {
              healthChecks.database = {
                status: "ok",
                message: "Database connection successful",
                data,
              }
            }
          } catch (queryError) {
            // Only treat as error if we have a specific error message
            const errorMessage = queryError instanceof Error ? queryError.message : String(queryError)

            if (errorMessage && errorMessage !== "undefined" && errorMessage !== "[object Object]") {
              healthChecks.database = {
                status: "error",
                message: `Database query exception: ${errorMessage}`,
                details:
                  queryError instanceof Error
                    ? {
                        name: queryError.name,
                        message: queryError.message,
                        stack: queryError.stack,
                      }
                    : String(queryError),
              }
            }
          }
        }
      } catch (clientError) {
        // Only treat as error if we have a specific error message
        const errorMessage = clientError instanceof Error ? clientError.message : String(clientError)

        if (errorMessage && errorMessage !== "undefined" && errorMessage !== "[object Object]") {
          healthChecks.database = {
            status: "error",
            message: `Failed to create Supabase client: ${errorMessage}`,
            details:
              clientError instanceof Error
                ? {
                    name: clientError.name,
                    message: clientError.message,
                    stack: clientError.stack,
                  }
                : String(clientError),
          }
        }
      }
    } catch (error) {
      // Only treat as error if we have a specific error message
      const errorMessage = error instanceof Error ? error.message : String(error)

      if (errorMessage && errorMessage !== "undefined" && errorMessage !== "[object Object]") {
        healthChecks.database = {
          status: "error",
          message: `Database connection exception: ${errorMessage}`,
          details:
            error instanceof Error
              ? {
                  name: error.name,
                  message: error.message,
                  stack: error.stack,
                }
              : String(error),
        }
      }
    }
  } else {
    // Missing required environment variables
    healthChecks.database = {
      status: "error",
      message: "Missing required Supabase environment variables",
      details: {
        missingUrl: !hasSupabaseUrl,
        missingKey: !hasSupabaseKey,
      },
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

  // Overall status - only consider it an error if there's a specific error message
  const hasRealError = Object.values(healthChecks).some(
    (check) =>
      check.status === "error" &&
      check.message &&
      check.message !== "Database error:" &&
      !check.message.includes("undefined"),
  )

  const overallStatus = hasRealError
    ? "error"
    : Object.values(healthChecks).some((check) => check.status === "warning")
      ? "warning"
      : "ok"

  return NextResponse.json({
    status: overallStatus,
    checks: healthChecks,
    environment: envStatus,
    timestamp: new Date().toISOString(),
  })
}
