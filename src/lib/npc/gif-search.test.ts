import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  extractGifSearchQuery,
  parseGiphySearchResponse,
} from "@/lib/npc/gif-search";

describe("parseGiphySearchResponse", () => {
  it("extrait l'URL du premier GIF", () => {
    const url = parseGiphySearchResponse({
      data: [
        {
          images: {
            original: { url: "https://media.giphy.com/gif1.gif" },
          },
        },
      ],
    });
    assert.equal(url, "https://media.giphy.com/gif1.gif");
  });

  it("retourne null si vide", () => {
    assert.equal(parseGiphySearchResponse({ data: [] }), null);
  });
});

describe("extractGifSearchQuery", () => {
  it("garde des mots courts utiles pour la recherche", () => {
    const q = extractGifSearchQuery("lol wtf le meta est cassé");
    assert.ok(q.includes("meta") || q.includes("cass"));
  });
});
