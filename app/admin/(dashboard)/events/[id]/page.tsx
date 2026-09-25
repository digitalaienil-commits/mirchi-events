import { notFound } from "next/navigation";
import { EventForm } from "@/components/admin/EventForm";
import { getEvent, listCategories } from "@/lib/data";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [event, categories] = await Promise.all([getEvent(id), listCategories()]);
  if (!event) notFound();

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Edit event</h1>
      <EventForm event={event} categories={categories} />
    </>
  );
}
