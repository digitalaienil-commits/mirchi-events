"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { isUniqueViolation, query, UUID_RE } from "@/lib/db";
import { slugify } from "@/lib/format";
import type { FormState } from "@/lib/types";
import { removePoster } from "@/lib/uploads";
import { categorySchema, eventSchema, type EventInput } from "@/lib/validation";

function refresh() {
  revalidatePath("/");
  revalidatePath("/admin", "layout");
}

function assertIds(ids: string[]) {
  if (!ids.every((id) => UUID_RE.test(id))) throw new Error("Invalid id.");
}

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : "Something went wrong.");

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

// Column names come from the zod schema, never from user input.
const EVENT_FIELDS = [
  "title", "subtitle", "category_id", "poster_url", "start_date", "end_date", "date_label",
  "venue", "city", "price_label", "cta_label", "external_url", "is_published", "is_featured",
] as const satisfies readonly (keyof EventInput)[];

export async function saveEvent(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const parsed = eventSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { id, ...values } = parsed.data;
  const params = EVENT_FIELDS.map((f) => values[f]);

  try {
    if (id) {
      const [previous] = await query<{ poster_url: string | null }>("select poster_url from events where id = $1", [id]);
      if (!previous) return { error: "This event no longer exists." };

      const set = EVENT_FIELDS.map((f, i) => `${f} = $${i + 1}`).join(", ");
      await query(`update events set ${set} where id = $${EVENT_FIELDS.length + 1}`, [...params, id]);
      if (previous.poster_url !== values.poster_url) await removePoster(previous.poster_url);
    } else {
      // New events go to the top of the list.
      const placeholders = EVENT_FIELDS.map((_, i) => `$${i + 1}`).join(", ");
      await query(
        `insert into events (${EVENT_FIELDS.join(", ")}, sort_order)
         values (${placeholders}, coalesce((select min(sort_order) from events), 1) - 1)`,
        params,
      );
    }
  } catch (error) {
    return { error: errorMessage(error) };
  }

  refresh();
  redirect("/admin?saved=1");
}

export async function setEventFlag(id: string, field: "is_published" | "is_featured", value: boolean) {
  await requireAdmin();
  assertIds([id]);
  if (field !== "is_published" && field !== "is_featured") throw new Error("Invalid field.");
  await query(`update events set ${field} = $1 where id = $2`, [value === true, id]);
  refresh();
}

export async function reorderEvents(ids: string[]) {
  await requireAdmin();
  assertIds(ids);
  await query(
    `update events set sort_order = x.ord
       from unnest($1::uuid[]) with ordinality as x(id, ord)
      where events.id = x.id`,
    [ids],
  );
  refresh();
}

export async function deleteEvent(id: string) {
  await requireAdmin();
  assertIds([id]);
  const [deleted] = await query<{ poster_url: string | null }>("delete from events where id = $1 returning poster_url", [id]);
  await removePoster(deleted?.poster_url);
  refresh();
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export async function createCategory(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const parsed = categorySchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await query(
      `insert into categories (name, slug, sort_order)
       values ($1, $2, coalesce((select max(sort_order) from categories), 0) + 1)`,
      [parsed.data.name, slugify(parsed.data.name)],
    );
  } catch (error) {
    return { error: isUniqueViolation(error) ? "That category already exists." : errorMessage(error) };
  }

  refresh();
  return {};
}

export async function renameCategory(id: string, name: string): Promise<FormState> {
  await requireAdmin();
  assertIds([id]);

  const parsed = categorySchema.safeParse({ name });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await query("update categories set name = $1, slug = $2 where id = $3", [
      parsed.data.name,
      slugify(parsed.data.name),
      id,
    ]);
  } catch (error) {
    return { error: isUniqueViolation(error) ? "That category already exists." : errorMessage(error) };
  }

  refresh();
  return {};
}

export async function reorderCategories(ids: string[]) {
  await requireAdmin();
  assertIds(ids);
  await query(
    `update categories set sort_order = x.ord
       from unnest($1::uuid[]) with ordinality as x(id, ord)
      where categories.id = x.id`,
    [ids],
  );
  refresh();
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  assertIds([id]);
  // Events in this category are kept; their category is cleared (on delete set null).
  await query("delete from categories where id = $1", [id]);
  refresh();
}
