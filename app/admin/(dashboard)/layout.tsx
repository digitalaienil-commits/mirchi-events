import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, LogOut } from "lucide-react";
import { AdminNav } from "@/components/admin/AdminNav";
import { getAdmin } from "@/lib/auth";
import { signOut } from "../auth-actions";

export const metadata = { title: "Admin | Mirchi Events" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-30 border-b border-black/5 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link href="/admin" className="flex shrink-0 items-center gap-2">
            <Image src="/brand/mirchi-logo.png" alt="Radio Mirchi" width={324} height={137} className="h-9 w-auto" />
            <span className="hidden text-sm font-semibold text-neutral-500 sm:inline">Admin</span>
          </Link>
          <AdminNav />
          <div className="ml-auto flex items-center gap-1">
            <Link
              href="/"
              target="_blank"
              className="hidden items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 sm:inline-flex"
            >
              View site <ArrowUpRight className="size-3.5" />
            </Link>
            <form action={signOut}>
              <button
                title={`Sign out ${admin.email}`}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
              >
                <LogOut className="size-4" /> <span className="hidden sm:inline">Sign out</span>
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
