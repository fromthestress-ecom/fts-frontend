export default function Loading() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
      <div className="mb-6 h-8 w-48 animate-pulse rounded bg-border" />
      <div className="flex flex-col items-start gap-8 lg:flex-row lg:gap-12">
        <div className="w-full flex-shrink-0 lg:w-64">
          <div className="flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-5 w-32 animate-pulse rounded bg-border" />
            ))}
          </div>
        </div>
        <div className="grid w-full grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="aspect-square w-full animate-pulse rounded bg-border" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-border" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-border" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
