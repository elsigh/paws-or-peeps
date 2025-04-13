import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "Failed to create Supabase client" }, { status: 500 })
    }

    // Check if the images table exists and has the correct schema
    const { data: tableInfo, error: tableError } = await supabase.from("images").select("id").limit(1).maybeSingle()

    if (tableError) {
      if (tableError.code === "42P01") {
        // Table doesn't exist, create it
        return NextResponse.json({
          status: "error",
          message: "The 'images' table doesn't exist. Please run the SQL setup script.",
          sqlScript: `
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_url TEXT NOT NULL,
  animated_url TEXT NOT NULL,
  opposite_url TEXT NOT NULL,
  image_type TEXT NOT NULL,
  confidence FLOAT NOT NULL,
  uploader_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_id UUID REFERENCES images(id) ON DELETE CASCADE,
  vote TEXT NOT NULL,
  voter_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_votes_image_id ON votes(image_id);
CREATE INDEX idx_images_uploader_id ON images(uploader_id);
          `,
        })
      } else {
        return NextResponse.json({
          status: "error",
          message: `Error checking table: ${tableError.message}`,
          code: tableError.code,
        })
      }
    }

    // Check for required columns
    const { data: columns, error: columnsError } = await supabase
      .rpc("get_table_columns", { table_name: "images" })
      .select()

    if (columnsError) {
      return NextResponse.json({
        status: "error",
        message: `Error checking columns: ${columnsError.message}`,
        fallbackSql: `
-- If the RPC function doesn't exist, you can manually check columns with:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'images';
        `,
      })
    }

    // Check if the votes table exists
    const { data: votesInfo, error: votesError } = await supabase.from("votes").select("id").limit(1).maybeSingle()

    if (votesError && votesError.code === "42P01") {
      return NextResponse.json({
        status: "error",
        message: "The 'votes' table doesn't exist. Please run the SQL setup script.",
        sqlScript: `
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_id UUID REFERENCES images(id) ON DELETE CASCADE,
  vote TEXT NOT NULL,
  voter_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_votes_image_id ON votes(image_id);
        `,
      })
    }

    // Check if uploader_id column exists in images table
    const { data: uploaderColumn, error: uploaderError } = await supabase.rpc("column_exists", {
      p_table: "images",
      p_column: "uploader_id",
    })

    const missingColumns = []

    if (uploaderError || !uploaderColumn) {
      missingColumns.push("uploader_id")
    }

    if (missingColumns.length > 0) {
      return NextResponse.json({
        status: "error",
        message: `Missing columns in images table: ${missingColumns.join(", ")}`,
        sqlScript: `
-- Add missing columns
${missingColumns.includes("uploader_id") ? "ALTER TABLE images ADD COLUMN uploader_id TEXT;" : ""}
${missingColumns.includes("uploader_id") ? "CREATE INDEX idx_images_uploader_id ON images(uploader_id);" : ""}
        `,
      })
    }

    // If we got here, everything looks good
    return NextResponse.json({
      status: "ok",
      message: "Database schema looks correct",
      tables: {
        images: tableInfo !== null,
        votes: votesInfo !== null,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    )
  }
}
