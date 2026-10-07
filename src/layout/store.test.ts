import assert from "node:assert/strict";
import {
  DEFAULT_LAYOUT,
  deserializeLayout,
  exportLayoutJson,
  importLayoutJson,
  serializeLayout,
  toggleVisible,
} from "./store.ts";

const raw = serializeLayout(DEFAULT_LAYOUT);
const back = deserializeLayout(raw);
assert.equal(back.version, 1);
assert.equal(back.entries.length, DEFAULT_LAYOUT.entries.length);

const hidden = toggleVisible(DEFAULT_LAYOUT, "weather-small");
assert.equal(hidden.entries.find((e) => e.id === "weather-small")!.visible, false);
const round = importLayoutJson(exportLayoutJson(hidden));
assert.deepEqual(round, hidden);

console.log("layout store serialize round-trip ok");
