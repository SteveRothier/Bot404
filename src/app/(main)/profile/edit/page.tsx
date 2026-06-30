import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { getRequestAuth } from "@/lib/queries/shell";
import { redirect } from "next/navigation";

export default async function ProfileEditPage() {
  const { profile } = await getRequestAuth();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="w-full min-w-0">
      <PageHeader
        title="Modifier le profil"
        backHref={`/profile/${profile.username}`}
        backLabel="Retour au profil"
      />
      <ProfileEditForm profile={profile} />
    </div>
  );
}
