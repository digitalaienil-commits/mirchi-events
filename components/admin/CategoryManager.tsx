"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { createCategory, deleteCategory, renameCategory, reorderCategories } from "@/app/admin/actions";
import type { Category, FormState } from "@/lib/types";

export function CategoryManager({ categories, counts }: { categories: Category[]; counts: Record<string, number> }) {
  const [items, setItems] = useState(categories);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [createState, createAction, creating] = useActionState<FormState, FormData>(createCategory, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => setItems(categories), [categories]);
  useEffect(() => {
    if (!creating && !createState.error) formRef.current?.reset();
  }, [creating, createState]);

  function run(action: () => Promise<FormState | void>, rollback: Category[]) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await action();
        if (result?.error) {
          setItems(rollback);
          setError(result.error);
        }
      } catch (e) {
        setItems(rollback);
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    const previous = items;
    setItems(next);
    run(() => reorderCategories(next.map((c) => c.id)), previous);
  }

  function remove(category: Category) {
    const used = counts[category.id] ?? 0;
    const warning = used ? ` ${used} event(s) will be left without a category.` : "";
    if (!confirm(`Delete "${category.name}"?${warning}`)) return;
    const previous = items;
    setItems(items.filter((c) => c.id !== category.id));
    run(() => deleteCategory(category.id), previous);
  }

  function rename(category: Category, name: string) {
    const previous = items;
    setItems(items.map((c) => (c.id === category.id ? { ...c, name } : c)));
    run(() => renameCategory(category.id, name), previous);
  }

  return (
    <div className="space-y-4">
      <form ref={formRef} action={createAction} className="flex gap-2">
        <label className="flex-1">
          <span className="sr-only">New category name</span>
          <input name="name" required maxLength={40} placeholder="New category, e.g. Comedy" className="admin-input" />
        </label>
        <button type="submit" disabled={creating} className="btn-primary">
          <Plus className="size-4" /> Add
        </button>
      </form>

      {(error || createState.error) && (
        <p role="alert" className="rounded-2xl bg-mirchi-soft px-4 py-3 text-sm text-mirchi-dark">
          {error ?? createState.error}
        </p>
      )}

      <ul className={`divide-y divide-neutral-100 rounded-3xl bg-white shadow-sm ring-1 ring-black/5 ${pending ? "opacity-80" : ""}`}>
        {items.map((category, index) => (
          <CategoryRow
            key={category.id}
            category={category}
            count={counts[category.id] ?? 0}
            first={index === 0}
            last={index === items.length - 1}
            onMove={(delta) => move(index, delta)}
            onRename={(name) => rename(category, name)}
            onDelete={() => remove(category)}
          />
        ))}
        {items.length === 0 && <li className="px-5 py-8 text-center text-sm text-neutral-500">No categories yet.</li>}
      </ul>
    </div>
  );
}

function CategoryRow({
  category,
  count,
  first,
  last,
  onMove,
  onRename,
  onDelete,
}: {
  category: Category;
  count: number;
  first: boolean;
  last: boolean;
  onMove: (delta: number) => void;
  onRename: (name: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);

  function save() {
    const trimmed = name.trim();
    setEditing(false);
    if (trimmed && trimmed !== category.name) onRename(trimmed);
    else setName(category.name);
  }

  const iconButton = "rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-30";

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      {editing ? (
        <form
          className="flex flex-1 items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && (setName(category.name), setEditing(false))}
            maxLength={40}
            aria-label="Category name"
            className="admin-input"
          />
          <button type="submit" aria-label="Save name" className={iconButton}>
            <Check className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Cancel"
            onClick={() => (setName(category.name), setEditing(false))}
            className={iconButton}
          >
            <X className="size-4" />
          </button>
        </form>
      ) : (
        <>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-neutral-900">{category.name}</p>
            <p className="text-xs text-neutral-500">
              {count} {count === 1 ? "event" : "events"}
            </p>
          </div>
          <button type="button" aria-label={`Move ${category.name} up`} disabled={first} onClick={() => onMove(-1)} className={iconButton}>
            <ArrowUp className="size-4" />
          </button>
          <button type="button" aria-label={`Move ${category.name} down`} disabled={last} onClick={() => onMove(1)} className={iconButton}>
            <ArrowDown className="size-4" />
          </button>
          <button type="button" aria-label={`Rename ${category.name}`} onClick={() => setEditing(true)} className={iconButton}>
            <Pencil className="size-4" />
          </button>
          <button
            type="button"
            aria-label={`Delete ${category.name}`}
            onClick={onDelete}
            className="rounded-lg p-2 text-neutral-500 hover:bg-mirchi-soft hover:text-mirchi"
          >
            <Trash2 className="size-4" />
          </button>
        </>
      )}
    </li>
  );
}
