import { statusBadgeClasses, statusLabel } from "@/lib/status";

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClasses(
        status
      )}`}
    >
      {statusLabel(status)}
    </span>
  );
}
