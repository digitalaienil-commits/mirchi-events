import { query, UUID_RE } from "./db";
import type { Category, EventWithCategory } from "./types";

const EVENT_COLUMNS = `
  e.id, e.title, e.subtitle, e.description, e.category_id, e.poster_url,
  e.start_date, e.end_date, e.date_label, e.venue, e.city, e.price_label,
  e.cta_label, e.external_url, e.is_published, e.is_featured, e.sort_order,
  case when c.id is null then null
       else json_build_object('id', c.id, 'name', c.name, 'slug', c.slug) end as category`;

export async function listEvents({ publishedOnly }: { publishedOnly: boolean }) {
  return query<EventWithCategory>(
    `select ${EVENT_COLUMNS}
       from events e left join categories c on c.id = e.category_id
      ${publishedOnly ? "where e.is_published" : ""}
      order by e.sort_order, e.created_at`,
  );
}

export async function getEvent(id: string) {
  if (!UUID_RE.test(id)) return null;
  const [event] = await query<EventWithCategory>(
    `select ${EVENT_COLUMNS} from events e left join categories c on c.id = e.category_id where e.id = $1`,
    [id],
  );
  return event ?? null;
}

export async function listCategories() {
  return query<Category>("select id, name, slug, sort_order from categories order by sort_order, name");
}

export async function getCategoryEventCounts() {
  const rows = await query<{ category_id: string; count: number }>(
    "select category_id, count(*)::int as count from events where category_id is not null group by category_id",
  );
  return Object.fromEntries(rows.map((r) => [r.category_id, r.count]));
}
