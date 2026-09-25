import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { del, put } from "@vercel/blob";

// Posters live in Vercel Blob when a Blob store is connected (Vercel deployments), otherwise on the
// server's disk, served by app/uploads/[name]/route.ts (local dev and VMs). Newer stores connect with
// BLOB_STORE_ID + Vercel's automatic OIDC token; older ones with BLOB_READ_WRITE_TOKEN.
const useBlob = Boolean(process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN);

export const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || "uploads");
export const UPLOAD_URL_PREFIX = "/uploads/";
// Vercel functions accept request bodies up to 4.5 MB, so stay under that everywhere.
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

// SVG is deliberately excluded: it can carry scripts.
const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};
const CONTENT_TYPES = Object.fromEntries(Object.entries(TYPES).map(([type, ext]) => [ext, type]));
const NAME_RE = /^[0-9a-f-]{36}\.(jpg|png|webp|avif|gif)$/;

export function isBlobUrl(url: string) {
  try {
    return new URL(url).hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

export async function savePoster(file: File) {
  const ext = TYPES[file.type];
  if (!ext) throw new Error("Please upload a JPG, PNG, WebP, AVIF or GIF image.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("Image is larger than 4 MB. Please compress it and try again.");

  const name = `${randomUUID()}.${ext}`;

  if (useBlob) {
    const blob = await put(`posters/${name}`, file, {
      access: "public",
      contentType: file.type,
      cacheControlMaxAge: 60 * 60 * 24 * 365,
    });
    return blob.url;
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
  return `${UPLOAD_URL_PREFIX}${name}`;
}

export async function readUpload(name: string) {
  if (!NAME_RE.test(name)) return null;
  try {
    const data = await readFile(path.join(UPLOAD_DIR, name));
    return { data, contentType: CONTENT_TYPES[name.split(".").pop()!] };
  } catch {
    return null;
  }
}

// Best effort: only deletes files we uploaded (never other external links).
export async function removePoster(url: string | null | undefined) {
  if (!url) return;

  if (isBlobUrl(url)) {
    if (useBlob) await del(url).catch(() => {});
    return;
  }

  if (!url.startsWith(UPLOAD_URL_PREFIX)) return;
  const name = url.slice(UPLOAD_URL_PREFIX.length);
  if (!NAME_RE.test(name)) return;
  await unlink(path.join(UPLOAD_DIR, name)).catch(() => {});
}
