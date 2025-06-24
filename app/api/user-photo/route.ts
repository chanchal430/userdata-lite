import { NextRequest, NextResponse } from "next/server";
import fetch from "node-fetch";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("id");

  if (!userId || !BOT_TOKEN) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    // Step 1: Get user profile photos
    const profileRes = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getUserProfilePhotos?user_id=${userId}&limit=1`
    );
    const profileData = (await profileRes.json()) as {
      ok: boolean;
      result?: {
        total_count: number;
        photos: Array<Array<{ file_id: string }>>;
      };
    };

    const fileId = profileData.result?.photos?.[0]?.[0]?.file_id;

    if (!fileId) {
      return NextResponse.json(
        { error: "No profile photo found" },
        { status: 404 }
      );
    }

    // Step 2: Get file path
    const fileRes = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`
    );
    const fileData = (await fileRes.json()) as {
  ok: boolean;
  result?: {
    file_path: string;
  };
};

    const filePath = fileData.result?.file_path;

    if (!filePath) {
      return NextResponse.json(
        { error: "Failed to retrieve file path" },
        { status: 500 }
      );
    }

    // Step 3: Return final image URL
    const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;
    return NextResponse.json({ url: fileUrl });
  } catch (err) {
    console.error("Profile photo error:", err);
    return NextResponse.json(
      { error: "Failed to fetch photo" },
      { status: 500 }
    );
  }
}
