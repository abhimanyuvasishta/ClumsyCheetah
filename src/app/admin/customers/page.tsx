import { listAdminCustomers } from "@/lib/admin/customers";

export default async function AdminCustomersPage() {
  const customers = await listAdminCustomers();
  return (
    <div>
      <h1 className="text-xl font-semibold">Customers</h1>
      <p className="mt-1 text-sm text-muted-foreground">Directory only. Passwords never appear here.</p>
      <div className="mt-4 overflow-x-auto rounded-lg border bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b bg-[oklch(0.98_0.004_250)] text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Phone</th>
              <th className="px-3 py-2">Roles</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="px-3 py-2">{c.full_name ?? "—"}</td>
                <td className="px-3 py-2">{c.email ?? "—"}</td>
                <td className="px-3 py-2">{c.phone ?? "—"}</td>
                <td className="px-3 py-2 text-xs">{c.roles.join(", ") || "—"}</td>
                <td className="px-3 py-2 text-xs">{c.status}</td>
              </tr>
            ))}
            {!customers.length ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No profiles yet. Anyone who registers appears here.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
