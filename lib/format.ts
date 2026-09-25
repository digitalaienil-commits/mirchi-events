import type { EventRecord } from "./types";

function formatDate(value: string, options: Intl.DateTimeFormatOptions) {
  // Dates are stored as plain YYYY-MM-DD; format in UTC so server and browser agree.
  return new Intl.DateTimeFormat("en-IN", { timeZone: "UTC", ...options }).format(
    new Date(`${value}T00:00:00Z`),
  );
}

export function formatEventDate(
  event: Pick<EventRecord, "date_label" | "start_date" | "end_date">,
): string | null {
  if (event.date_label) return event.date_label;
  const { start_date: start, end_date: end } = event;
  if (!start) return null;

  if (!end || end === start) {
    return formatDate(start, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  }

  const sameYear = start.slice(0, 4) === end.slice(0, 4);
  const from = formatDate(start, sameYear ? { day: "numeric", month: "short" } : { day: "numeric", month: "short", year: "numeric" });
  const to = formatDate(end, { day: "numeric", month: "short", year: "numeric" });
  return `${from} – ${to}`;
}

export function formatPlace(event: Pick<EventRecord, "venue" | "city">): string | null {
  return [event.venue, event.city].filter(Boolean).join(", ") || null;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
