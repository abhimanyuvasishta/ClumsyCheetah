import Link from "next/link";
import { listAdminCollections } from "@/lib/admin/catalog";
import { deleteCollection } from "@/app/admin/collections/actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = { title: "Collections" };
export const dynamic = "force-dynamic";

export default async function AdminCollectionsPage() {
  const collections = await listAdminCollections();
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Collection pages</h1>
          <p className="mt-1 text-sm text-muted-foreground">These appear at /collections/your-slug on the shop.</p>
        </div>
        <Link href="/admin/collections/new" className={cn(buttonVariants())}>
          New collection
        </Link>
      </div>
      <div className="mt-4 overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Slug</th>
              <th className="px-3 py-2">On site</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {collections.map((c) => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="px-3 py-2">{c.name}</td>
                <td className="px-3 py-2 font-mono text-xs">/collections/{c.slug}</td>
                <td className="px-3 py-2">{c.is_active ? "Yes" : "No"}</td>
                <td className="px-3 py-2 text-right">
                  <Link href={`/admin/collections/${c.id}`} className="mr-3 text-xs underline">
                    Edit
                  </Link>
                  <form action={deleteCollection.bind(null, c.id)} className="inline">
                    <button type="submit" className="text-xs text-destructive underline">
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {!collections.length ? (
              <tr>
                <td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">
                  No collections yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
