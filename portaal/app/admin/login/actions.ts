"use server";

import { redirect } from "next/navigation";
import { checkPassword, setAdminSession } from "@/lib/adminAuth";

export type AdminLoginState = { error?: string };

export async function adminLoginAction(
  _prevState: AdminLoginState,
  formData: FormData
): Promise<AdminLoginState> {
  const password = (formData.get("password") as string | null) ?? "";

  if (!process.env.ADMIN_PASSWORD) {
    return {
      error:
        "Adminwachtwoord is niet geconfigureerd op de server (ADMIN_PASSWORD ontbreekt).",
    };
  }

  if (!checkPassword(password)) {
    return { error: "Onjuist wachtwoord. Probeer het opnieuw." };
  }

  setAdminSession();
  redirect("/admin");
}
