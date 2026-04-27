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

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
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
        className={`flex min-h-40 w-full flex-col items-center justify-center rounded-lg border border-dashed px-4 py-6 text-center transition sm:min-h-56 sm:px-5 sm:py-8 ${
          isDragging
            ? "border-cyan-200 bg-cyan-300/10 shadow-glow"
            : "border-cyan-200/40 bg-white/[0.03] hover:border-cyan-200/75 hover:bg-cyan-300/10"
        }`}
      >
        <span className="mb-4 grid h-12 w-12 place-items-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 text-cyan-100 sm:h-16 sm:w-16">
          <UploadCloud className="h-6 w-6 sm:h-8 sm:w-8" aria-hidden="true" />
        </span>
        <span className="text-lg font-semibold text-white sm:text-xl">画像をドラッグ&ドロップ</span>
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
