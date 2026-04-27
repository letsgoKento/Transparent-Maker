import { NextResponse } from "next/server";
import {
  MAX_UPLOAD_BYTES,
  resizeToFreePng,
  SERVER_SUPPORTED_MIME_TYPES
} from "@/lib/server/backgroundEngine";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");

    if (!(image instanceof File)) {
      return NextResponse.json({ message: "処理済み画像を送信してください。" }, { status: 400 });
    }

    if (!SERVER_SUPPORTED_MIME_TYPES.includes(image.type)) {
      return NextResponse.json(
        { message: "PNG / JPG / JPEG / WEBP の画像のみダウンロードできます。" },
        { status: 415 }
      );
    }

    if (image.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ message: "20MB以下の画像を選択してください。" }, { status: 413 });
    }

    const pngBuffer = Buffer.from(await image.arrayBuffer());
    const freePngBuffer = await resizeToFreePng(pngBuffer);

    return new Response(new Uint8Array(freePngBuffer), {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": 'attachment; filename="transparent-maker-free.png"',
        "Cache-Control": "no-store",
        "X-Transparent-Maker-Tier": "free"
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "無料PNGの作成に失敗しました。"
      },
      { status: 500 }
    );
  }
}
