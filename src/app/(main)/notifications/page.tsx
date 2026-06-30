import { NotificationsList } from "@/components/notifications/NotificationsList";
import { PageHeader } from "@/components/layout/PageHeader";
import { getNotifications } from "@/lib/queries/social";
import { redirect } from "next/navigation";
import { getRequestAuth } from "@/lib/queries/shell";

export const revalidate = 0;

export default async function NotificationsPage() {
  const { user } = await getRequestAuth();
  if (!user) redirect("/login");

  const referenceNowMs = Date.now();
  const notifications = await getNotifications();

  return (
    <div className="w-full min-w-0 divide-y divide-border">
      <PageHeader
        title="Notifications"
        subtitle="Mentions, relais et abonnements"
        backHref="/"
      />
      <NotificationsList
        notifications={notifications}
        referenceNowMs={referenceNowMs}
      />
    </div>
  );
}
