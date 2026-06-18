import Link from "next/link";
import { Header } from "@/components/Brand";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-light">
      <Header brandHref="/admin" />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="card text-center">
          <h1 className="text-lg font-bold text-ink">Project niet gevonden</h1>
          <p className="mt-1 text-sm text-gray-600">
            Dit project bestaat niet (meer).
          </p>
          <Link href="/admin" className="btn-primary mt-4">
            Terug naar overzicht
          </Link>
        </div>
      </main>
    </div>
  );
}
