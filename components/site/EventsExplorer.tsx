"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Category, EventWithCategory } from "@/lib/types";
import { EventCard } from "./EventCard";

export function EventsExplorer({
  events,
  categories,
}: {
  events: EventWithCategory[];
  categories: Category[];
}) {
  const [active, setActive] = useState("all");
  const [query, setQuery] = useState("");

  // Only offer chips for categories that currently have events.
  const chips = useMemo(
    () => categories.filter((c) => events.some((e) => e.category?.id === c.id)),
    [categories, events],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter((e) => {
      if (active !== "all" && e.category?.slug !== active) return false;
      if (!q) return true;
      return [e.title, e.subtitle, e.venue, e.city, e.category?.name]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q));
    });
  }, [events, active, query]);

  return (
    <section id="events" className="scroll-mt-24">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-neutral-900 sm:text-3xl">Explore events</h2>
          <p className="mt-1 text-sm text-neutral-500">
            {events.length} {events.length === 1 ? "event" : "events"} from Radio Mirchi
          </p>
        </div>
        <label className="relative w-full md:w-80">
          <span className="sr-only">Search events</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events, venues, cities"
            className="h-11 w-full rounded-full border border-neutral-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-mirchi focus:ring-4 focus:ring-mirchi/10"
          />
        </label>
      </div>

      {chips.length > 0 && (
        <div className="no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0" role="tablist" aria-label="Filter by category">
          {[{ slug: "all", name: "All" }, ...chips].map((chip) => {
            const selected = active === chip.slug;
            return (
              <button
                key={chip.slug}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActive(chip.slug)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
                  selected
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
                }`}
              >
                {chip.name}
              </button>
            );
          })}
        </div>
      )}

      {visible.length > 0 ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((event, i) => (
            <EventCard key={event.id} event={event} priority={i < 3} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-dashed border-neutral-200 px-6 py-16 text-center">
          <p className="text-lg font-semibold text-neutral-900">No events match that</p>
          <p className="mt-1 text-sm text-neutral-500">Try another category or clear your search.</p>
        </div>
      )}
    </section>
  );
}
