"use client";

import { startTransition, useActionState, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { saveEvent } from "@/app/admin/actions";
import { EventCard } from "@/components/site/EventCard";
import type { Category, EventWithCategory, FormState } from "@/lib/types";
import { PosterUpload } from "./PosterUpload";

type Values = {
  title: string;
  subtitle: string;
  category_id: string;
  poster_url: string;
  start_date: string;
  end_date: string;
  date_label: string;
  venue: string;
  city: string;
  price_label: string;
  cta_label: string;
  external_url: string;
  is_published: boolean;
  is_featured: boolean;
};

const CTA_SUGGESTIONS = ["Book tickets", "Register now", "Vote now", "Know more", "Get passes"];

function toValues(event?: EventWithCategory): Values {
  return {
    title: event?.title ?? "",
    subtitle: event?.subtitle ?? "",
    category_id: event?.category_id ?? "",
    poster_url: event?.poster_url ?? "",
    start_date: event?.start_date ?? "",
    end_date: event?.end_date ?? "",
    date_label: event?.date_label ?? "",
    venue: event?.venue ?? "",
    city: event?.city ?? "",
    price_label: event?.price_label ?? "",
    cta_label: event?.cta_label ?? "Book tickets",
    external_url: event?.external_url ?? "",
    is_published: event?.is_published ?? true,
    is_featured: event?.is_featured ?? false,
  };
}

export function EventForm({ event, categories }: { event?: EventWithCategory; categories: Category[] }) {
  const [values, setValues] = useState<Values>(() => toValues(event));
  const [state, formAction, pending] = useActionState<FormState, FormData>(saveEvent, {});
  const errors = state.fieldErrors ?? {};

  const set = <K extends keyof Values>(key: K, value: Values[K]) => setValues((v) => ({ ...v, [key]: value }));
  const text = (key: keyof Values) => ({
    name: key,
    value: values[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => set(key, e.target.value as never),
    "aria-invalid": Boolean(errors[key]),
  });

  const category = categories.find((c) => c.id === values.category_id) ?? null;
  const preview: EventWithCategory = {
    id: event?.id ?? "preview",
    description: null,
    sort_order: 0,
    ...values,
    title: values.title || "Event title",
    subtitle: values.subtitle || null,
    category_id: values.category_id || null,
    category: category && { id: category.id, name: category.name, slug: category.slug },
    poster_url: values.poster_url || null,
    start_date: values.start_date || null,
    end_date: values.end_date || null,
    date_label: values.date_label || null,
    venue: values.venue || null,
    city: values.city || null,
    price_label: values.price_label || null,
    cta_label: values.cta_label || "Book now",
  };

  return (
    <form
      // Submit via a transition rather than `action` so React doesn't reset the fields when validation fails.
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(() => formAction(formData));
      }}
      className="grid gap-8 lg:grid-cols-[1fr_340px]"
    >
      {event && <input type="hidden" name="id" value={event.id} />}
      <input type="hidden" name="poster_url" value={values.poster_url} />

      <div className="space-y-6">
        {state.error && (
          <p role="alert" className="rounded-2xl bg-mirchi-soft px-4 py-3 text-sm text-mirchi-dark">
            {state.error}
          </p>
        )}

        <Section title="Basics">
          <Field label="Event title" required error={errors.title}>
            <input {...text("title")} required maxLength={120} placeholder="Mirchi Rock N Dhol 2026" className="admin-input" />
          </Field>
          <Field label="Tagline" hint="One short line under the title." error={errors.subtitle}>
            <input {...text("subtitle")} placeholder="9-night Navratri garba festival" className="admin-input" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category" error={errors.category_id}>
              <select {...text("category_id")} className="admin-input">
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Price" hint="e.g. ₹249 onwards, Free entry" error={errors.price_label}>
              <input {...text("price_label")} placeholder="₹249 onwards" className="admin-input" />
            </Field>
          </div>
        </Section>

        <Section title="Link">
          <Field
            label="Event page link"
            required
            hint="Where people go when they click the event (tickets, registration or voting)."
            error={errors.external_url}
          >
            <input {...text("external_url")} type="url" required placeholder="https://www.district.in/events/…" className="admin-input" />
          </Field>
          <Field label="Button text" error={errors.cta_label}>
            <input {...text("cta_label")} list="cta-suggestions" maxLength={24} className="admin-input" />
            <datalist id="cta-suggestions">
              {CTA_SUGGESTIONS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </Field>
        </Section>

        <Section title="Poster">
          <PosterUpload
            value={values.poster_url}
            onChange={(url) => set("poster_url", url)}
            title={values.title}
            categorySlug={category?.slug}
            error={errors.poster_url?.[0]}
          />
        </Section>

        <Section title="When & where">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Start date" error={errors.start_date}>
              <input {...text("start_date")} type="date" className="admin-input" />
            </Field>
            <Field label="End date" hint="Leave empty for a one-day event." error={errors.end_date}>
              <input {...text("end_date")} type="date" min={values.start_date || undefined} className="admin-input" />
            </Field>
          </div>
          <Field
            label="Custom date text"
            hint="Optional. Shown instead of the dates, e.g. “Voting live now” or “Oct 2026 – Feb 2027”."
            error={errors.date_label}
          >
            <input {...text("date_label")} className="admin-input" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Venue" error={errors.venue}>
              <input {...text("venue")} placeholder="Akash Aman Party Plot" className="admin-input" />
            </Field>
            <Field label="City" error={errors.city}>
              <input {...text("city")} placeholder="Ahmedabad" className="admin-input" />
            </Field>
          </div>
        </Section>

        <Section title="Visibility">
          <Check
            name="is_published"
            checked={values.is_published}
            onChange={(v) => set("is_published", v)}
            label="Live on the site"
            hint="Turn off to hide the event without deleting it."
          />
          <Check
            name="is_featured"
            checked={values.is_featured}
            onChange={(v) => set("is_featured", v)}
            label="Show in the top banner"
            hint="Featured events rotate in the hero carousel."
          />
        </Section>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={pending} className="btn-primary">
            {pending && <Loader2 className="size-4 animate-spin" />}
            {event ? "Save changes" : "Create event"}
          </button>
          <Link href="/admin" className="btn-secondary">
            Cancel
          </Link>
        </div>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <p className="mb-3 text-sm font-semibold text-neutral-500">Preview</p>
        <EventCard event={preview} preview />
      </aside>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
      <h2 className="text-base font-bold text-neutral-900">{title}</h2>
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  required,
  error,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  error?: string[] | string;
  children: React.ReactNode;
}) {
  const message = Array.isArray(error) ? error[0] : error;
  return (
    <label className="block">
      <span className="text-sm font-medium text-neutral-800">
        {label}
        {required && <span className="text-mirchi"> *</span>}
      </span>
      <div className="mt-1">{children}</div>
      {message ? (
        <span className="mt-1 block text-sm text-mirchi">{message}</span>
      ) : (
        hint && <span className="mt-1 block text-xs text-neutral-500">{hint}</span>
      )}
    </label>
  );
}

function Check({
  name,
  checked,
  onChange,
  label,
  hint,
}: {
  name: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-5 shrink-0 accent-mirchi"
      />
      <span>
        <span className="block text-sm font-medium text-neutral-800">{label}</span>
        <span className="block text-xs text-neutral-500">{hint}</span>
      </span>
    </label>
  );
}
