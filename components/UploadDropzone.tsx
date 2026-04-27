"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { FileImage, UploadCloud } from "lucide-react";

type UploadDropzoneProps = {
  file: File | null;
  onFileSelect: (file: File) => void;
  onInvalidFile: (message: string) => void;
};

export function UploadDropzone({ file, onFileSelect, onInvalidFile }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const pickFile = (selectedFile?: File) => {
    if (!selectedFile) return;
    onFileSelect(selectedFile);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const selectedFile = event.dataTransfer.files?.[0];
    if (!selectedFile) {
      onInvalidFile("画像ファイルを選択してください。");
      return;
    }
    pickFile(selectedFile);
  };

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    pickFile(event.target.files?.[0]);
    event.target.value = "";
  };

  return (
    <section className="glass-panel rounded-lg p-4 sm:p-5">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex min-h-64 w-full flex-col items-center justify-center rounded-lg border border-dashed px-5 py-9 text-center transition ${
          isDragging
            ? "border-cyan-200 bg-cyan-300/10 shadow-glow"
            : "border-cyan-200/40 bg-white/[0.03] hover:border-cyan-200/75 hover:bg-cyan-300/10"
        }`}
      >
        <span className="mb-5 grid h-16 w-16 place-items-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 text-cyan-100">
          <UploadCloud className="h-8 w-8" aria-hidden="true" />
        </span>
        <span className="text-xl font-semibold text-white">画像をドラッグ&ドロップ</span>
        <span className="mt-2 text-sm leading-6 text-slate-300">
          クリックしてファイル選択もできます。PNG / JPG / JPEG / WEBP に対応。
        </span>
        {file ? (
          <span className="mt-5 inline-flex max-w-full items-center gap-2 rounded-lg border border-slate-600/60 bg-slate-950/60 px-3 py-2 text-sm text-slate-200">
            <FileImage className="h-4 w-4 shrink-0 text-cyan-200" aria-hidden="true" />
            <span className="truncate">{file.name}</span>
          </span>
        ) : null}
      </button>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleInput}
      />
    </section>
  );
}
