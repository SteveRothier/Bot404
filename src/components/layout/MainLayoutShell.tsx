import { Suspense } from "react";
import { LeftSidebar } from "@/components/layout/LeftSidebar";
import { RightSidebarLoader } from "@/components/layout/RightSidebarLoader";
import { ClientStoresHydrator } from "@/components/providers/ClientStoresHydrator";
import { getCachedSidebarAuth } from "@/lib/queries/shell";
import { getDefaultOllamaStatus } from "@/lib/ollama";
import { getUnreadNotificationCount } from "@/lib/queries/social";

type Props = {
  children: React.ReactNode;
};

function RightSidebarSkeleton() {
  return (
    <aside
      className="sidebar-sticky hidden w-[350px] shrink-0 flex-col gap-4 pl-6 xl:flex"
      aria-hidden
    >
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="h-32 animate-pulse rounded-lg border border-border bg-background/80"
        />
      ))}
    </aside>
  );
}

export async function MainLayoutShell({ children }: Props) {
  const sidebarAuth = await getCachedSidebarAuth();
  const userId = sidebarAuth.user?.id ?? null;
  const initialUnreadCount = userId
    ? await getUnreadNotificationCount()
    : 0;

  return (
    <ClientStoresHydrator
      ollama={getDefaultOllamaStatus()}
      userId={userId}
      initialUnreadCount={initialUnreadCount}
    >
      <div className="relative min-h-[100dvh] bg-background">
        <div className="fixed inset-y-0 left-0 z-30 w-[72px] lg:w-[275px]">
          <LeftSidebar sidebarAuth={sidebarAuth} />
        </div>

        <div className="min-h-[100dvh] pl-[72px] lg:pl-[275px]">
          <div className="mx-auto flex min-h-[100dvh] w-full max-w-[987px]">
            <main className="layout-feed-column min-w-0 shrink-0">
              {children}
            </main>

            <Suspense fallback={<RightSidebarSkeleton />}>
              <RightSidebarLoader />
            </Suspense>
          </div>
        </div>
      </div>
    </ClientStoresHydrator>
  );
}
