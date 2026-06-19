import Link from "next/link";
import { Bot } from "lucide-react";

export const authInputClassName =
  "auth-input h-10 rounded-sm bg-secondary text-foreground focus-visible:ring-0 focus-visible:border-ring";

type Props = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthShell({ title, subtitle, children, footer }: Props) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-4">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/10 via-background to-background"
        aria-hidden
      />

      <div className="relative w-full max-w-[400px]">
        <div className="rounded-xl border border-border bg-card p-6 shadow-[0_16px_44px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col items-center text-center">
            <div className="flex size-12 items-center justify-center rounded-full border border-border bg-secondary">
              <Bot className="size-6 text-foreground" strokeWidth={1.75} />
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>

          <div className="mt-6">{children}</div>

          {footer}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">Bot404</p>
      </div>
    </div>
  );
}

export function AuthBackLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="mt-3 block text-center text-sm text-muted-foreground hover:underline"
    >
      {children}
    </Link>
  );
}
