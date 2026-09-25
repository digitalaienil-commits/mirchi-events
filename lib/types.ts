export type Category = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
};

export type EventRecord = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  category_id: string | null;
  poster_url: string | null;
  start_date: string | null;
  end_date: string | null;
  date_label: string | null;
  venue: string | null;
  city: string | null;
  price_label: string | null;
  cta_label: string;
  external_url: string;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number;
};

export type EventWithCategory = EventRecord & {
  category: Pick<Category, "id" | "name" | "slug"> | null;
};

export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};
