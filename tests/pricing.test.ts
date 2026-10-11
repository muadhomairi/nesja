import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateQuote, termSavingsPercent } from "../src/lib/pricing/calculate";

test("50 users on a 24-month Essential agreement", () => {
  const q = calculateQuote({ editionId: "essential", termId: "24m", seats: 50 });
  assert.equal(q.status, "priced");
  assert.equal(q.pricePerUser, 74);
  assert.equal(q.monthlyCost, 3700);
  assert.equal(q.contractValue, 88800);
  assert.equal(q.totalSavings, (99 - 74) * 50 * 24);
  assert.equal(q.savingsPercent, 25);
});

test("monthly has no savings and one-month contract value", () => {
  const q = calculateQuote({ editionId: "essential", termId: "monthly", seats: 10 });
  assert.equal(q.pricePerUser, 99);
  assert.equal(q.contractValue, 990);
  assert.equal(q.totalSavings, 0);
  assert.equal(q.savingsPercent, 0);
});

test("term savings badges match the published ladder", () => {
  assert.equal(termSavingsPercent("essential", "12m"), 15);
  assert.equal(termSavingsPercent("essential", "24m"), 25);
  assert.equal(termSavingsPercent("essential", "36m"), 35);
});

test("enterprise is custom", () => {
  assert.equal(calculateQuote({ editionId: "enterprise", termId: "12m", seats: 500 }).status, "custom");
});

test("seat input is clamped and rounded", () => {
  assert.equal(calculateQuote({ editionId: "essential", termId: "12m", seats: -4 }).seats, 1);
  assert.equal(calculateQuote({ editionId: "essential", termId: "12m", seats: 12.6 }).seats, 13);
});
