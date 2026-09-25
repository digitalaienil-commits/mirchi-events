import { z } from "zod";

const optionalText = z
  .string()
  .nullish()
  .transform((v) => v?.trim() || null);

const optionalDate = z
  .string()
  .nullish()
  .transform((v) => v?.trim() || null)
  .refine((v) => v === null || /^\d{4}-\d{2}-\d{2}$/.test(v), "Use a valid date");

const httpUrl = (message: string) =>
  z
    .string()
    .trim()
    .refine((v) => {
      try {
        const url = new URL(v);
        return url.protocol === "https:" || url.protocol === "http:";
      } catch {
        return false;
      }
    }, message);

const optionalUuid = optionalText.refine(
  (v) => v === null || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v),
  "Invalid selection",
);

const checkbox = z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean());

export const eventSchema = z
  .object({
    id: optionalUuid,
    title: z.string().trim().min(2, "Title is required").max(120, "Keep the title under 120 characters"),
    subtitle: optionalText,
    category_id: optionalUuid,
    poster_url: z
      .string()
      .nullish()
      .transform((v) => v?.trim() || null)
      .pipe(
        z.union([
          z.null(),
          z.string().regex(/^\/uploads\/[\w.-]+$/),
          httpUrl("Poster must be an uploaded image or a link starting with https://"),
        ]),
      ),
    start_date: optionalDate,
    end_date: optionalDate,
    date_label: optionalText,
    venue: optionalText,
    city: optionalText,
    price_label: optionalText,
    cta_label: z
      .string()
      .nullish()
      .transform((v) => v?.trim() || "Book now"),
    external_url: httpUrl("Enter the event link, starting with https://"),
    is_published: checkbox,
    is_featured: checkbox,
  })
  .refine((e) => !e.start_date || !e.end_date || e.end_date >= e.start_date, {
    message: "End date can't be before the start date",
    path: ["end_date"],
  });

export type EventInput = z.infer<typeof eventSchema>;

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(40, "Keep it under 40 characters"),
});
