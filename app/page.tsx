import { EventsExplorer } from "@/components/site/EventsExplorer";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { HeroCarousel } from "@/components/site/HeroCarousel";
import { listCategories, listEvents } from "@/lib/data";

// Always read the latest events from the database (cheap for a handful of rows).
export const dynamic = "force-dynamic";

export default async function Home() {
  const [events, categories] = await Promise.all([listEvents({ publishedOnly: true }), listCategories()]);
  const featured = events.filter((e) => e.is_featured);
  const hero = featured.length > 0 ? featured : events.slice(0, 3);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8">
        {events.length === 0 ? (
          <div className="rounded-3xl bg-mirchi-soft px-6 py-24 text-center">
            <h1 className="text-3xl font-extrabold text-neutral-900">New events are coming soon</h1>
            <p className="mt-2 text-neutral-600">Check back shortly for the next Radio Mirchi experience.</p>
          </div>
        ) : (
          <>
            <h1 className="sr-only">Radio Mirchi events</h1>
            <HeroCarousel events={hero} />
            <div className="mt-12 sm:mt-16">
              <EventsExplorer events={events} categories={categories} />
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
