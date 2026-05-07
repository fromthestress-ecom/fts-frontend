export default function Loading() {
  return (
    <div className="mx-auto max-w-[960px] px-4 py-8 sm:px-6">
      <div className="mb-4 h-4 w-64 animate-pulse rounded bg-border" />
      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2 md:gap-8">
        <div className="aspect-square w-full animate-pulse rounded bg-border" />
        <div className="flex flex-col gap-4">
          <div className="h-8 w-3/4 animate-pulse rounded bg-border" />
          <div className="h-6 w-1/3 animate-pulse rounded bg-border" />
          <div className="h-12 w-full animate-pulse rounded bg-border" />
          <div className="h-12 w-full animate-pulse rounded bg-border" />
        </div>
      </div>
    </div>
  );
}
