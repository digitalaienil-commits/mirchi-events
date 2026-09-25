import { CategoryManager } from "@/components/admin/CategoryManager";
import { getCategoryEventCounts, listCategories } from "@/lib/data";

export default async function CategoriesPage() {
  const [categories, counts] = await Promise.all([listCategories(), getCategoryEventCounts()]);

  return (
    <>
      <h1 className="text-2xl font-bold text-neutral-900">Categories</h1>
      <p className="mt-1 text-sm text-neutral-500">
        These appear as filter chips on the site, in this order. Chips for empty categories are hidden automatically.
      </p>
      <div className="mt-6 max-w-2xl">
        <CategoryManager categories={categories} counts={counts} />
      </div>
    </>
  );
}
