"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Eraser, ShieldCheck } from "lucide-react";
import { AdSlot } from "@/components/AdSlot";
import { AuthPanel, type EntitlementState } from "@/components/AuthPanel";
import { DownloadActions } from "@/components/DownloadActions";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HowToUse } from "@/components/HowToUse";
import { ImageCompare } from "@/components/ImageCompare";
import { ProcessingStatus } from "@/components/ProcessingStatus";
import { UploadDropzone } from "@/components/UploadDropzone";
import {
  buildTransparentFileName,
  downloadBlob,
  FREE_MAX_DIMENSION,
  isSupportedImage,
  removeBackgroundInBrowser,
  removeBackgroundWithServer
} from "@/lib/backgroundRemoval";

type Status = "idle" | "ready" | "processing" | "done" | "error";

const initialEntitlement: EntitlementState = {
  isConfigured: false,
  isSignedIn: false,
  isPaid: false,
  accessToken: null,
  email: null
};

export function TransparentMakerApp() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("画像を選択してください。");
  const [isHdLoading, setIsHdLoading] = useState(false);
  const [entitlement, setEntitlement] = useState<EntitlementState>(initialEntitlement);
  const originalUrlRef = useRef<string | null>(null);
  const resultUrlRef = useRef<string | null>(null);

  const transparentFileName = useMemo(
    () => buildTransparentFileName(file?.name ?? "image.png"),
    [file?.name]
  );

  useEffect(() => {
    return () => {
      if (originalUrlRef.current) URL.revokeObjectURL(originalUrlRef.current);
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    };
  }, []);

  const revokeResult = useCallback(() => {
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = null;
    }
    setResultUrl(null);
    setResultBlob(null);
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    if (!isSupportedImage(selectedFile)) {
      setStatus("error");
      setStatusMessage("PNG / JPG / JPEG / WEBP の画像を選択してください。");
      return;
    }

    if (originalUrlRef.current) {
      URL.revokeObjectURL(originalUrlRef.current);
    }
    revokeResult();

    const nextOriginalUrl = URL.createObjectURL(selectedFile);
    originalUrlRef.current = nextOriginalUrl;
    setFile(selectedFile);
    setOriginalUrl(nextOriginalUrl);
    setStatus("ready");
    setProgress(0);
    setStatusMessage("プレビューを確認して、背景を削除してください。");
  };

  const handleProcess = useCallback(async () => {
    if (!file) {
      setStatus("error");
      setStatusMessage("先に画像を選択してください。");
      return;
    }

    try {
      revokeResult();
      setStatus("processing");
      setProgress(4);
      setStatusMessage("処理を開始しています。");

      const useServerRemoval = process.env.NEXT_PUBLIC_SERVER_REMOVAL_ENABLED === "true";
      if (useServerRemoval) {
        setProgress(28);
        setStatusMessage("サーバー側で縮小版の透過PNGを作成しています。");
      }
      const transparentBlob = useServerRemoval
        ? await removeBackgroundWithServer(file, entitlement.accessToken)
        : await removeBackgroundInBrowser(file, {
            maxDimension: FREE_MAX_DIMENSION,
            onProgress: (nextProgress, label) => {
              setProgress(nextProgress);
              setStatusMessage(label);
            }
          });

      const nextUrl = URL.createObjectURL(transparentBlob);
      resultUrlRef.current = nextUrl;
      setResultBlob(transparentBlob);
      setResultUrl(nextUrl);
      setProgress(100);
      setStatus("done");
      setStatusMessage("背景透過PNGを作成しました。");
    } catch (error) {
      setStatus("error");
      setProgress(0);
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "背景削除に失敗しました。時間を置いてもう一度お試しください。"
      );
    }
  }, [entitlement.accessToken, file, revokeResult]);

  const handleFreeDownload = () => {
    if (!resultBlob) return;
    downloadBlob(resultBlob, transparentFileName);
  };

  const handleChooseAnother = () => {
    if (originalUrlRef.current) {
      URL.revokeObjectURL(originalUrlRef.current);
      originalUrlRef.current = null;
    }
    revokeResult();
    setFile(null);
    setOriginalUrl(null);
    setStatus("idle");
    setProgress(0);
    setStatusMessage("画像を選択してください。");
  };

  const handleHdDownload = async () => {
    if (!file) return;

    if (!entitlement.isSignedIn || !entitlement.accessToken) {
      setStatus("error");
      setStatusMessage("HD Downloadにはログインが必要です。Plan欄からログインしてください。");
      return;
    }

    if (!entitlement.isPaid) {
      setStatus("error");
      setStatusMessage("元解像度ダウンロードは有料プラン限定です。Upgradeから決済を開始できます。");
      return;
    }

    setIsHdLoading(true);
    setStatus("processing");
    setProgress(12);
    setStatusMessage("HD画像をサーバー側で処理しています。");

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("tier", "hd");

      const processResponse = await fetch("/api/remove-background", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${entitlement.accessToken}`
        },
        body: formData
      });
      const processData = (await processResponse.json()) as { jobId?: string; message?: string };
      if (!processResponse.ok || !processData.jobId) {
        throw new Error(processData.message ?? "HD処理を開始できませんでした。");
      }

      setProgress(78);
      setStatusMessage("権限を確認してHD PNGを取得しています。");

      const downloadResponse = await fetch(
        `/api/hd-download?jobId=${encodeURIComponent(processData.jobId)}&fileName=${encodeURIComponent(
          transparentFileName
        )}`,
        {
          headers: {
            Authorization: `Bearer ${entitlement.accessToken}`
          }
        }
      );

      if (!downloadResponse.ok) {
        const data = (await downloadResponse.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message ?? "HDファイルの取得に失敗しました。");
      }

      const blob = await downloadResponse.blob();
      downloadBlob(blob, buildTransparentFileName(file.name, "hd-transparent"));
      setProgress(100);
      setStatus("done");
      setStatusMessage("HD PNGをダウンロードしました。");
    } catch (error) {
      setStatus("error");
      setProgress(0);
      setStatusMessage(error instanceof Error ? error.message : "HD Downloadに失敗しました。");
    } finally {
      setIsHdLoading(false);
    }
  };

  return (
    <main>
      <Header />
      <section className="mx-auto grid w-full max-w-6xl gap-5 px-4 pb-10 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8">
        <div className="grid gap-5">
          <UploadDropzone
            file={file}
            onFileSelect={handleFileSelect}
            onInvalidFile={(message) => {
              setStatus("error");
              setStatusMessage(message);
            }}
          />

          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="flex items-start gap-3 text-sm leading-6 text-slate-300">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-cyan-200" aria-hidden="true" />
              <p>無料処理はブラウザ上で実行します。HD版はAPI側でログインと課金状態を確認します。</p>
            </div>
            <button
              type="button"
              onClick={handleProcess}
              disabled={!file || status === "processing"}
              className="shine-button inline-flex min-h-14 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-300 to-blue-400 px-6 py-3 text-base font-bold text-slate-950 shadow-glow transition hover:from-cyan-200 hover:to-blue-300 disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400 disabled:shadow-none"
            >
              <Eraser className="h-5 w-5" aria-hidden="true" />
              背景を削除
            </button>
          </div>

          <ProcessingStatus status={status} progress={progress} message={statusMessage} />
          <ImageCompare originalUrl={originalUrl} resultUrl={resultUrl} />
          <DownloadActions
            canDownload={Boolean(resultBlob)}
            isPaid={entitlement.isPaid}
            isHdLoading={isHdLoading}
            onFreeDownload={handleFreeDownload}
            onHdDownload={handleHdDownload}
            onReprocess={handleProcess}
            onChooseAnother={handleChooseAnother}
          />
        </div>

        <aside className="grid h-max gap-5">
          <AuthPanel onEntitlementChange={setEntitlement} />
          <AdSlot label="広告スペース 300x250" />
          <section className="glass-panel rounded-lg p-4">
            <h2 className="text-sm font-semibold text-white">対応形式</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">PNG / JPG / JPEG / WEBP</p>
            <p className="mt-3 text-xs leading-5 text-slate-400">
              アップロードした画像は無料処理ではサーバーに保存しません。HD版は権限確認後に非公開ストレージへ保存します。
            </p>
          </section>
        </aside>
      </section>
      <div className="mx-auto w-full max-w-6xl px-4 pb-2 sm:px-6 lg:px-8">
        <AdSlot label="横長広告スペース 728x90" />
      </div>
      <HowToUse />
      <Footer />
    </main>
  );
}
