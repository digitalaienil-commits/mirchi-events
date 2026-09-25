"use client";

import { useActionState } from "react";
import { login } from "../auth-actions";
import type { FormState } from "@/lib/types";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(login, {});

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-neutral-700">Email</span>
        <input name="email" type="email" required autoComplete="email" className="admin-input mt-1" />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-neutral-700">Password</span>
        <input name="password" type="password" required autoComplete="current-password" className="admin-input mt-1" />
      </label>
      {state.error && (
        <p role="alert" className="rounded-xl bg-mirchi-soft px-3 py-2 text-sm text-mirchi-dark">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
