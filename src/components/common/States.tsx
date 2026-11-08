import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { AlertTriangle, Inbox, RefreshCw } from "lucide-react";
import { Component, Suspense, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function ErrorState({
  title = "Veriler yüklenemedi",
  message,
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div role="alert" className="surface flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
        <AlertTriangle className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">
          {message || "Veri kaynağı şu anda yanıt vermiyor. Biraz sonra tekrar deneyin."}
        </p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw /> Tekrar dene
        </Button>
      )}
    </div>
  );
}

export function EmptyState({ title, message, children }: { title: string; message?: string; children?: ReactNode }) {
  return (
    <div className="surface flex flex-col items-center gap-2 px-6 py-10 text-center">
      <Inbox className="h-6 w-6 text-muted-foreground" />
      <p className="font-medium text-foreground">{title}</p>
      {message && <p className="max-w-md text-sm text-muted-foreground">{message}</p>}
      {children}
    </div>
  );
}

export function ListSkeleton({ rows = 4, height = 64 }: { rows?: number; height?: number }) {
  return (
    <div className="space-y-2" aria-busy="true" aria-label="Yükleniyor">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="w-full rounded-xl" style={{ height }} />
      ))}
    </div>
  );
}

class Boundary extends Component<
  { fallback: (reset: () => void, error: Error) => ReactNode; onReset?: () => void; children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info);
  }
  reset = () => {
    this.props.onReset?.();
    this.setState({ error: null });
  };
  render() {
    return this.state.error ? this.props.fallback(this.reset, this.state.error) : this.props.children;
  }
}

/** Isolates one data section: its own skeleton while loading and its own retryable error. */
export function Section({ children, fallback, errorTitle }: { children: ReactNode; fallback?: ReactNode; errorTitle?: string }) {
  const { reset } = useQueryErrorResetBoundary();
  return (
    <Boundary
      onReset={reset}
      fallback={(retry, error) => <ErrorState title={errorTitle} message={error.message} onRetry={retry} />}
    >
      <Suspense fallback={fallback ?? <ListSkeleton />}>{children}</Suspense>
    </Boundary>
  );
}

/** Route-level errorComponent: re-runs loaders and resets Query's error boundary. */
export function RouteError({ error }: { error: unknown }) {
  const router = useRouter();
  const { reset } = useQueryErrorResetBoundary();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <ErrorState
        message={error instanceof Error ? error.message : undefined}
        onRetry={() => {
          reset();
          router.invalidate();
        }}
      />
    </div>
  );
}

export function RouteNotFound({ title = "Bulunamadı", message }: { title?: string; message?: string }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <EmptyState title={title} message={message ?? "Aradığınız içerik bulunamadı ya da kaldırılmış olabilir."} />
    </div>
  );
}