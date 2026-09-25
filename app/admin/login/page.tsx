import Image from "next/image";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Admin sign in | Mirchi Events" };

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-sm ring-1 ring-black/5">
        <Image src="/brand/mirchi-logo.png" alt="Radio Mirchi" width={324} height={137} className="mx-auto h-14 w-auto" priority />
        <h1 className="mt-6 text-center text-xl font-bold text-neutral-900">Events admin</h1>
        <p className="mt-1 text-center text-sm text-neutral-500">Sign in with your admin account</p>
        <LoginForm />
      </div>
    </main>
  );
}
