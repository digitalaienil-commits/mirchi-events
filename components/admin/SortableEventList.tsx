"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ExternalLink, GripVertical, Pencil, Trash2 } from "lucide-react";
import { deleteEvent, reorderEvents, setEventFlag } from "@/app/admin/actions";
import { formatEventDate, formatPlace } from "@/lib/format";
import type { EventWithCategory } from "@/lib/types";
import { Poster } from "@/components/site/Poster";

export function SortableEventList({ initialEvents }: { initialEvents: EventWithCategory[] }) {
  const [events, setEvents] = useState(initialEvents);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Pick up fresh server data after revalidation.
  useEffect(() => setEvents(initialEvents), [initialEvents]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function run(action: () => Promise<void>, rollback: EventWithCategory[]) {
    setError(null);
    startTransition(async () => {
      try {
        await action();
      } catch (e) {
        setEvents(rollback);
        setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      }
    });
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const previous = events;
    const next = arrayMove(
      events,
      events.findIndex((e) => e.id === active.id),
      events.findIndex((e) => e.id === over.id),
    );
    setEvents(next);
    run(() => reorderEvents(next.map((e) => e.id)), previous);
  }

  function toggle(id: string, field: "is_published" | "is_featured", value: boolean) {
    const previous = events;
    setEvents(events.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
    run(() => setEventFlag(id, field, value), previous);
  }

  function remove(event: EventWithCategory) {
    if (!confirm(`Delete "${event.title}"? This can't be undone.`)) return;
    const previous = events;
    setEvents(events.filter((e) => e.id !== event.id));
    run(() => deleteEvent(event.id), previous);
  }

  return (
    <>
      {error && (
        <p role="alert" className="mb-4 rounded-2xl bg-mirchi-soft px-4 py-3 text-sm text-mirchi-dark">
          {error}
        </p>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={events.map((e) => e.id)} strategy={verticalListSortingStrategy}>
          <ul className="space-y-3">
            {events.map((event) => (
              <SortableRow key={event.id} event={event} onToggle={toggle} onDelete={remove} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </>
  );
}

function SortableRow({
  event,
  onToggle,
  onDelete,
}: {
  event: EventWithCategory;
  onToggle: (id: string, field: "is_published" | "is_featured", value: boolean) => void;
  onDelete: (event: EventWithCategory) => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: event.id,
  });

  const meta = [formatEventDate(event), formatPlace(event)].filter(Boolean).join(" · ");

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-black/5 sm:gap-4 ${
        isDragging ? "relative z-10 shadow-xl" : "shadow-sm"
      } ${event.is_published ? "" : "opacity-70"}`}
    >
      <button
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label={`Reorder ${event.title}`}
        className="cursor-grab touch-none rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 active:cursor-grabbing"
      >
        <GripVertical className="size-5" />
      </button>

      <div className="relative aspect-[3/4] w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-100 sm:w-14">
        <Poster src={event.poster_url} title="" categorySlug={event.category?.slug} sizes="56px" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-semibold text-neutral-900">{event.title}</p>
          {event.category && (
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
              {event.category.name}
            </span>
          )}
        </div>
        {meta && <p className="mt-0.5 truncate text-sm text-neutral-500">{meta}</p>}
        <a
          href={event.external_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-0.5 inline-flex max-w-full items-center gap-1 truncate text-xs text-neutral-400 hover:text-mirchi"
        >
          <ExternalLink className="size-3 shrink-0" />
          <span className="truncate">{event.external_url.replace(/^https?:\/\//, "")}</span>
        </a>
      </div>

      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:gap-4">
        <Switch label="Live" checked={event.is_published} onChange={(v) => onToggle(event.id, "is_published", v)} />
        <Switch label="Hero" checked={event.is_featured} onChange={(v) => onToggle(event.id, "is_featured", v)} />
      </div>

      <div className="flex shrink-0 items-center">
        <Link
          href={`/admin/events/${event.id}`}
          aria-label={`Edit ${event.title}`}
          className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
        >
          <Pencil className="size-4" />
        </Link>
        <button
          type="button"
          onClick={() => onDelete(event)}
          aria-label={`Delete ${event.title}`}
          className="rounded-lg p-2 text-neutral-500 hover:bg-mirchi-soft hover:text-mirchi"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </li>
  );
}

function Switch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-neutral-600">
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="relative h-5 w-9 rounded-full bg-neutral-300 transition peer-checked:bg-leaf peer-focus-visible:ring-4 peer-focus-visible:ring-leaf/30 after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-4" />
      {label}
    </label>
  );
}
