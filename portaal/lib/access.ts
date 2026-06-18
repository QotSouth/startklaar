import { createClient } from "@/lib/supabase/server";

export type ProjectWithFiles = {
  id: string;
  project_name: string;
  package_name: string | null;
  status: string;
  expected_delivery_date: string | null;
  client_message: string | null;
  created_at: string;
  client_id: string;
  project_files: {
    id: string;
    file_name: string | null;
    file_category: string | null;
    storage_path: string | null;
  }[];
};

// Loads a project the logged-in customer owns (email matches the client),
// including its files. Returns null when not found or not allowed.
// RLS provides defense-in-depth; we also check the email link explicitly.
export async function getOwnedProject(
  projectId: string
): Promise<ProjectWithFiles | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  const { data: clients } = await supabase
    .from("clients")
    .select("id")
    .eq("email", user.email);

  const clientIds = (clients ?? []).map((c) => c.id);
  if (clientIds.length === 0) return null;

  const { data, error } = await supabase
    .from("projects")
    .select(
      "id, project_name, package_name, status, expected_delivery_date, client_message, created_at, client_id, project_files(id, file_name, file_category, storage_path)"
    )
    .eq("id", projectId)
    .in("client_id", clientIds)
    .maybeSingle();

  if (error || !data) return null;
  return data as ProjectWithFiles;
}
