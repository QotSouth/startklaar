import Link from "next/link";
import { requireAdmin } from "@/lib/adminAuth";
import { Header } from "@/components/Brand";
import { ProjectForm } from "../ProjectForm";
import { createProjectAction } from "../actions";

export const dynamic = "force-dynamic";

export default function NewProjectPage() {
  requireAdmin();

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

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-4">
          <Link href="/admin" className="text-sm font-medium text-purple">
            ← Terug naar overzicht
          </Link>
        </div>

        <h1 className="mb-6 text-2xl font-bold text-ink">Nieuw project</h1>

        <div className="card">
          <ProjectForm
            action={createProjectAction}
            submitLabel="Project aanmaken"
          />
        </div>

        <p className="mt-4 text-sm text-gray-600">
          Bestanden kan je toevoegen nadat het project is aangemaakt.
        </p>
      </main>
    </div>
  );
}
