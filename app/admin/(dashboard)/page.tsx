import Link from "next/link";
import { Plus } from "lucide-react";
import { SortableEventList } from "@/components/admin/SortableEventList";
import { listEvents } from "@/lib/data";

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const events = await listEvents({ publishedOnly: false });

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Events</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Drag to reorder. <strong>Live</strong> shows the event on the site; <strong>Hero</strong> puts it in the top banner.
          </p>
        </div>
        <Link href="/admin/events/new" className="btn-primary">
          <Plus className="size-4" /> New event
        </Link>
      </div>

      {saved && (
        <p role="status" className="mt-6 rounded-2xl bg-leaf-soft px-4 py-3 text-sm font-medium text-green-800">
          Event saved. The public page is updated.
        </p>
      )}

      <div className="mt-6">
        {events.length > 0 ? (
          <SortableEventList initialEvents={events} />
        ) : (
          <div className="rounded-3xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
            <p className="font-semibold text-neutral-900">No events yet</p>
            <p className="mt-1 text-sm text-neutral-500">Create your first event to show it on the site.</p>
            <Link href="/admin/events/new" className="btn-primary mt-5">
              <Plus className="size-4" /> New event
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
