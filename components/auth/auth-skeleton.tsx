export function AuthSkeleton({ kind }: { kind: "login" | "register" }) {
  const fields = kind === "register" ? 3 : 1;
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <div className="h-5 w-24 animate-pulse rounded bg-muted" />
          <div className="h-7 w-48 animate-pulse rounded bg-muted" />
          <div className="h-4 w-64 animate-pulse rounded bg-muted/60" />
        </div>
        <div className="mt-6 space-y-4">
          {Array.from({ length: fields }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-16 animate-pulse rounded bg-muted/60" />
              <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-3">
          <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-40 animate-pulse rounded bg-muted/60" />
        </div>
      </div>
    </div>
  );
}
