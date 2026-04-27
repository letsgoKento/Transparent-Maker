import sharp from "sharp";

export const SERVER_SUPPORTED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"];
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
export const FREE_MAX_DIMENSION_SERVER = 1024;

export async function removeBackgroundOnServer(file: File) {
  const endpoint = process.env.BACKGROUND_REMOVAL_API_URL;
  if (!endpoint) {
    throw new Error(
      "BACKGROUND_REMOVAL_API_URL is not configured. Connect this route to a rembg worker or background-removal API."
    );
  }

  const formData = new FormData();
  formData.append("image", file, file.name);

  const headers = new Headers();
  if (process.env.BACKGROUND_REMOVAL_API_KEY) {
    headers.set("Authorization", `Bearer ${process.env.BACKGROUND_REMOVAL_API_KEY}`);
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: formData
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Background removal worker failed: ${response.status} ${detail}`.trim());
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  return sharp(buffer).png().toBuffer();
}

export async function resizeToFreePng(pngBuffer: Buffer) {
  return sharp(pngBuffer)
    .resize({
      width: FREE_MAX_DIMENSION_SERVER,
      height: FREE_MAX_DIMENSION_SERVER,
      fit: "inside",
      withoutEnlargement: true
    })
    .png()
    .toBuffer();
}
