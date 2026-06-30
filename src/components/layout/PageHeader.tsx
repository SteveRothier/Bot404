import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Props = {
  title: string;
  backHref?: string;
  backLabel?: string;
  subtitle?: string;
};

export function PageHeader({
  title,
  backHref = "/",
  backLabel = "Retour",
  subtitle,
}: Props) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/85 px-4 py-2 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-6">
        <Link
          href={backHref}
          aria-label={backLabel}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-secondary/80"
        >
          <ArrowLeft className="size-5" strokeWidth={2} />
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold leading-tight">{title}</h1>
          {subtitle && (
            <p className="truncate text-meta text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
    </header>
  );
}
