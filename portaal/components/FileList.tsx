import {
  FILE_CATEGORIES,
  FILE_CATEGORY_LABELS,
  type FileCategory,
} from "@/lib/constants";

export type PortalFile = {
  id: string;
  file_name: string | null;
  file_category: string | null;
  storage_path: string | null;
};

// Customer-facing file list grouped by category with signed-url download links.
// Downloads go through /project/[id]/download which verifies ownership.
export function FileList({
  projectId,
  files,
}: {
  projectId: string;
  files: PortalFile[];
}) {
  if (!files || files.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        Er staan nog geen bestanden klaar. Zodra je project klaar is, vind je ze
        hier.
      </p>
    );
  }

  const grouped = FILE_CATEGORIES.map((cat) => ({
    category: cat as FileCategory,
    items: files.filter((f) => f.file_category === cat),
  })).filter((g) => g.items.length > 0);

  // Files with an unknown/empty category fall under "overige" visually.
  const known = new Set(FILE_CATEGORIES as string[]);
  const others = files.filter((f) => !f.file_category || !known.has(f.file_category));
  if (others.length > 0) {
    const overige = grouped.find((g) => g.category === "overige");
    if (overige) {
      overige.items = [...overige.items, ...others];
    } else {
      grouped.push({ category: "overige", items: others });
    }
  }

  return (
    <div className="space-y-5">
      {grouped.map((group) => (
        <div key={group.category}>
          <h3 className="mb-2 text-sm font-semibold text-purple">
            {FILE_CATEGORY_LABELS[group.category]}
          </h3>
          <ul className="space-y-2">
            {group.items.map((file) => (
              <li
                key={file.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2"
              >
                <span className="truncate text-sm text-ink">
                  {file.file_name || "Bestand"}
                </span>
                {file.storage_path ? (
                  <a
                    href={`/project/${projectId}/download?path=${encodeURIComponent(
                      file.storage_path
                    )}`}
                    className="btn-cta shrink-0 px-3 py-1.5 text-xs"
                  >
                    Download
                  </a>
                ) : (
                  <span className="text-xs text-gray-400">Niet beschikbaar</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
