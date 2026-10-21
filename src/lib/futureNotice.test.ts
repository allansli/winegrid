import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { futureNoticeVisible } from "./futureNotice";

describe("future date notice", () => {
  it("stays on the first board and leaves when the board changes", () => {
    assert.equal(futureNoticeVisible(true, null, "daily-2026-10-21-wset2-all"), true);
    assert.equal(
      futureNoticeVisible(true, "daily-2026-10-21-wset2-all", "daily-2026-10-21-wset2-all"),
      true
    );
    assert.equal(
      futureNoticeVisible(true, "daily-2026-10-21-wset2-all", "unlimited-1-wset3-all"),
      false
    );
    assert.equal(futureNoticeVisible(false, "daily-2026-10-21-wset2-all", "unlimited-1-wset3-all"), false);
    assert.equal(futureNoticeVisible(true, null, null), true);
  });
});
