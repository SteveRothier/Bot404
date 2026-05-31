import Link from "next/link";
import { notFound } from "next/navigation";
import { FeedListLoader } from "@/components/feed/FeedServer";
import { PostsSuspense } from "@/components/feed/FeedSkeleton";
import { FollowButton } from "@/components/profile/FollowButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  getFollowerCount,
  getFollowingCount,
  isFollowing,
} from "@/lib/queries/follows";
import { getCurrentUserProfile } from "@/lib/queries/feed";
import {
  getProfileByUsername,
  getPostsByUsername,
} from "@/lib/queries/profile";
import { createClient } from "@/lib/supabase/server";
import type { Personality } from "@/lib/supabase/types";

export const revalidate = 60;

type Props = {
  params: Promise<{ username: string }>;
};

async function ProfilePosts({ username }: { username: string }) {
  const posts = await getPostsByUsername(username);

  return (
    <FeedListLoader
      posts={posts}
      emptyMessage="Ce profil n'a pas encore posté."
    />
  );
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [profile, currentProfile] = await Promise.all([
    getProfileByUsername(username),
    getCurrentUserProfile(),
  ]);

  if (!profile) notFound();

  const isOwnProfile = currentProfile?.id === profile.id;
  const personality = (profile.personality ?? {}) as Personality;

  const [followerCount, followingCount, initiallyFollowing] = await Promise.all([
    getFollowerCount(profile.id),
    getFollowingCount(profile.id),
    user && !isOwnProfile
      ? isFollowing(user.id, profile.id)
      : Promise.resolve(false),
  ]);

  return (
    <div className="w-full">
      <div className="border-b border-border px-4 pb-4 pt-2">
        <div className="flex items-start justify-between gap-4">
          <Avatar className="size-20 rounded-full">
            <AvatarImage
              src={profile.avatar_url ?? undefined}
              className="rounded-full object-cover"
            />
            <AvatarFallback className="rounded-full bg-secondary text-lg">
              {profile.username.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="pt-1">
            {isOwnProfile ? (
              <Link
                href="/profile/edit"
                className="inline-flex h-9 items-center rounded-full border border-border px-4 text-[15px] font-bold transition-colors hover:bg-secondary"
              >
                Modifier le profil
              </Link>
            ) : (
              <FollowButton
                profileId={profile.id}
                initialFollowing={initiallyFollowing}
                isOwnProfile={false}
                isLoggedIn={!!user}
              />
            )}
          </div>
        </div>

        <div className="mt-3">
          <h1 className="text-xl font-bold">{profile.username}</h1>
          <p className="text-[15px] text-muted-foreground">
            @{profile.username.toLowerCase()}
          </p>
        </div>

        {(profile.bio || personality.personality) && (
          <p className="mt-3 text-[15px] text-foreground">
            {profile.bio ??
              `${personality.personality ?? ""}${
                personality.mood ? ` · ${personality.mood}` : ""
              }`}
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-4 text-[15px]">
          <span>
            <strong className="text-foreground">{followingCount}</strong>{" "}
            <span className="text-muted-foreground">Abonnements</span>
          </span>
          <span>
            <strong className="text-foreground">{followerCount}</strong>{" "}
            <span className="text-muted-foreground">Abonnés</span>
          </span>
        </div>
      </div>

      <PostsSuspense count={3}>
        <ProfilePosts username={username} />
      </PostsSuspense>
    </div>
  );
}
