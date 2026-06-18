import { NextResponse } from "next/server";
import { clearAdminSession } from "@/lib/adminAuth";

async function handle(request: Request) {
  const { origin } = new URL(request.url);
  clearAdminSession();
  return NextResponse.redirect(`${origin}/admin/login`, { status: 303 });
}

export async function POST(request: Request) {
  return handle(request);
}

export async function GET(request: Request) {
  return handle(request);
}
