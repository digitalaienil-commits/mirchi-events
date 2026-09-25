import Image from "next/image";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-black/5 bg-neutral-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <Image src="/brand/mirchi-logo.png" alt="Radio Mirchi" width={324} height={137} className="h-12 w-auto" />
          <p className="max-w-sm text-sm text-neutral-500">
            Concerts, festivals, marathons and campus contests from Radio Mirchi.
          </p>
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-neutral-600">
          {site.social.map((s) => (
            <li key={s.label}>
              <a href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-mirchi">
                {s.label}
              </a>
            </li>
          ))}
          <li>
            <a href={site.mainSite} target="_blank" rel="noopener noreferrer" className="hover:text-mirchi">
              radiomirchi.com
            </a>
          </li>
        </ul>
      </div>
      <div className="border-t border-black/5 py-5 text-center text-xs text-neutral-400">
        © {new Date().getFullYear()} Radio Mirchi. All rights reserved.
      </div>
    </footer>
  );
}
