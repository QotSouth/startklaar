"use client";

import { useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { type ProjectFormState } from "../actions";
import { FILE_CATEGORIES, FILE_CATEGORY_LABELS } from "@/lib/constants";

function UploadButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-cta">
      {pending ? "Bezig met uploaden..." : "Uploaden"}
    </button>
  );
}

export function UploadForm({
  action,
}: {
  action: (
    state: ProjectFormState,
    formData: FormData
  ) => Promise<ProjectFormState>;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useFormState(action, {} as ProjectFormState);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await formAction(formData);
        formRef.current?.reset();
      }}
      className="space-y-3"
    >
      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="file_category" className="label-field">
            Categorie
          </label>
          <select
            id="file_category"
            name="file_category"
            required
            defaultValue=""
            className="input-field"
          >
            <option value="" disabled>
              — Kies een categorie —
            </option>
            {FILE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {FILE_CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="file" className="label-field">
            Bestand
          </label>
          <input
            id="file"
            name="file"
            type="file"
            required
            className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-purple file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-purple-dark"
          />
        </div>
      </div>

      <UploadButton />
    </form>
  );
}
