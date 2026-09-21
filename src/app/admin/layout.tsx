import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Users } from "lucide-react";
import { getAuthUser, getStaffSession } from "@/lib/auth/staff";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/products", label: "Catalog", icon: Package },
  { href: "/admin/customers", label: "Customers", icon: Users },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const configured = isSupabaseConfigured();

  if (configured) {
    const user = await getAuthUser();
    if (!user) {
      redirect("/login?next=/admin");
    }
    const staff = await getStaffSession();
    if (!staff) {
      return (
        <div className="flex min-h-full flex-1 items-center justify-center bg-[oklch(0.97_0.005_250)] p-8">
          <div className="max-w-md rounded-lg border bg-white p-6">
            <h1 className="text-lg font-semibold">Staff access required</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              You are signed in as {user.email ?? "this account"}, which has no staff role. Ask an admin to insert a
              row in <code>user_roles</code>. We do not ship a bypass.
            </p>
            <Link href="/" className="mt-4 inline-block text-sm underline">
              Back to store
            </Link>
          </div>
        </div>
      );
    }
  }

  const staff = configured ? await getStaffSession() : null;

  return (
    <div className="admin-shell flex min-h-full flex-1 bg-[oklch(0.97_0.005_250)] text-[oklch(0.22_0.02_250)]">
      <aside className="hidden w-56 shrink-0 border-r border-border bg-[oklch(0.99_0.002_250)] md:flex md:flex-col">
        <div className="border-b px-4 py-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Staff</p>
          <p className="text-sm font-semibold">Clumsy Cheetah Ops</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <p className="px-4 py-3 text-[11px] text-muted-foreground">{staff?.email ?? "Configure Supabase to lock this down"}</p>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b bg-white px-4 py-3 md:px-6">
          <p className="text-sm font-medium">Operations</p>
          <Link href="/" className="text-xs text-muted-foreground hover:underline">
            View storefront
          </Link>
        </header>
        {!configured ? (
          <div className="m-6 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm">
            Supabase is not configured, so this shell is visible for UI work only. After env vars are set, only users
            with a staff role in <code>user_roles</code> can enter. There is no demo password.
          </div>
        ) : null}
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}
