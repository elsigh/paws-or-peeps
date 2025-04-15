import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = createServerClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Failed to create Supabase client" },
        { status: 500 }
      );
    }

    // Check the schema of the images table
    const { data: columns, error: columnsError } = await supabase
      .from("information_schema.columns")
      .select("column_name, data_type, is_nullable, column_default")
      .eq("table_name", "images");

    if (columnsError) {
      return NextResponse.json({
        status: "error",
        message: `Error checking columns: ${columnsError.message}`,
      });
    }

    // Check for constraints on the images table
    const { data: constraints, error: constraintsError } = await supabase
      .from("information_schema.table_constraints")
      .select("constraint_name, constraint_type")
      .eq("table_name", "images");

    // Try to get check constraint details
    let checkConstraints = [];
    try {
      const { data: checks, error: checksError } = await supabase.rpc(
        "get_check_constraints",
        {
          table_name: "images",
        }
      );

      if (!checksError && checks) {
        checkConstraints = checks;
      }
    } catch (e) {
      console.error("Error getting check constraints:", e);
    }

    // Try a test insert with different image_type values
    const testResults = {};

    for (const type of ["pet", "human", "cat", "dog", "person"]) {
      try {
        const { data, error } = await supabase
          .from("images")
          .insert({
            original_url: "test-url",
            animated_url: "test-animated-url",
            opposite_url: "test-opposite-url",
            image_type: type,
            uploader_id: "test-user",
          })
          .select();

        // Immediately delete the test row to clean up
        if (data && data[0] && data[0].id) {
          await supabase.from("images").delete().eq("id", data[0].id);
        }

        testResults[type] = error ? `Error: ${error.message}` : "Success";
      } catch (e) {
        testResults[type] = `Exception: ${
          e instanceof Error ? e.message : String(e)
        }`;
      }
    }

    return NextResponse.json({
      status: "success",
      columns,
      constraints,
      checkConstraints,
      testResults,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: `Unexpected error: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
      { status: 500 }
    );
  }
}
