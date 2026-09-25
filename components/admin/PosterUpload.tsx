"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Poster } from "@/components/site/Poster";

const MAX_BYTES = 4 * 1024 * 1024;

export function PosterUpload({
  value,
  onChange,
  title,
  categorySlug,
  error,
}: {
  value: string;
  onChange: (url: string) => void;
  title: string;
  categorySlug?: string | null;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function upload(file: File) {
    setUploadError(null);
    if (!file.type.startsWith("image/") || file.type === "image/svg+xml")
      return setUploadError("Please choose an image file (JPG, PNG or WebP).");
    if (file.size > MAX_BYTES) return setUploadError("Image is larger than 4 MB. Please compress it and try again.");

    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body });
      const result = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error ?? "Upload failed. Please try again.");
      onChange(result.url);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) upload(file);
        }}
        className={`relative aspect-[3/4] w-40 shrink-0 overflow-hidden rounded-2xl border-2 border-dashed transition ${
          dragging ? "border-mirchi bg-mirchi-soft" : "border-neutral-200 bg-neutral-50"
        }`}
      >
        {value ? (
          <>
            <Poster src={value} title={title || "Poster"} categorySlug={categorySlug} sizes="160px" />
            <button
              type="button"
              onClick={() => onChange("")}
              aria-label="Remove poster"
              className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
            >
              <X className="size-4" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex size-full flex-col items-center justify-center gap-2 p-3 text-center text-xs text-neutral-500 hover:text-neutral-800"
          >
            {uploading ? <Loader2 className="size-6 animate-spin" /> : <ImagePlus className="size-6" />}
            {uploading ? "Uploading…" : "Drop a poster or click to upload"}
          </button>
        )}
      </div>

      <div className="flex-1 space-y-3 text-sm">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
            e.target.value = "";
          }}
        />
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="btn-secondary">
          {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
          {value ? "Replace poster" : "Upload poster"}
        </button>
        <p className="text-neutral-500">Portrait 3:4 works best (e.g. 900 × 1200 px). JPG, PNG or WebP, up to 4 MB.</p>
        <label className="block">
          <span className="text-neutral-600">…or paste an image link</span>
          <input
            type="text"
            inputMode="url"
            value={value.startsWith("/uploads/") ? "" : value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://…"
            aria-invalid={Boolean(error)}
            className="admin-input mt-1"
          />
        </label>
        {(uploadError || error) && <p className="text-sm text-mirchi">{uploadError ?? error}</p>}
      </div>
    </div>
  );
}
