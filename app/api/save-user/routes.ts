import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(req: NextRequest) {
  console.log("⏳ API Called: /api/save-user");

  try {
    const body = await req.json();
    console.log("📦 Request Body:", body);

    const { id, first_name, last_name, username, language_code, is_premium } =
      body;

    const result = await pool.query(
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

    console.log("✅ DB Insert Success:", result.rowCount);

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json(
      { status: "error", message: String(error) },
      { status: 500 }
    );
  }
}
