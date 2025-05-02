import { createClient } from "@/lib/supabase-server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = (await createClient()) as SupabaseClient;
    console.debug("Supabase client created:", supabase);
    if (!supabase) {
      return NextResponse.json(
        { error: "Failed to create Supabase client" },
        { status: 500 },
      );
    }

    // Test 1: Simple query to check connection
    const connectionTest = await testConnection(supabase);

    // Test 2: Insert a test record
    const insertTest = await testInsert(supabase);

    // Test 3: Check permissions
    const permissionsTest = await testPermissions(supabase);

    return NextResponse.json({
      status: "success",
      tests: {
        connection: connectionTest,
        insert: insertTest,
        permissions: permissionsTest,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: `Unexpected error: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
      { status: 500 },
    );
  }
}

async function testConnection(supabase: SupabaseClient) {
  try {
    // Use the correct syntax for count in Supabase
    const { data, error } = await supabase
      .from("images")
      .select("*", { count: "exact", head: true });

    if (error) {
      return {
        success: false,
        message: `Connection error: ${error.message}`,
        error,
      };
    }

    return {
      success: true,
      message: "Successfully connected to database",
    };
  } catch (error) {
    return {
      success: false,
      message: `Connection test failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

async function testInsert(supabase: SupabaseClient) {
  try {
    const testId = nanoid();

    // Create a test record with a valid image_type value
    // Based on the constraint error, only "pet" or "human" are valid
    const { data, error } = await supabase
      .from("images")
      .insert({
        original_url: `https://test-url.com/${testId}`,
        animated_url: `https://test-url.com/animated-${testId}`,
        opposite_url: `https://test-url.com/opposite-${testId}`,
        image_type: "human",
        user_id: `test-${testId}`,
      })
      .select()
      .single();

    if (error) {
      return {
        success: false,
        message: `Insert error: ${error.message}`,
        error,
      };
    }

    // Clean up the test record
    const { error: deleteError } = await supabase
      .from("images")
      .delete()
      .eq("id", data.id);

    if (deleteError) {
      return {
        success: true,
        message: "Insert successful but cleanup failed",
        warning: deleteError.message,
      };
    }

    return {
      success: true,
      message: "Successfully inserted and cleaned up test record",
    };
  } catch (error) {
    return {
      success: false,
      message: `Insert test failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

async function testPermissions(supabase: SupabaseClient) {
  try {
    // Test RLS policies by trying to read from the images table
    const { data, error } = await supabase.from("images").select("id").limit(1);

    if (error?.message.includes("permission denied")) {
      return {
        success: false,
        message: "Row Level Security might be blocking access",
        error,
      };
    }

    return {
      success: true,
      message: "Permissions appear to be correctly configured",
    };
  } catch (error) {
    return {
      success: false,
      message: `Permissions test failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}
