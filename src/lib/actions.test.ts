import { test } from "node:test";
import assert from "node:assert/strict";
import { ACTION_PRIORITY, pickAction } from "./actions";
import { derive, EMPTY_TOTALS } from "./metrics";
import { chunkRange, previousPeriod } from "./dates";

test("purchases are not double-counted across overlapping action types", () => {
  const actions = [
    { action_type: "offsite_conversion.fb_pixel_purchase", value: "10" },
    { action_type: "purchase", value: "10" },
    { action_type: "omni_purchase", value: "11" },
  ];
  assert.equal(pickAction(actions, ACTION_PRIORITY.purchases), 11);
});

test("falls back to pixel purchase when omni is absent", () => {
  assert.equal(pickAction([{ action_type: "offsite_conversion.fb_pixel_purchase", value: "4" }], ACTION_PRIORITY.purchases), 4);
  assert.equal(pickAction(undefined, ACTION_PRIORITY.purchases), 0);
});

test("ratios come from totals and handle zero denominators", () => {
  const d = derive({ ...EMPTY_TOTALS, spend: 100, purchase_value: 350, purchases: 5, impressions: 10000, link_clicks: 200 });
  assert.equal(d.roas, 3.5);
  assert.equal(d.cpa, 20);
  assert.equal(d.aov, 70);
  assert.equal(d.cpm, 10);
  assert.equal(d.ctr, 0.02);
  assert.equal(derive(EMPTY_TOTALS).roas, null);
});

test("date helpers", () => {
  assert.deepEqual(previousPeriod("2026-10-01", "2026-10-30"), { since: "2026-09-01", until: "2026-09-30" });
  assert.equal(chunkRange("2026-01-01", "2026-03-01", 30).length, 2);
  assert.deepEqual(chunkRange("2026-01-01", "2026-01-05", 30), [{ since: "2026-01-01", until: "2026-01-05" }]);
});

test("blended ROAS uses only spend on days with uploaded revenue", () => {
  const d = derive({ ...EMPTY_TOTALS, spend: 1000, actual_revenue: 400, actual_spend: 100 });
  assert.equal(d.blended_roas, 4);
});
