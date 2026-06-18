"use client";

import { useFormState, useFormStatus } from "react-dom";
import { type ProjectFormState } from "./actions";
import { PACKAGE_OPTIONS } from "@/lib/constants";
import { ALL_STATUSES, STATUS_LABELS } from "@/lib/status";

export type ProjectFormValues = {
  email: string;
  name: string;
  phone: string;
  project_name: string;
  package_name: string;
  status: string;
  expected_delivery_date: string;
  client_message: string;
  internal_notes: string;
};

const empty: ProjectFormValues = {
  email: "",
  name: "",
  phone: "",
  project_name: "",
  package_name: "",
  status: "intake_received",
  expected_delivery_date: "",
  client_message: "",
  internal_notes: "",
};

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? "Bezig met opslaan..." : label}
    </button>
  );
}

export function ProjectForm({
  action,
  initial,
  submitLabel,
  savedMessage,
}: {
  action: (
    state: ProjectFormState,
    formData: FormData
  ) => Promise<ProjectFormState>;
  initial?: Partial<ProjectFormValues>;
  submitLabel: string;
  savedMessage?: string;
}) {
  const [state, formAction] = useFormState(action, { saved: false });
  const values = { ...empty, ...initial };
  const showSaved = Boolean(savedMessage && state?.saved && !state.error);

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {showSaved && (
        <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {savedMessage}
        </p>
      )}

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-purple">Klant</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="label-field">
              Klantnaam
            </label>
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={values.name}
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="phone" className="label-field">
              Telefoon
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={values.phone}
              className="input-field"
            />
          </div>
        </div>
        <div>
          <label htmlFor="email" className="label-field">
            E-mailadres <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={values.email}
            className="input-field"
          />
          <p className="mt-1 text-xs text-gray-500">
            De klant logt met dit e-mailadres in en ziet enkel projecten die
            hieraan gekoppeld zijn.
          </p>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-purple">Project</legend>
        <div>
          <label htmlFor="project_name" className="label-field">
            Projectnaam <span className="text-red-500">*</span>
          </label>
          <input
            id="project_name"
            name="project_name"
            type="text"
            required
            defaultValue={values.project_name}
            className="input-field"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="package_name" className="label-field">
              Pakket
            </label>
            <select
              id="package_name"
              name="package_name"
              defaultValue={values.package_name}
              className="input-field"
            >
              <option value="">— Kies een pakket —</option>
              {PACKAGE_OPTIONS.map((pkg) => (
                <option key={pkg} value={pkg}>
                  {pkg}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="status" className="label-field">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              name="status"
              defaultValue={values.status}
              className="input-field"
            >
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="expected_delivery_date" className="label-field">
            Verwachte opleverdatum
          </label>
          <input
            id="expected_delivery_date"
            name="expected_delivery_date"
            type="date"
            defaultValue={values.expected_delivery_date}
            className="input-field"
          />
        </div>
        <div>
          <label htmlFor="client_message" className="label-field">
            Bericht voor de klant
          </label>
          <textarea
            id="client_message"
            name="client_message"
            rows={3}
            defaultValue={values.client_message}
            className="input-field"
            placeholder="Dit ziet de klant op de projectpagina."
          />
        </div>
        <div>
          <label htmlFor="internal_notes" className="label-field">
            Interne notities (niet zichtbaar voor klant)
          </label>
          <textarea
            id="internal_notes"
            name="internal_notes"
            rows={3}
            defaultValue={values.internal_notes}
            className="input-field"
          />
        </div>
      </fieldset>

      <div>
        <SaveButton label={submitLabel} />
      </div>
    </form>
  );
}
