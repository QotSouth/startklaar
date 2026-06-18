"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { siteUrl } from "@/lib/constants";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle"
  );
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const trimmed = email.trim();
    if (!trimmed) {
      setStatus("error");
      setError("Vul een geldig e-mailadres in.");
      return;
    }

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: {
          emailRedirectTo: `${siteUrl()}/auth/callback`,
        },
      });

      if (signInError) {
        setStatus("error");
        setError(
          "Er ging iets mis bij het versturen van de inloglink. Probeer het opnieuw."
        );
        return;
      }

      setStatus("sent");
    } catch {
      setStatus("error");
      setError("Er ging iets mis. Controleer je internetverbinding.");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
        <p className="font-semibold">Inloglink verstuurd!</p>
        <p className="mt-1">
          We hebben een e-mail gestuurd naar <strong>{email}</strong>. Klik op
          de link in de mail om in te loggen. Geen mail ontvangen? Controleer je
          spam-map.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="label-field">
          E-mailadres
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jij@voorbeeld.be"
          className="input-field"
        />
      </div>

      {status === "error" && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="btn-primary w-full"
      >
        {status === "loading" ? "Bezig..." : "Stuur inloglink"}
      </button>
    </form>
  );
}
