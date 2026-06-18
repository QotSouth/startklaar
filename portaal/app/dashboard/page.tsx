import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/Brand";
import { StatusBadge } from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

type ProjectRow = {
  id: string;
  project_name: string;
  package_name: string | null;
  status: string;
  created_at: string;
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

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const email = user.email ?? "";

  // Find the client(s) for this email, then their projects.
  // RLS also enforces that only the customer's own rows are returned.
  const { data: clients } = await supabase
    .from("clients")
    .select("id")
    .eq("email", email);

  const clientIds = (clients ?? []).map((c) => c.id);

  let projects: ProjectRow[] = [];
  let loadError = false;

  if (clientIds.length > 0) {
    const { data, error } = await supabase
      .from("projects")
      .select("id, project_name, package_name, status, created_at")
      .in("client_id", clientIds)
      .order("created_at", { ascending: false });

    if (error) {
      loadError = true;
    } else {
      projects = data ?? [];
    }
  }

  return (
    <div className="min-h-screen bg-light">
      <Header
        right={
          <a href="/auth/signout" className="text-sm font-medium text-purple">
            Uitloggen
          </a>
        }
      />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-ink">Mijn projecten</h1>
          <p className="mt-1 text-sm text-gray-600">
            Welkom terug{user.email ? `, ${user.email}` : ""}. Hier vind je al je
            projecten.
          </p>
        </div>

        {loadError && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            Er ging iets mis bij het laden van je projecten. Probeer het later
            opnieuw.
          </p>
        )}

        {projects.length === 0 ? (
          <div className="card text-center">
            <p className="text-base font-semibold text-ink">
              Nog geen projecten
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Zodra we met jouw project starten, verschijnt het hier. Vragen?
              Mail ons gerust.
            </p>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {projects.map((project) => (
              <li key={project.id} className="card flex flex-col">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <h2 className="text-base font-semibold text-ink">
                    {project.project_name}
                  </h2>
                  <StatusBadge status={project.status} />
                </div>
                <dl className="space-y-1 text-sm text-gray-600">
                  <div className="flex gap-2">
                    <dt className="font-medium text-ink">Pakket:</dt>
                    <dd>{project.package_name || "—"}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="font-medium text-ink">Aangemaakt:</dt>
                    <dd>{formatDate(project.created_at)}</dd>
                  </div>
                </dl>
                <div className="mt-4">
                  <Link
                    href={`/project/${project.id}`}
                    className="btn-primary w-full"
                  >
                    Bekijk project
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
