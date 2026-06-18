import Link from "next/link";
import { requireAdmin } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Header } from "@/components/Brand";
import { StatusBadge } from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

type AdminProjectRow = {
  id: string;
  project_name: string;
  package_name: string | null;
  status: string;
  created_at: string;
  clients: { name: string | null; email: string } | null;
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("nl-BE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default async function AdminDashboard() {
  requireAdmin();

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("projects")
    .select(
      "id, project_name, package_name, status, created_at, clients(name, email)"
    )
    .order("created_at", { ascending: false });

  const projects = (data ?? []) as unknown as AdminProjectRow[];

  return (
    <div className="min-h-screen bg-light">
      <Header
        brandHref="/admin"
        right={
          <a href="/admin/signout" className="text-sm font-medium text-purple">
            Uitloggen
          </a>
        }
      />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-ink">Alle projecten</h1>
            <p className="mt-1 text-sm text-gray-600">Beheer van projecten.</p>
          </div>
          <Link href="/admin/project/new" className="btn-cta">
            + Nieuw project
          </Link>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            Er ging iets mis bij het laden van de projecten: {error.message}
          </p>
        )}

        {projects.length === 0 ? (
          <div className="card text-center">
            <p className="text-base font-semibold text-ink">
              Nog geen projecten
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Maak een eerste project aan met de knop hierboven.
            </p>
          </div>
        ) : (
          <>
            {/* Tabel op desktop */}
            <div className="hidden overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Klantnaam</th>
                    <th className="px-4 py-3">E-mail</th>
                    <th className="px-4 py-3">Projectnaam</th>
                    <th className="px-4 py-3">Pakket</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Datum</th>
                    <th className="px-4 py-3 text-right">Actie</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {projects.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-ink">
                        {p.clients?.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {p.clients?.email || "—"}
                      </td>
                      <td className="px-4 py-3 font-medium text-ink">
                        {p.project_name}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {p.package_name || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatDate(p.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/project/${p.id}`}
                          className="btn-secondary px-3 py-1.5 text-xs"
                        >
                          Bewerken
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Kaarten op mobiel */}
            <ul className="space-y-3 md:hidden">
              {projects.map((p) => (
                <li key={p.id} className="card">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h2 className="font-semibold text-ink">{p.project_name}</h2>
                    <StatusBadge status={p.status} />
                  </div>
                  <dl className="space-y-1 text-sm text-gray-600">
                    <div className="flex gap-2">
                      <dt className="font-medium text-ink">Klant:</dt>
                      <dd>{p.clients?.name || "—"}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="font-medium text-ink">E-mail:</dt>
                      <dd className="truncate">{p.clients?.email || "—"}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="font-medium text-ink">Pakket:</dt>
                      <dd>{p.package_name || "—"}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="font-medium text-ink">Datum:</dt>
                      <dd>{formatDate(p.created_at)}</dd>
                    </div>
                  </dl>
                  <Link
                    href={`/admin/project/${p.id}`}
                    className="btn-secondary mt-3 w-full"
                  >
                    Bewerken
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}
