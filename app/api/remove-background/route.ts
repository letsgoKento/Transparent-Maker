import { NextResponse } from "next/server";
import {
  MAX_UPLOAD_BYTES,
  removeBackgroundOnServer,
  resizeToFreePng,
  SERVER_SUPPORTED_MIME_TYPES
} from "@/lib/server/backgroundEngine";
import { requirePaidUser } from "@/lib/server/entitlements";
import { createHdJobId, uploadHdResult } from "@/lib/server/storage";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");
    const tier = formData.get("tier") === "hd" ? "hd" : "free";

    if (!(image instanceof File)) {
      return NextResponse.json({ message: "画像ファイルを送信してください。" }, { status: 400 });
    }

    if (!SERVER_SUPPORTED_MIME_TYPES.includes(image.type)) {
      return NextResponse.json(
        { message: "PNG / JPG / JPEG / WEBP の画像のみ処理できます。" },
        { status: 415 }
      );
    }

    if (image.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ message: "20MB以下の画像を選択してください。" }, { status: 413 });
    }

    const entitlement = tier === "hd" ? await requirePaidUser(request) : null;
    if (entitlement && "error" in entitlement) {
      return NextResponse.json({ message: entitlement.error }, { status: entitlement.status });
    }

    const pngBuffer = await removeBackgroundOnServer(image);

    if (tier === "free") {
      const freePngBuffer = await resizeToFreePng(pngBuffer);
      return new Response(new Uint8Array(freePngBuffer), {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "no-store",
          "X-Transparent-Maker-Tier": "free"
        }
      });
    }

    if (!entitlement) {
      return NextResponse.json({ message: "HD権限を確認できませんでした。" }, { status: 500 });
    }

    const jobId = createHdJobId();
    await uploadHdResult(entitlement.userId, jobId, pngBuffer);

    return NextResponse.json({
      jobId
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "背景削除処理に失敗しました。サーバー設定を確認してください。"
      },
      { status: 500 }
    );
  }
}
