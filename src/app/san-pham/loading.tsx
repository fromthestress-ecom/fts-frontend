export default function Loading() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        <aside className="w-full flex-shrink-0 lg:w-64">
          <div className="mb-4 h-6 w-20 animate-pulse rounded bg-border" />
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-4 w-32 animate-pulse rounded bg-border" />
            ))}
          </div>
        </aside>
        <div className="flex-1">
          <ul className="grid list-none grid-cols-2 gap-4 p-0 m-0 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <li key={i} className="overflow-hidden rounded-lg border border-border bg-surface">
                <div className="aspect-square animate-pulse bg-border" />
                <div className="p-3">
                  <div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-border" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-border" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
