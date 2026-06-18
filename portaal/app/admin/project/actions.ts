"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";
import { ALL_STATUSES } from "@/lib/status";
import { FILE_CATEGORIES, STORAGE_BUCKET } from "@/lib/constants";

export type ProjectFormState = { error?: string; saved?: boolean };

// Find an existing client by email or create one, returning its id.
async function upsertClient(
  email: string,
  name: string,
  phone: string
): Promise<string> {
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("clients")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existing?.id) {
    // Keep client details up to date.
    await supabase
      .from("clients")
      .update({ name: name || null, phone: phone || null })
      .eq("id", existing.id);
    return existing.id;
  }

  const { data: created, error } = await supabase
    .from("clients")
    .insert({ email, name: name || null, phone: phone || null })
    .select("id")
    .single();

  if (error || !created) {
    throw new Error(error?.message || "Kon klant niet aanmaken.");
  }
  return created.id;
}

function parseForm(formData: FormData) {
  const email = ((formData.get("email") as string) || "").trim().toLowerCase();
  const name = ((formData.get("name") as string) || "").trim();
  const phone = ((formData.get("phone") as string) || "").trim();
  const project_name = ((formData.get("project_name") as string) || "").trim();
  const package_name = ((formData.get("package_name") as string) || "").trim();
  const status = ((formData.get("status") as string) || "").trim();
  const expected_delivery_date =
    ((formData.get("expected_delivery_date") as string) || "").trim() || null;
  const client_message =
    ((formData.get("client_message") as string) || "").trim() || null;
  const internal_notes =
    ((formData.get("internal_notes") as string) || "").trim() || null;

  return {
    email,
    name,
    phone,
    project_name,
    package_name: package_name || null,
    status,
    expected_delivery_date,
    client_message,
    internal_notes,
  };
}

function validate(values: ReturnType<typeof parseForm>): string | null {
  if (!values.email || !values.email.includes("@")) {
    return "Vul een geldig e-mailadres in.";
  }
  if (!values.project_name) {
    return "Vul een projectnaam in.";
  }
  if (!ALL_STATUSES.includes(values.status as never)) {
    return "Ongeldige status gekozen.";
  }
  return null;
}

export async function createProjectAction(
  _prev: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  requireAdmin();
  const values = parseForm(formData);
  const validationError = validate(values);
  if (validationError) return { error: validationError };

  const supabase = createAdminClient();

  let newId: string;
  try {
    const clientId = await upsertClient(
      values.email,
      values.name,
      values.phone
    );

    const { data, error } = await supabase
      .from("projects")
      .insert({
        client_id: clientId,
        project_name: values.project_name,
        package_name: values.package_name,
        status: values.status,
        expected_delivery_date: values.expected_delivery_date,
        client_message: values.client_message,
        internal_notes: values.internal_notes,
      })
      .select("id")
      .single();

    if (error || !data) {
      return { error: error?.message || "Kon project niet aanmaken." };
    }
    newId = data.id;
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Er ging iets mis.",
    };
  }

  revalidatePath("/admin");
  redirect(`/admin/project/${newId}`);
}

export async function updateProjectAction(
  projectId: string,
  _prev: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  requireAdmin();
  const values = parseForm(formData);
  const validationError = validate(values);
  if (validationError) return { error: validationError };

  const supabase = createAdminClient();

  try {
    const clientId = await upsertClient(
      values.email,
      values.name,
      values.phone
    );

    const { error } = await supabase
      .from("projects")
      .update({
        client_id: clientId,
        project_name: values.project_name,
        package_name: values.package_name,
        status: values.status,
        expected_delivery_date: values.expected_delivery_date,
        client_message: values.client_message,
        internal_notes: values.internal_notes,
      })
      .eq("id", projectId);

    if (error) {
      return { error: error.message };
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Er ging iets mis." };
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/project/${projectId}`);
  return { saved: true };
}

export async function uploadFileAction(
  projectId: string,
  _prev: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  requireAdmin();

  const file = formData.get("file") as File | null;
  const category = ((formData.get("file_category") as string) || "").trim();

  if (!file || file.size === 0) {
    return { error: "Kies een bestand om te uploaden." };
  }
  if (!FILE_CATEGORIES.includes(category as never)) {
    return { error: "Kies een geldige categorie." };
  }

  const supabase = createAdminClient();

  // Store under project-scoped path: <projectId>/<timestamp>-<name>
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${projectId}/${Date.now()}-${safeName}`;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, arrayBuffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      return { error: `Upload mislukt: ${uploadError.message}` };
    }

    const { error: insertError } = await supabase.from("project_files").insert({
      project_id: projectId,
      file_name: file.name,
      file_category: category,
      storage_path: storagePath,
      file_url: null,
    });

    if (insertError) {
      // Roll back the storage upload to avoid orphans.
      await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
      return { error: `Kon bestand niet opslaan: ${insertError.message}` };
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload mislukt." };
  }

  revalidatePath(`/admin/project/${projectId}`);
  return {};
}

export async function deleteFileAction(
  formData: FormData
): Promise<void> {
  requireAdmin();

  const fileId = (formData.get("file_id") as string) || "";
  const projectId = (formData.get("project_id") as string) || "";
  if (!fileId) return;

  const supabase = createAdminClient();

  const { data: fileRow } = await supabase
    .from("project_files")
    .select("storage_path")
    .eq("id", fileId)
    .maybeSingle();

  if (fileRow?.storage_path) {
    await supabase.storage.from(STORAGE_BUCKET).remove([fileRow.storage_path]);
  }

  await supabase.from("project_files").delete().eq("id", fileId);

  if (projectId) {
    revalidatePath(`/admin/project/${projectId}`);
  }
}
