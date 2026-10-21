import assert from "node:assert/strict";
import fs from "node:fs";
import { describe, it } from "node:test";
import { buildCoverageReport, coverageGaps } from "./coverageReport";

describe("data coverage report", () => {
  it("matches the committed report and leads with the thinnest pairs", () => {
    const gaps = coverageGaps(15);
    assert.equal(gaps.length, 15);
    assert.equal(gaps[0].clueId, "clim-tropical-double-pruning");
    assert.equal(gaps[0].type, "grape");
    assert.equal(gaps[0].count, 0);
    const committed = fs.readFileSync(new URL("../../docs/data-coverage.md", import.meta.url), "utf8");
    assert.equal(committed, buildCoverageReport());
  });
});
