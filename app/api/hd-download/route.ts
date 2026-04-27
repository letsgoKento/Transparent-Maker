import { NextResponse } from "next/server";
import { requirePaidUser } from "@/lib/server/entitlements";
import { downloadHdResult } from "@/lib/server/storage";

export const runtime = "nodejs";

function sanitizeFileName(fileName: string | null) {
  const fallback = "transparent-maker-hd.png";
  if (!fileName) return fallback;

  const clean = fileName
    .replace(/[\r\n"]/g, "")
    .replace(/[\\/:*?<>|]+/g, "-")
    .trim();

  return clean.endsWith(".png") ? clean : `${clean || "transparent-maker-hd"}.png`;
}

export async function GET(request: Request) {
  const entitlement = await requirePaidUser(request);
  if ("error" in entitlement) {
    return NextResponse.json({ message: entitlement.error }, { status: entitlement.status });
  }

  const url = new URL(request.url);
  const jobId = url.searchParams.get("jobId");
  const fileName = sanitizeFileName(url.searchParams.get("fileName"));

  if (!jobId || !/^[a-f0-9-]{20,}$/i.test(jobId)) {
    return NextResponse.json({ message: "HDファイルIDが不正です。" }, { status: 400 });
  }

  try {
    const blob = await downloadHdResult(entitlement.userId, jobId);
    const encodedFileName = encodeURIComponent(fileName);

    return new Response(blob, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="transparent-maker-hd.png"; filename*=UTF-8''${encodedFileName}`,
        "Cache-Control": "private, no-store"
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "HDファイルを取得できませんでした。"
      },
      { status: 404 }
    );
  }
}
