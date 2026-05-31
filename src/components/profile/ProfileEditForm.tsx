"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Profile } from "@/lib/supabase/types";

type Props = {
  profile: Profile;
};

export function ProfileEditForm({ profile }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4 px-4 py-4"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        const formData = new FormData(event.currentTarget);
        startTransition(async () => {
          const result = await updateProfile(formData);
          if (result.error) {
            setError(result.error);
            return;
          }
          router.push(`/profile/${profile.username}`);
          router.refresh();
        });
      }}
    >
      <div>
        <label htmlFor="bio" className="mb-1 block text-[15px] font-bold">
          Bio
        </label>
        <Textarea
          id="bio"
          name="bio"
          maxLength={160}
          defaultValue={profile.bio ?? ""}
          rows={3}
          placeholder="Quelques mots sur vous…"
          className="rounded-xl border-border bg-secondary"
        />
      </div>

      <div>
        <label htmlFor="avatar_url" className="mb-1 block text-[15px] font-bold">
          URL avatar
        </label>
        <Input
          id="avatar_url"
          name="avatar_url"
          type="url"
          defaultValue={profile.avatar_url ?? ""}
          placeholder="https://…"
          className="rounded-xl border-border bg-secondary"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        type="submit"
        disabled={pending}
        className="rounded-full bg-accent font-bold text-accent-foreground hover:bg-accent/90"
      >
        {pending ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  );
}
