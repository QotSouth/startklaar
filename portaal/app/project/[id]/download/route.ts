import { NextResponse } from "next/server";
import { getOwnedProject } from "@/lib/access";
import { createClient } from "@/lib/supabase/server";
import { STORAGE_BUCKET } from "@/lib/constants";

// Creates a short-lived signed URL for a file in the private 'project-files'
// bucket, but only after verifying the logged-in customer owns the project
// AND that the requested path actually belongs to this project.
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  if (!path) {
    return NextResponse.json(
      { error: "Geen bestand opgegeven." },
      { status: 400 }
    );
  }

  // Ownership check (also enforced by RLS on the project + files query).
  const project = await getOwnedProject(params.id);
  if (!project) {
    return NextResponse.json(
      { error: "Geen toegang tot dit project." },
      { status: 403 }
    );
  }

  // The requested path must belong to one of this project's files.
  const owns = project.project_files.some((f) => f.storage_path === path);
  if (!owns) {
    return NextResponse.json(
      { error: "Dit bestand hoort niet bij dit project." },
      { status: 403 }
    );
  }

  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(path, 60 * 5); // 5 minutes

  if (error || !data?.signedUrl) {
    return NextResponse.json(
      { error: "Kon de downloadlink niet aanmaken. Probeer het opnieuw." },
      { status: 500 }
    );
  }

  return NextResponse.redirect(data.signedUrl, { status: 302 });
}
