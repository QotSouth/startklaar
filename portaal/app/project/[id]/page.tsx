import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOwnedProject } from "@/lib/access";
import { Header } from "@/components/Brand";
import { StatusBar } from "@/components/StatusBar";
import { StatusBadge } from "@/components/StatusBadge";
import { FileList } from "@/components/FileList";
import { statusMessage } from "@/lib/status";
import { SUPPORT_EMAIL } from "@/lib/constants";

export const dynamic = "force-dynamic";

function formatDate(value: string | null): string {
  if (!value) return "Nog niet bekend";
  try {
    return new Intl.DateTimeFormat("nl-BE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default async function ProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const project = await getOwnedProject(params.id);

  if (!project) {
    return (
      <div className="min-h-screen bg-light">
        <Header
          right={
            <a href="/auth/signout" className="text-sm font-medium text-purple">
              Uitloggen
            </a>
          }
        />
        <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <div className="card text-center">
            <h1 className="text-lg font-bold text-ink">
              Project niet gevonden
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Dit project bestaat niet of je hebt er geen toegang toe.
            </p>
            <Link href="/dashboard" className="btn-primary mt-4">
              Terug naar mijn projecten
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const mailtoSubjectFiles = encodeURIComponent(
    `Bestanden opnieuw aanvragen — ${project.project_name}`
  );
  const mailtoSubjectChange = encodeURIComponent(
    `Wijziging aanvragen — ${project.project_name}`
  );

  return (
    <div className="min-h-screen bg-light">
      <Header
        right={
          <a href="/auth/signout" className="text-sm font-medium text-purple">
            Uitloggen
          </a>
        }
      />

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
        <div>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-purple"
          >
            ← Terug naar mijn projecten
          </Link>
        </div>

        <div className="card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-ink">
                {project.project_name}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Pakket: {project.package_name || "—"}
              </p>
            </div>
            <StatusBadge status={project.status} />
          </div>
        </div>

        {/* Status / voortgang */}
        <section className="card">
          <h2 className="mb-4 text-base font-semibold text-ink">Voortgang</h2>
          <StatusBar status={project.status} />
          <p className="mt-4 rounded-lg bg-purple/5 px-4 py-3 text-sm text-ink">
            {statusMessage(project.status)}
          </p>
          <p className="mt-4 text-sm text-gray-600">
            <span className="font-medium text-ink">
              Verwachte opleverdatum:
            </span>{" "}
            {formatDate(project.expected_delivery_date)}
          </p>
        </section>

        {/* Bericht van Startklaar */}
        {project.client_message && (
          <section className="card">
            <h2 className="mb-2 text-base font-semibold text-ink">
              Bericht van Startklaar
            </h2>
            <p className="whitespace-pre-line text-sm text-gray-700">
              {project.client_message}
            </p>
          </section>
        )}

        {/* Bestanden */}
        <section className="card">
          <h2 className="mb-4 text-base font-semibold text-ink">
            Jouw bestanden
          </h2>
          <FileList projectId={project.id} files={project.project_files} />
        </section>

        {/* Acties (mailto voor nu) */}
        <section className="card">
          <h2 className="mb-3 text-base font-semibold text-ink">Hulp nodig?</h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=${mailtoSubjectFiles}`}
              className="btn-secondary flex-1"
            >
              Bestanden opnieuw aanvragen
            </a>
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=${mailtoSubjectChange}`}
              className="btn-cta flex-1"
            >
              Vraag wijziging aan
            </a>
          </div>
        </section>

        {/*
          ============================================================
          PLACEHOLDER — Toekomstige integraties (MVP)
          ------------------------------------------------------------
          Hieronder komen later:
          - Betalingen (bv. Stripe / Mollie checkout per project)
          - Intake-flow (vragenlijst die de klant zelf invult)
          Deze sectie is bewust leeg gelaten als duidelijk ankerpunt.
          ============================================================
        */}
        {/* <section className="card">Betalingen & intake komen hier.</section> */}
      </main>
    </div>
  );
}
