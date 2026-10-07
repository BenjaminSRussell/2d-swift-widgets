import assert from "node:assert/strict";
import { isStale, STALE_AFTER_MS } from "./stale.ts";

const t0 = 1_000_000;
assert.equal(isStale("weather", null, t0), true);
assert.equal(isStale("weather", t0, t0 + 1000), false);
assert.equal(isStale("weather", t0, t0 + STALE_AFTER_MS.weather + 1), true);
console.log("stale policy ok");
