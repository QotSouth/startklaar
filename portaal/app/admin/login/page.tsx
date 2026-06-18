import { redirect } from "next/navigation";
import { Brand } from "@/components/Brand";
import { isAdmin } from "@/lib/adminAuth";
import { AdminLoginForm } from "./AdminLoginForm";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  if (isAdmin()) {
    redirect("/admin");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-light px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Brand href="/admin/login" />
        </div>
        <div className="card">
          <h1 className="mb-1 text-xl font-bold text-ink">Admin login</h1>
          <p className="mb-5 text-sm text-gray-600">
            Voer het adminwachtwoord in om door te gaan.
          </p>
          <AdminLoginForm />
        </div>
        <p className="mt-6 text-center text-xs text-gray-500">
          <a href="/login" className="font-medium text-purple underline">
            Klant login
          </a>
        </p>
      </div>
    </main>
  );
}
