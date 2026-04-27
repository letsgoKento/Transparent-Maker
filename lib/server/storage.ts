import { getSupabaseAdmin } from "@/lib/supabase/server";
import { randomUUID } from "crypto";

export function getHdBucketName() {
  return process.env.SUPABASE_HD_BUCKET ?? "transparent-results";
}

export function createHdJobId() {
  return randomUUID();
}

export function getHdObjectPath(userId: string, jobId: string) {
  return `${userId}/${jobId}.png`;
}

export async function uploadHdResult(userId: string, jobId: string, pngBuffer: Buffer) {
  const supabase = getSupabaseAdmin();
  const bucket = getHdBucketName();
  const path = getHdObjectPath(userId, jobId);

  const { error } = await supabase.storage.from(bucket).upload(path, pngBuffer, {
    contentType: "image/png",
    upsert: true
  });

  if (error) {
    throw new Error(error.message);
  }

  return path;
}

export async function downloadHdResult(userId: string, jobId: string) {
  const supabase = getSupabaseAdmin();
  const bucket = getHdBucketName();
  const path = getHdObjectPath(userId, jobId);
  const { data, error } = await supabase.storage.from(bucket).download(path);

  if (error || !data) {
    throw new Error(error?.message ?? "HDファイルが見つかりませんでした。");
  }

  return data;
}
