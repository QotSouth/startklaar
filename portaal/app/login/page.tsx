import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Brand } from "@/components/Brand";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-light px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Brand href="/login" />
        </div>
        <div className="card">
          <h1 className="mb-1 text-xl font-bold text-ink">Inloggen</h1>
          <p className="mb-5 text-sm text-gray-600">
            Vul je e-mailadres in. Je ontvangt een veilige inloglink in je
            mailbox.
          </p>
          {searchParams.error && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {searchParams.error}
            </p>
          )}
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-xs text-gray-500">
          Ben je beheerder?{" "}
          <a href="/admin/login" className="font-medium text-purple underline">
            Admin login
          </a>
        </p>
      </div>
    </main>
  );
}
