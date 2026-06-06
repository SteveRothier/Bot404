import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isGifUrl, isOptimizableRemoteImage } from "@/lib/images";

describe("isGifUrl", () => {
  it("détecte les URLs .gif", () => {
    assert.equal(
      isGifUrl("https://example.supabase.co/storage/v1/object/public/post-media/x/y.gif"),
      true
    );
    assert.equal(isGifUrl("https://example.com/photo.jpg"), false);
  });
});

describe("isOptimizableRemoteImage", () => {
  it("exclut les GIF Supabase", () => {
    const prev = process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://abc.supabase.co";
    try {
      assert.equal(
        isOptimizableRemoteImage(
          "https://abc.supabase.co/storage/v1/object/public/post-media/a.gif"
        ),
        false
      );
      assert.equal(
        isOptimizableRemoteImage(
          "https://abc.supabase.co/storage/v1/object/public/post-media/a.jpg"
        ),
        true
      );
    } finally {
      process.env.NEXT_PUBLIC_SUPABASE_URL = prev;
    }
  });
});
