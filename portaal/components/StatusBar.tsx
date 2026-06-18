import {
  PROGRESS_STEPS,
  STATUS_LABELS,
  isCompleted,
  statusStepIndex,
} from "@/lib/status";

// 5-step progress bar. The current step is highlighted.
// When the project is "completed", all steps are filled and a banner is shown.
export function StatusBar({ status }: { status: string }) {
  const currentIndex = statusStepIndex(status);
  const completed = isCompleted(status);

  return (
    <div>
      <ol className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-0">
        {PROGRESS_STEPS.map((step, index) => {
          const isDone = completed || index < currentIndex;
          const isCurrent = !completed && index === currentIndex;
          const reached = isDone || isCurrent;

          return (
            <li
              key={step}
              className="flex flex-1 items-center gap-3 sm:flex-col sm:items-center sm:gap-2 sm:text-center"
            >
              <div className="flex items-center sm:w-full sm:flex-col">
                <div className="flex w-full items-center">
                  {/* connector left (hidden on first, desktop only) */}
                  <span
                    className={`hidden h-1 flex-1 sm:block ${
                      index === 0
                        ? "opacity-0"
                        : reached
                        ? "bg-purple"
                        : "bg-gray-200"
                    }`}
                  />
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      isDone
                        ? "bg-purple text-white"
                        : isCurrent
                        ? "bg-orange text-white ring-4 ring-orange/20"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {isDone ? "✓" : index + 1}
                  </span>
                  {/* connector right (hidden on last, desktop only) */}
                  <span
                    className={`hidden h-1 flex-1 sm:block ${
                      index === PROGRESS_STEPS.length - 1
                        ? "opacity-0"
                        : completed || index < currentIndex
                        ? "bg-purple"
                        : "bg-gray-200"
                    }`}
                  />
                </div>
              </div>
              <span
                className={`text-xs sm:mt-1 ${
                  isCurrent
                    ? "font-semibold text-orange-dark"
                    : reached
                    ? "font-medium text-ink"
                    : "text-gray-400"
                }`}
              >
                {STATUS_LABELS[step]}
              </span>
            </li>
          );
        })}
      </ol>

      {completed && (
        <div className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {STATUS_LABELS.completed} — dit project is volledig afgerond.
        </div>
      )}
    </div>
  );
}
