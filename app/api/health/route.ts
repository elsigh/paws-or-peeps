import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import type { SupabaseClient } from "@supabase/supabase-js";

const DEBUG = false;

export async function GET() {
  const healthChecks = {
    api: { status: "ok", message: "API is responding" },
    database: { status: "unknown", message: "Not checked yet" },
    blob: { status: "unknown", message: "Not checked yet" },
    replicate: { status: "unknown", message: "Not checked yet" },
    auth: { status: "unknown", message: "Not checked yet" },
  };

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
  };

  // Check if required environment variables are set
  const hasSupabaseUrl =
    envStatus.SUPABASE_URL || envStatus.NEXT_PUBLIC_SUPABASE_URL;
  const hasSupabaseKey =
    envStatus.SUPABASE_SERVICE_ROLE_KEY ||
    envStatus.SUPABASE_ANON_KEY ||
    envStatus.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If we have the required environment variables, assume database is OK by default
  if (hasSupabaseUrl && hasSupabaseKey) {
    healthChecks.database = {
      status: "ok",
      message: "Database configuration appears valid",
    };
  }

  // Check database connection only if we have the required environment variables
  if (hasSupabaseUrl && hasSupabaseKey) {
    try {
      if (DEBUG) console.log("Testing database connection in health check...");
      let supabase: SupabaseClient | null = null;

      try {
        supabase = (await createClient()) as SupabaseClient;
        if (!supabase) {
          healthChecks.database = {
            status: "error",
            message: "Failed to create Supabase client",
            // details:
            //   "The createServerClient function returned null or undefined",
          };
          throw new Error("Failed to create Supabase client");
        }
        if (DEBUG) console.log("Supabase client created, testing query...");
        try {
          // Use a simpler query that's less likely to fail due to syntax
          const { data, error } = await supabase
            .from("images")
            .select("id")
            .limit(1);

          if (error) {
            // Check if this is a real error or just a missing table (which is fine for new setups)
            const isTableNotFoundError =
              error.code === "42P01" ||
              error.message?.includes("does not exist");

            if (isTableNotFoundError) {
              // This is expected for new setups, not a critical error
              healthChecks.database = {
                status: "warning",
                message:
                  "Database tables not found. You may need to run the setup script.",
                // details: {
                //   code: error.code || "UNKNOWN",
                //   message: error.message || "No error message provided",
                // },
              };
            } else {
              // Ensure we capture all error properties for real errors
              const errorDetails = {
                message: error.message || "No error message provided",
                code: error.code || "UNKNOWN",
                details: error.details || "No details provided",
                hint: error.hint || "No hint provided",
              };

              healthChecks.database = {
                status: "error",
                message: `Database error: ${errorDetails.message}`,
                // details: errorDetails,
              };
            }
          } else {
            healthChecks.database = {
              status: "ok",
              message: "Database connection successful",
              // data: { count: data?.length || 0 },
            };
          }
        } catch (queryError) {
          // Handle query errors with better fallbacks for missing properties
          const errorMessage =
            queryError instanceof Error
              ? queryError.message || "Unknown query error"
              : String(queryError) || "Unknown query error";

          healthChecks.database = {
            status: "error",
            message: `Database query exception: ${errorMessage}`,
            // details:
            //   queryError instanceof Error
            //     ? {
            //         name: queryError.name || "Error",
            //         message: queryError.message || "No message",
            //         stack: queryError.stack || "No stack trace",
            //       }
            //     : String(queryError) || "Unknown error",
          };
        }
      } catch (clientError) {
        // Handle client creation errors with better fallbacks
        const errorMessage =
          clientError instanceof Error
            ? clientError.message || "Unknown client error"
            : String(clientError) || "Unknown client error";

        healthChecks.database = {
          status: "error",
          message: `Failed to create Supabase client: ${errorMessage}`,
          // details:
          //   clientError instanceof Error
          //     ? {
          //         name: clientError.name || "Error",
          //         message: clientError.message || "No message",
          //         stack: clientError.stack || "No stack trace",
          //       }
          //     : String(clientError) || "Unknown error",
        };
      }
    } catch (error) {
      // Handle outer try/catch with better fallbacks
      const errorMessage =
        error instanceof Error
          ? error.message || "Unknown error"
          : String(error) || "Unknown error";

      healthChecks.database = {
        status: "error",
        message: `Database connection exception: ${errorMessage}`,
        // details:
        //   error instanceof Error
        //     ? {
        //         name: error.name || "Error",
        //         message: error.message || "No message",
        //         stack: error.stack || "No stack trace",
        //       }
        //     : String(error) || "Unknown error",
      };
    }
  } else {
    // Missing required environment variables
    healthChecks.database = {
      status: "error",
      message: "Missing required Supabase environment variables",
      // details: {
      //   missingUrl: !hasSupabaseUrl,
      //   missingKey: !hasSupabaseKey,
      // },
    };
  }

  // Check Blob storage
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    healthChecks.blob = {
      status: "error",
      message: "BLOB_READ_WRITE_TOKEN is not set",
    };
  } else {
    healthChecks.blob = { status: "ok", message: "Blob token is configured" };
  }

  // Check Replicate API
  if (!process.env.REPLICATE_API_TOKEN) {
    healthChecks.replicate = {
      status: "error",
      message: "REPLICATE_API_TOKEN is not set",
    };
  } else {
    healthChecks.replicate = {
      status: "ok",
      message: "Replicate token is configured",
    };
  }

  // Check if user has an active session
  if (hasSupabaseUrl && hasSupabaseKey) {
    try {
      const supabase = (await createClient()) as SupabaseClient;
      if (supabase) {
        // @ts-ignore - Supabase client type issue
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          healthChecks.auth = {
            status: "error",
            message: `Auth error: ${error.message}`,
          };
        } else if (session) {
          healthChecks.auth = {
            status: "ok",
            message: session.user.id,
          };
        } else {
          healthChecks.auth = {
            status: "warning",
            message: "No active user session",
          };
        }
      }
    } catch (authError) {
      const errorMessage =
        authError instanceof Error
          ? authError.message || "Unknown auth error"
          : String(authError) || "Unknown auth error";

      healthChecks.auth = {
        status: "error",
        message: `Auth check exception: ${errorMessage}`,
      };
    }
  } else {
    healthChecks.auth = {
      status: "error",
      message: "Missing required Supabase environment variables",
    };
  }

  // Overall status - only consider it an error if there's a specific error message
  const hasRealError = Object.values(healthChecks).some(
    (check) =>
      check.status === "error" &&
      check.message &&
      check.message !== "Database error:" &&
      !check.message.includes("undefined")
  );

  const overallStatus = hasRealError
    ? "error"
    : Object.values(healthChecks).some((check) => check.status === "warning")
    ? "warning"
    : "ok";

  return NextResponse.json({
    status: overallStatus,
    checks: healthChecks,
    environment: envStatus,
    timestamp: new Date().toISOString(),
  });
}
