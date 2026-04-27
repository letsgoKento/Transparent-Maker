export const SUPPORTED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"];
export const FREE_MAX_DIMENSION = 1024;

type ProgressHandler = (progress: number, label: string) => void;
type BackgroundRemovalConfig = {
  progress?: (...args: unknown[]) => void;
  [key: string]: unknown;
};
type RemoveBackgroundFunction = (
  image: Blob,
  config?: BackgroundRemovalConfig
) => Promise<Blob | Response>;
type DrawableImage = {
  width: number;
  height: number;
  draw: (context: CanvasRenderingContext2D, width: number, height: number) => void;
  close: () => void;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function resolveRemoveBackground(moduleValue: unknown): RemoveBackgroundFunction | null {
  if (typeof moduleValue === "function") {
    return moduleValue as RemoveBackgroundFunction;
  }

  if (!isRecord(moduleValue)) {
    return null;
  }

  if (typeof moduleValue.removeBackground === "function") {
    return moduleValue.removeBackground as RemoveBackgroundFunction;
  }

  if (typeof moduleValue.default === "function") {
    return moduleValue.default as RemoveBackgroundFunction;
  }

  if (isRecord(moduleValue.default)) {
    if (typeof moduleValue.default.removeBackground === "function") {
      return moduleValue.default.removeBackground as RemoveBackgroundFunction;
    }

    if (typeof moduleValue.default.default === "function") {
      return moduleValue.default.default as RemoveBackgroundFunction;
    }
  }

  return null;
}

export function isSupportedImage(file: File) {
  return SUPPORTED_MIME_TYPES.includes(file.type);
}

export function buildTransparentFileName(fileName: string, suffix = "transparent") {
  const baseName = fileName.replace(/\.[^/.]+$/, "") || "image";
  const safeName = baseName
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return `${safeName || "image"}-${suffix}.png`;
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

async function loadDrawableImage(image: Blob): Promise<DrawableImage> {
  if ("createImageBitmap" in window) {
    try {
      const bitmap = await createImageBitmap(image, { imageOrientation: "from-image" });
      return {
        width: bitmap.width,
        height: bitmap.height,
        draw: (context, width, height) => context.drawImage(bitmap, 0, 0, width, height),
        close: () => bitmap.close()
      };
    } catch {
      // Safari can be picky with createImageBitmap; the <img> fallback keeps uploads usable.
    }
  }

  const url = URL.createObjectURL(image);
  const img = new Image();
  img.decoding = "async";
  img.src = url;

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("画像を読み込めませんでした。別の画像でお試しください。"));
    };
  });

  return {
    width: img.naturalWidth || img.width,
    height: img.naturalHeight || img.height,
    draw: (context, width, height) => context.drawImage(img, 0, 0, width, height),
    close: () => URL.revokeObjectURL(url)
  };
}

export async function resizeImageToMaxDimension(image: Blob, maxDimension: number) {
  const drawable = await loadDrawableImage(image);
  const scale = Math.min(1, maxDimension / Math.max(drawable.width, drawable.height));
  const width = Math.max(1, Math.round(drawable.width * scale));
  const height = Math.max(1, Math.round(drawable.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    drawable.close();
    throw new Error("画像のプレビュー処理に失敗しました。別の画像でお試しください。");
  }

  drawable.draw(context, width, height);
  drawable.close();

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("画像の変換に失敗しました。"));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}

export async function removeBackgroundInBrowser(
  file: File,
  options: {
    maxDimension?: number;
    onProgress?: ProgressHandler;
  } = {}
) {
  const maxDimension = options.maxDimension ?? FREE_MAX_DIMENSION;
  const onProgress = options.onProgress ?? (() => undefined);

  onProgress(8, "画像を読み込み中");
  const resizedInput = await resizeImageToMaxDimension(file, maxDimension);

  onProgress(18, "AIモデルを準備中");
  const backgroundModule = await import("@imgly/background-removal");
  const removeBackground = resolveRemoveBackground(backgroundModule);
  if (!removeBackground) {
    throw new Error("背景削除ライブラリを読み込めませんでした。");
  }

  const output = await removeBackground(resizedInput, {
    progress: (...args: unknown[]) => {
      const current = Number(args[1] ?? 0);
      const total = Number(args[2] ?? 0);
      if (total > 0) {
        const modelProgress = Math.round((current / total) * 72);
        onProgress(Math.min(94, 20 + modelProgress), "背景を分離中");
      }
    }
  });

  onProgress(100, "透過PNGを作成しました");

  if (output instanceof Response) {
    return output.blob();
  }

  return new Blob([await output.arrayBuffer()], { type: "image/png" });
}

export async function removeBackgroundWithServer(file: File, accessToken?: string | null) {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("tier", "free");

  const headers = new Headers();
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch("/api/remove-background", {
    method: "POST",
    headers,
    body: formData
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(data?.message ?? "サーバー側の背景削除に失敗しました。");
  }

  return response.blob();
}
