// Shared status definitions for projects.
// DB value -> Dutch label, ordered progress steps, and a short Dutch message.

export type ProjectStatus =
  | "intake_received"
  | "in_design"
  | "feedback_requested"
  | "finalizing"
  | "ready_for_download"
  | "completed";

export const ALL_STATUSES: ProjectStatus[] = [
  "intake_received",
  "in_design",
  "feedback_requested",
  "finalizing",
  "ready_for_download",
  "completed",
];

// The 5 ordered steps shown in the progress bar.
// "completed" is a final/extra state shown after the bar is fully filled.
export const PROGRESS_STEPS: ProjectStatus[] = [
  "intake_received",
  "in_design",
  "feedback_requested",
  "finalizing",
  "ready_for_download",
];

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  intake_received: "Intake ontvangen",
  in_design: "In ontwerp",
  feedback_requested: "Feedback gevraagd",
  finalizing: "In afwerking",
  ready_for_download: "Klaar voor download",
  completed: "Afgerond",
};

export const STATUS_MESSAGES: Record<ProjectStatus, string> = {
  intake_received:
    "We hebben je intake goed ontvangen. We gaan binnenkort voor je aan de slag!",
  in_design:
    "Je ontwerp is in volle gang. Onze ontwerpers werken aan jouw project.",
  feedback_requested:
    "We hebben je feedback nodig. Bekijk de berichten en laat ons weten wat je ervan vindt.",
  finalizing:
    "We zijn de laatste details aan het afwerken. Bijna klaar!",
  ready_for_download:
    "Je bestanden staan klaar! Je kan ze hieronder downloaden.",
  completed:
    "Dit project is afgerond. Bedankt voor je vertrouwen in Startklaar!",
};

// Tailwind classes for the colored status badge per status.
export const STATUS_BADGE_CLASSES: Record<ProjectStatus, string> = {
  intake_received: "bg-purple/10 text-purple",
  in_design: "bg-blue-100 text-blue-700",
  feedback_requested: "bg-orange/15 text-orange-dark",
  finalizing: "bg-amber-100 text-amber-700",
  ready_for_download: "bg-green-100 text-green-700",
  completed: "bg-emerald-600/10 text-emerald-700",
};

export function statusLabel(status: string): string {
  return STATUS_LABELS[status as ProjectStatus] ?? status;
}

export function statusMessage(status: string): string {
  return (
    STATUS_MESSAGES[status as ProjectStatus] ??
    "Status van je project wordt bijgewerkt."
  );
}

export function statusBadgeClasses(status: string): string {
  return (
    STATUS_BADGE_CLASSES[status as ProjectStatus] ?? "bg-gray-100 text-gray-700"
  );
}

// Index of the status within the progress bar.
// Returns the last step index for "completed".
export function statusStepIndex(status: string): number {
  if (status === "completed") return PROGRESS_STEPS.length - 1;
  const idx = PROGRESS_STEPS.indexOf(status as ProjectStatus);
  return idx === -1 ? 0 : idx;
}

export function isCompleted(status: string): boolean {
  return status === "completed";
}
