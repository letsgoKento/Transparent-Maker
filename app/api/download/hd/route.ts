import { NextResponse } from "next/server";
import {
  MAX_UPLOAD_BYTES,
  removeBackgroundOnServer,
  SERVER_SUPPORTED_MIME_TYPES
} from "@/lib/server/backgroundEngine";
import { requireProUser } from "@/lib/server/entitlements";

export const runtime = "nodejs";
export const maxDuration = 60;

function sanitizeFileName(fileName: string | null) {
  const clean = (fileName ?? "transparent-maker-hd.png")
    .replace(/[\r\n"]/g, "")
    .replace(/[\\/:*?<>|]+/g, "-")
    .trim();

  return clean.endsWith(".png") ? clean : `${clean || "transparent-maker-hd"}.png`;
}

export async function POST(request: Request) {
  const entitlement = await requireProUser(request);
  if ("error" in entitlement) {
    return NextResponse.json({ message: entitlement.error }, { status: entitlement.status });
  }

  try {
    const formData = await request.formData();
    const image = formData.get("image");
    const fileName = sanitizeFileName(
      typeof formData.get("fileName") === "string" ? String(formData.get("fileName")) : null
    );

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

    const pngBuffer = await removeBackgroundOnServer(image);
    const encodedFileName = encodeURIComponent(fileName);

    return new Response(new Uint8Array(pngBuffer), {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="transparent-maker-hd.png"; filename*=UTF-8''${encodedFileName}`,
        "Cache-Control": "private, no-store",
        "X-Transparent-Maker-Tier": "hd"
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "HD PNGの作成に失敗しました。"
      },
      { status: 500 }
    );
  }
}
