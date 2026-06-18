import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Header } from "@/components/Brand";
import { ProjectForm } from "../ProjectForm";
import {
  updateProjectAction,
  uploadFileAction,
  deleteFileAction,
  type ProjectFormState,
} from "../actions";
import { UploadForm } from "./UploadForm";
import { FILE_CATEGORY_LABELS, type FileCategory } from "@/lib/constants";

export const dynamic = "force-dynamic";

type ProjectFile = {
  id: string;
  file_name: string | null;
  file_category: string | null;
  storage_path: string | null;
};

function categoryLabel(cat: string | null): string {
  if (!cat) return "Overige";
  return FILE_CATEGORY_LABELS[cat as FileCategory] ?? cat;
}

export default async function AdminEditProjectPage({
  params,
}: {
  params: { id: string };
}) {
  requireAdmin();

  const supabase = createAdminClient();

  const { data: project } = await supabase
    .from("projects")
    .select(
      "id, project_name, package_name, status, expected_delivery_date, client_message, internal_notes, client_id, clients(name, email, phone), project_files(id, file_name, file_category, storage_path, uploaded_at)"
    )
    .eq("id", params.id)
    .maybeSingle();

  if (!project) {
    notFound();
  }

  const clientsRel = project.clients as unknown;
  const client = (Array.isArray(clientsRel)
    ? clientsRel[0] ?? null
    : clientsRel ?? null) as {
    name: string | null;
    email: string;
    phone: string | null;
  } | null;

  const files = ((project.project_files ?? []) as ProjectFile[]).slice();

  // Bind the project id to the update + upload actions.
  const boundUpdate = async (
    state: ProjectFormState,
    formData: FormData
  ): Promise<ProjectFormState> => {
    "use server";
    return updateProjectAction(project.id, state, formData);
  };

  const boundUpload = async (
    state: ProjectFormState,
    formData: FormData
  ): Promise<ProjectFormState> => {
    "use server";
    return uploadFileAction(project.id, state, formData);
  };

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

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="text-sm font-medium text-purple">
            ← Terug naar overzicht
          </Link>
          <Link
            href={`/project/${project.id}`}
            className="text-sm font-medium text-purple"
            target="_blank"
          >
            Klantweergave ↗
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-ink">
          Project bewerken: {project.project_name}
        </h1>

        <div className="card">
          <ProjectForm
            action={boundUpdate}
            submitLabel="Wijzigingen opslaan"
            savedMessage="Wijzigingen opgeslagen."
            initial={{
              email: client?.email ?? "",
              name: client?.name ?? "",
              phone: client?.phone ?? "",
              project_name: project.project_name ?? "",
              package_name: project.package_name ?? "",
              status: project.status ?? "intake_received",
              expected_delivery_date: project.expected_delivery_date ?? "",
              client_message: project.client_message ?? "",
              internal_notes: project.internal_notes ?? "",
            }}
          />
        </div>

        {/* Bestanden */}
        <div className="card">
          <h2 className="mb-4 text-base font-semibold text-ink">Bestanden</h2>

          <UploadForm action={boundUpload} />

          <div className="mt-6">
            {files.length === 0 ? (
              <p className="text-sm text-gray-500">
                Nog geen bestanden geüpload.
              </p>
            ) : (
              <ul className="space-y-2">
                {files.map((file) => (
                  <li
                    key={file.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">
                        {file.file_name || "Bestand"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {categoryLabel(file.file_category)}
                      </p>
                    </div>
                    <form action={deleteFileAction}>
                      <input type="hidden" name="file_id" value={file.id} />
                      <input
                        type="hidden"
                        name="project_id"
                        value={project.id}
                      />
                      <button
                        type="submit"
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                      >
                        Verwijderen
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
