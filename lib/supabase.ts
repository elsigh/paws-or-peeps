import { createClient } from "@supabase/supabase-js"

// Create a single supabase client for the browser
export const createBrowserClient = () => {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl) {
      console.error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
      return null
    }

    if (!supabaseAnonKey) {
      console.error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
      return null
    }

    return createClient(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.error("Error creating Supabase browser client:", error)
    return null
  }
}

// Create a server-side supabase client with improved error handling
export const createServerClient = () => {
  try {
    // Log all available environment variables (without exposing values)
    const envVars = {
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
    }
    console.log("Environment variables available:", envVars)

    // Check for environment variables with detailed logging
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl) {
      const errorMsg = "Missing Supabase URL environment variable"
      console.error(errorMsg)
      throw new Error(errorMsg)
    }

    if (!supabaseServiceKey) {
      const errorMsg = "Missing Supabase key environment variable"
      console.error(errorMsg)
      throw new Error(errorMsg)
    }

    console.log(`Creating Supabase client with URL: ${supabaseUrl.substring(0, 8)}...`)

    // Create the client with additional options for better error handling
    try {
      const client = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })

      // Test the client synchronously to catch immediate errors
      if (!client) {
        throw new Error("Failed to create Supabase client object")
      }

      if (!client.from) {
        throw new Error("Supabase client is missing 'from' method")
      }

      console.log("Supabase client created successfully")

      // Set up an async test that won't block the client return
      setTimeout(async () => {
        try {
          console.log("Testing Supabase connection asynchronously...")
          const { data, error } = await client.from("images").select("count(*)", { count: "exact", head: true })

          if (error) {
            console.error("Supabase connection test failed:", error.message)
            console.error("Full error details:", JSON.stringify(error, null, 2))

            // Log specific error types for better diagnostics
            if (error.code) {
              console.error(`Error code: ${error.code}`)
            }

            if (error.details) {
              console.error(`Error details: ${error.details}`)
            }

            if (error.hint) {
              console.error(`Error hint: ${error.hint}`)
            }
          } else {
            console.log("Supabase connection test successful:", data)
          }
        } catch (e) {
          // Ensure we capture and log any exception that might occur
          console.error("Supabase connection test exception:")
          if (e instanceof Error) {
            console.error("Error name:", e.name)
            console.error("Error message:", e.message)
            console.error("Error stack:", e.stack)
          } else {
            console.error("Unknown error type:", typeof e, e)
          }
        }
      }, 100)

      return client
    } catch (clientCreationError) {
      console.error("Error creating Supabase client:")
      if (clientCreationError instanceof Error) {
        console.error("Error name:", clientCreationError.name)
        console.error("Error message:", clientCreationError.message)
        console.error("Error stack:", clientCreationError.stack)
      } else {
        console.error("Unknown error:", clientCreationError)
      }
      throw clientCreationError
    }
  } catch (error) {
    // Ensure we log the full error details
    console.error("Error in createServerClient function:")
    if (error instanceof Error) {
      console.error("Error name:", error.name)
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    } else {
      console.error("Unknown error:", error)
    }

    // In development, return a mock client to prevent app crashes
    if (process.env.NODE_ENV === "development") {
      console.log("Creating mock Supabase client for development")
      return createMockClient()
    }

    throw error
  }
}

// Create a mock client for development when the real connection fails
function createMockClient() {
  console.log("Using mock Supabase client")

  // This is a very basic mock that allows the app to continue in development
  return {
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: () => ({
          single: () => Promise.resolve({ data: mockData(table), error: null }),
          limit: () => Promise.resolve({ data: [mockData(table)], error: null }),
          order: () => ({
            limit: () => Promise.resolve({ data: [mockData(table)], error: null }),
          }),
        }),
        limit: () => Promise.resolve({ data: [mockData(table)], error: null }),
        order: () => ({
          limit: () => Promise.resolve({ data: [mockData(table)], error: null }),
        }),
        single: () => Promise.resolve({ data: mockData(table), error: null }),
        maybeSingle: () => Promise.resolve({ data: mockData(table), error: null }),
        count: () => Promise.resolve({ data: { count: 0 }, error: null }),
        head: () => Promise.resolve({ data: null, error: null }),
      }),
      insert: (data: any) => ({
        select: () => ({
          single: () => Promise.resolve({ data: { id: "mock-id", ...data }, error: null }),
        }),
        returning: () => Promise.resolve([{ id: "mock-id", ...data }]),
      }),
      delete: () => ({
        eq: () => Promise.resolve({ error: null }),
      }),
    }),
    rpc: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
    }),
  }
}

// Generate mock data based on table name
function mockData(table: string) {
  if (table === "images") {
    return {
      id: "mock-image-id",
      original_url: "/colorful-abstract-shapes.png",
      animated_url: "/whimsical-forest-creatures.png",
      opposite_url: "/light-and-shadow.png",
      image_type: "human",
      confidence: 85.0,
      uploader_id: "mock-user",
      created_at: new Date().toISOString(),
    }
  }

  if (table === "votes") {
    return {
      id: "mock-vote-id",
      image_id: "mock-image-id",
      vote: "human",
      voter_id: "mock-user",
      created_at: new Date().toISOString(),
    }
  }

  return { id: "mock-id" }
}
