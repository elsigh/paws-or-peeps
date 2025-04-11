// Utility to check environment variables and provide detailed diagnostics

export function checkEnvironmentVariables() {
  const variables = {
    // Supabase variables
    SUPABASE_URL: process.env.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,

    // Blob storage variables
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,

    // Replicate variables
    REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN,
  }

  // Check which variables are defined (without exposing the values)
  const defined = Object.entries(variables).reduce(
    (acc, [key, value]) => {
      acc[key] = !!value
      return acc
    },
    {} as Record<string, boolean>,
  )

  // Check for potential issues
  const issues = []

  // Supabase URL checks
  if (!defined.SUPABASE_URL && !defined.NEXT_PUBLIC_SUPABASE_URL) {
    issues.push("No Supabase URL is defined. Set either SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL.")
  }

  // Supabase key checks
  if (!defined.SUPABASE_SERVICE_ROLE_KEY && !defined.SUPABASE_ANON_KEY && !defined.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    issues.push(
      "No Supabase key is defined. Set SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY, or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    )
  }

  // Blob storage checks
  if (!defined.BLOB_READ_WRITE_TOKEN) {
    issues.push("BLOB_READ_WRITE_TOKEN is not defined. Image uploads may fail.")
  }

  // Replicate checks
  if (!defined.REPLICATE_API_TOKEN) {
    issues.push("REPLICATE_API_TOKEN is not defined. AI transformations may fail.")
  }

  return {
    defined,
    issues,
    allDefined: issues.length === 0,
  }
}

// Function to get a formatted environment variable status for logging
export function getEnvironmentStatus() {
  const { defined, issues } = checkEnvironmentVariables()

  return {
    status: issues.length === 0 ? "ok" : "issues_found",
    variables: defined,
    issues,
    timestamp: new Date().toISOString(),
  }
}
