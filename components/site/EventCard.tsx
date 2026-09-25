import { CalendarDays, MapPin } from "lucide-react";
import { formatEventDate, formatPlace } from "@/lib/format";
import type { EventWithCategory } from "@/lib/types";
import { Poster } from "./Poster";

type Props = {
  event: EventWithCategory;
  // Admin form preview: render without the outbound link.
  preview?: boolean;
  priority?: boolean;
};

export function EventCard({ event, preview, priority }: Props) {
  const date = formatEventDate(event);
  const place = formatPlace(event);

  const body = (
    <>
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-100">
        <Poster
          src={event.poster_url}
          title={event.title}
          categorySlug={event.category?.slug}
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
          priority={priority}
          className="transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {event.category && (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-neutral-900 shadow-sm">
            {event.category.name}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-1 pt-4">
        {date && (
          <p className="flex items-center gap-1.5 text-sm font-medium text-mirchi">
            <CalendarDays className="size-4 shrink-0" aria-hidden />
            {date}
          </p>
        )}
        <h3 className="mt-1.5 line-clamp-2 text-lg font-bold leading-snug text-neutral-900">{event.title}</h3>
        {event.subtitle && <p className="mt-1 line-clamp-2 text-sm text-neutral-500">{event.subtitle}</p>}
        {place && (
          <p className="mt-2 flex items-start gap-1.5 text-sm text-neutral-600">
            <MapPin className="mt-0.5 size-4 shrink-0 text-neutral-400" aria-hidden />
            <span className="line-clamp-1">{place}</span>
          </p>
        )}
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className="text-sm font-semibold text-neutral-900">{event.price_label}</span>
          <span className="rounded-full bg-mirchi px-4 py-2 text-sm font-semibold text-white transition-colors group-hover:bg-mirchi-dark">
            {event.cta_label}
          </span>
        </div>
      </div>
    </>
  );

  const className =
    "group flex h-full flex-col rounded-3xl bg-white p-3 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_8px_24px_-12px_rgba(0,0,0,0.15)] ring-1 ring-black/5 transition duration-300";

  if (preview) return <div className={className}>{body}</div>;

  return (
    <a
      href={event.external_url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${className} hover:-translate-y-1 hover:shadow-[0_2px_6px_rgba(0,0,0,0.06),0_20px_40px_-16px_rgba(0,0,0,0.25)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mirchi`}
    >
      {body}
    </a>
  );
}
