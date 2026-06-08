import {
  ALLOWED_AVATAR_TYPES,
  isExternalAvatarUrl,
  MAX_AVATAR_BYTES,
  normalizeAvatarUrlForSave,
} from "@/lib/avatars";
import { createClient } from "@/lib/supabase/server";

export { ALLOWED_AVATAR_TYPES, MAX_AVATAR_BYTES } from "@/lib/avatars";

function supabaseStoragePrefix(): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base.replace(/\/$/, "")}/storage/v1/object/public/post-media/`;
}

function isPersistedAvatarUrl(url: string, userId: string): boolean {
  const prefix = supabaseStoragePrefix();
  if (!prefix || !url.startsWith(prefix)) return false;
  return url.includes(`/${userId}/avatar.`);
}

function extensionFromMime(mime: string): string {
  if (mime === "image/gif") return "gif";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

export async function persistAvatarBuffer(
  userId: string,
  buffer: Buffer,
  contentType: string
): Promise<{ url: string } | { error: string }> {
  const mime = contentType.split(";")[0].trim().toLowerCase();
  if (!ALLOWED_AVATAR_TYPES.has(mime)) {
    return { error: "Format d'image non supporté (JPEG, PNG, WebP, GIF)." };
  }
  if (buffer.byteLength > MAX_AVATAR_BYTES) {
    return { error: "Image trop volumineuse (max 2 Mo)." };
  }

  const supabase = await createClient();
  const ext = extensionFromMime(mime);
  const path = `${userId}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("post-media")
    .upload(path, buffer, { contentType: mime, upsert: true });

  if (uploadError) {
    return { error: uploadError.message };
  }

  const { data } = supabase.storage.from("post-media").getPublicUrl(path);
  return { url: data.publicUrl };
}

export async function persistAvatarFile(
  userId: string,
  file: File
): Promise<{ url: string } | { error: string }> {
  if (!file.size) {
    return { error: "Fichier avatar vide." };
  }
  const contentType = file.type || "image/jpeg";
  const buffer = Buffer.from(await file.arrayBuffer());
  return persistAvatarBuffer(userId, buffer, contentType);
}

export async function persistAvatarUrlIfRemote(
  userId: string,
  avatarUrl: string | null
): Promise<{ url: string | null } | { error: string }> {
  const normalized = normalizeAvatarUrlForSave(avatarUrl, userId);
  if (!normalized) return { url: null };
  if (isPersistedAvatarUrl(normalized, userId)) return { url: normalized };
  if (!isExternalAvatarUrl(normalized)) return { url: normalized };

  let buffer: Buffer;
  let contentType: string;

  try {
    const res = await fetch(normalized, {
      signal: AbortSignal.timeout(30_000),
      headers: { Accept: "image/*" },
    });
    if (!res.ok) {
      return {
        error:
          "Impossible de télécharger l'image. Vérifiez l'URL ou utilisez un lien Discord récent.",
      };
    }
    contentType = (res.headers.get("content-type") ?? "image/jpeg")
      .split(";")[0]
      .trim()
      .toLowerCase();
    buffer = Buffer.from(await res.arrayBuffer());
  } catch {
    return {
      error:
        "Impossible de télécharger l'image. Vérifiez l'URL ou utilisez un lien Discord récent.",
    };
  }

  const uploaded = await persistAvatarBuffer(userId, buffer, contentType);
  if ("error" in uploaded) return uploaded;
  return { url: uploaded.url };
}
