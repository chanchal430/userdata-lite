import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(req: NextRequest) {
  try {
    console.log("✅ /api/save-user called");

    const body = await req.json();
    console.log("📦 Received:", body);

    const { id, first_name, last_name, username, language_code, is_premium } =
      body;

    await pool.query(
      `INSERT INTO telegram_user (id, first_name, last_name, username, language_code, is_premium)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET 
         first_name = EXCLUDED.first_name,
         last_name = EXCLUDED.last_name,
         username = EXCLUDED.username,
         language_code = EXCLUDED.language_code,
         is_premium = EXCLUDED.is_premium`,
      [id, first_name, last_name, username, language_code, is_premium]
    );

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("❌ DB error:", error);
    return NextResponse.json(
      { status: "error", message: String(error) },
      { status: 500 }
    );
  }
}
