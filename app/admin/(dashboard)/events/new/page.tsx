import { EventForm } from "@/components/admin/EventForm";
import { listCategories } from "@/lib/data";

export default async function NewEventPage() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">New event</h1>
      <EventForm categories={await listCategories()} />
    </>
  );
}
