//
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Setup Supabase client
const supabase = createClient(
  "https://ghrbkkfeadirapqedwtc.supabase.co",
  process.env.SUPABASE_KEY! // Provided via Render environment
);

export async function POST(req: NextRequest) {
  console.log("✅ /api/save-user called");

  const user = await req.json();
  console.log("📦 Received:", user);

  const { id, first_name, last_name, username, language_code, is_premium } =
    user;

  const { data, error } = await supabase.from("telegram_user").upsert([
    {
      id,
      first_name,
      last_name,
      username,
      language_code,
      is_premium,
    },
  ]);

  if (error) {
    console.error("❌ Supabase error:", error);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ status: "ok", data });
}
