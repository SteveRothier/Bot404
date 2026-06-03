import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  formatPendingInteractions,
  formatScriptedProgressStep,
} from "@/lib/narrative/copy";

describe("formatScriptedProgressStep", () => {
  it("affiche l'étape suivante tant qu'il reste des beats", () => {
    assert.equal(formatScriptedProgressStep(0, 7), "Étape 1 sur 7");
    assert.equal(formatScriptedProgressStep(3, 7), "Étape 4 sur 7");
  });

  it("affiche la dernière étape quand tout est terminé", () => {
    assert.equal(formatScriptedProgressStep(7, 7), "Étape 7 sur 7");
  });
});

describe("formatPendingInteractions", () => {
  it("gère zéro, un et plusieurs", () => {
    assert.match(
      formatPendingInteractions(0),
      /Aucune interaction en attente/
    );
    assert.equal(formatPendingInteractions(1), "1 interaction en attente");
    assert.equal(formatPendingInteractions(3), "3 interactions en attente");
  });
});
