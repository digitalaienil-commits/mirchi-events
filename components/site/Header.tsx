import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { site } from "@/lib/site";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6">
        <Link href="/" className="flex items-center gap-3" aria-label="Mirchi Events home">
          <Image
            src="/brand/mirchi-logo.png"
            alt="Radio Mirchi"
            width={324}
            height={137}
            priority
            className="h-10 w-auto sm:h-12"
          />
          <span className="rounded-full bg-mirchi px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
            Events
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium sm:gap-2">
          <a href="#events" className="rounded-full px-3 py-2 text-neutral-700 hover:bg-neutral-100">
            All events
          </a>
          <a
            href={site.mainSite}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1 rounded-full px-3 py-2 text-neutral-700 hover:bg-neutral-100 sm:inline-flex"
          >
            Radio Mirchi <ArrowUpRight className="size-3.5" />
          </a>
        </nav>
      </div>
    </header>
  );
}
