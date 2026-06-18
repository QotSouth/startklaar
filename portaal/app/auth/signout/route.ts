import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Signs the customer out and redirects to /login.
async function handle(request: Request) {
  const { origin } = new URL(request.url);
  const supabase = createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(`${origin}/login`, { status: 303 });
}

export async function POST(request: Request) {
  return handle(request);
}

export async function GET(request: Request) {
  return handle(request);
}
