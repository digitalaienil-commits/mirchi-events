import Image from "next/image";

const palettes: Record<string, string> = {
  festivals: "from-[#e31e24] via-[#f2552c] to-[#f9b233]",
  music: "from-[#7b1fa2] via-[#e31e24] to-[#ff7a45]",
  sports: "from-[#0f7b3f] via-[#3dae2b] to-[#b6e05a]",
  campus: "from-[#3b2bd9] via-[#b72bd9] to-[#ff5f8f]",
  comedy: "from-[#f59e0b] via-[#f97316] to-[#e31e24]",
};

type Props = {
  src: string | null;
  title: string;
  categorySlug?: string | null;
  sizes: string;
  priority?: boolean;
  className?: string;
};

// Uploaded posters (local /uploads/... or Vercel Blob) go through Next's image optimiser;
// pasted links from other sites load as-is.
function isOptimisable(src: string) {
  if (src.startsWith("/uploads/")) return true;
  try {
    return new URL(src).hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

export function Poster({ src, title, categorySlug, sizes, priority, className = "" }: Props) {
  if (src) {
    return (
      <Image
        src={src}
        alt={title}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized={!isOptimisable(src)}
        className={`object-cover ${className}`}
      />
    );
  }

  const palette = palettes[categorySlug ?? ""] ?? palettes.festivals;
  return (
    <div
      role="img"
      aria-label={title}
      className={`@container absolute inset-0 overflow-hidden bg-gradient-to-br ${palette} ${className}`}
    >
      <div className="absolute -right-10 -top-10 size-48 rounded-full bg-white/15" />
      <div className="absolute -bottom-16 -left-12 size-56 rounded-full bg-black/10" />
      <div className="absolute right-6 top-1/3 size-20 rounded-full border-[10px] border-white/20" />
      <div className="absolute inset-0 flex flex-col justify-end gap-2 p-5 text-white">
        <span className="text-[clamp(7px,4.5cqw,10px)] font-semibold uppercase tracking-[0.25em] text-white/80">
          Mirchi Events
        </span>
        <span className="line-clamp-4 text-[clamp(0.8rem,11cqw,1.75rem)] font-extrabold leading-tight drop-shadow-sm">{title}</span>
      </div>
    </div>
  );
}
