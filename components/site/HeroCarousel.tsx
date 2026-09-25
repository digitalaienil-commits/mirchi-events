"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, CalendarDays, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { formatEventDate, formatPlace } from "@/lib/format";
import type { EventWithCategory } from "@/lib/types";
import { Poster } from "./Poster";

const INTERVAL_MS = 5500;

export function HeroCarousel({ events }: { events: EventWithCategory[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<number | null>(null);
  const count = events.length;

  useEffect(() => {
    if (paused || count < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL_MS);
    return () => clearInterval(timer);
  }, [paused, count]);

  if (count === 0) return null;

  const go = (next: number) => setIndex((next + count) % count);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured events"
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={(e) => (touchStart.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchStart.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStart.current;
        if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
        touchStart.current = null;
      }}
    >
      <div className="overflow-hidden rounded-[28px]">
        <div
          className="flex transition-transform duration-700 ease-[cubic-bezier(.22,.8,.26,1)] motion-reduce:transition-none"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {events.map((event, i) => (
            <HeroSlide key={event.id} event={event} active={i === index} priority={i === 0} label={`${i + 1} of ${count}`} />
          ))}
        </div>
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous event"
            className="absolute left-3 top-1/2 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-900 shadow-lg transition hover:bg-white md:flex"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next event"
            className="absolute right-3 top-1/2 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-900 shadow-lg transition hover:bg-white md:flex"
          >
            <ChevronRight className="size-5" />
          </button>
          <div className="mt-4 flex justify-center gap-2">
            {events.map((event, i) => (
              <button
                key={event.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show ${event.title}`}
                aria-current={i === index}
                className={`h-2 rounded-full transition-all ${i === index ? "w-8 bg-mirchi" : "w-2 bg-neutral-300 hover:bg-neutral-400"}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function HeroSlide({
  event,
  active,
  priority,
  label,
}: {
  event: EventWithCategory;
  active: boolean;
  priority: boolean;
  label: string;
}) {
  const date = formatEventDate(event);
  const place = formatPlace(event);

  return (
    <article
      aria-roledescription="slide"
      aria-label={label}
      inert={!active}
      className="relative w-full shrink-0 overflow-hidden bg-neutral-900"
    >
      {/* Blurred poster fills the backdrop */}
      <div className="absolute inset-0 scale-110 opacity-70 blur-2xl">
        <Poster src={event.poster_url} title="" categorySlug={event.category?.slug} sizes="100vw" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/20" />

      <div className="relative flex flex-col gap-6 p-5 sm:flex-row sm:items-center sm:gap-10 sm:p-10 lg:p-14">
        <div className="relative aspect-[3/4] w-36 shrink-0 overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/20 sm:w-52 lg:w-64">
          <Poster
            src={event.poster_url}
            title={event.title}
            categorySlug={event.category?.slug}
            sizes="(min-width: 1024px) 256px, 208px"
            priority={priority}
          />
        </div>

        <div className="max-w-2xl text-white">
          {event.category && (
            <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur">
              {event.category.name}
            </span>
          )}
          <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">{event.title}</h2>
          {event.subtitle && <p className="mt-2 text-base text-white/80 sm:text-lg">{event.subtitle}</p>}
          <div className="mt-4 flex flex-col gap-2 text-sm text-white/85 sm:text-base">
            {date && (
              <p className="flex items-center gap-2">
                <CalendarDays className="size-4 shrink-0" aria-hidden /> {date}
              </p>
            )}
            {place && (
              <p className="flex items-center gap-2">
                <MapPin className="size-4 shrink-0" aria-hidden /> {place}
              </p>
            )}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <a
              href={event.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-mirchi px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-mirchi-dark sm:text-base"
            >
              {event.cta_label} <ArrowUpRight className="size-4" />
            </a>
            {event.price_label && <span className="text-sm font-semibold text-white/90">{event.price_label}</span>}
          </div>
        </div>
      </div>
    </article>
  );
}
