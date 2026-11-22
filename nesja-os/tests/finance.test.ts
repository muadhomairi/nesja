import { test } from "node:test";
import assert from "node:assert/strict";
import { amortise, bundleMonthlyCost, employeeMonthlyCost, fmt2, grossMargin, multiYearSchedule, priceForTargetMargin, priceQuote, sum } from "../src/lib/finance";

test("quote totals equal the database figures (supabase/tests/10_tenant_isolation_test.sql)", () => {
  const r = priceQuote({ termMonths: 36, overallDiscountRate: "0.05", mobilisationCost: 18000, lines: [
    { description: "Setup", pricingModel: "one_time", quantity: 1, unitPrice: 25000, unitCost: 15000 },
    { description: "Service desk agents", pricingModel: "recurring", quantity: 12, unitPrice: 3200, unitCost: "2350.5", discountRate: "0.10" },
    { description: "Tickets", pricingModel: "transactional", quantity: 1500, unitPrice: "1.75", unitCost: "0.6" },
  ] });
  assert.equal(fmt2(r.grossRevenue), "1363660.00");
  assert.equal(fmt2(r.overallDiscount), "68183.00");
  assert.equal(fmt2(r.tcv), "1295477.00");
  assert.equal(fmt2(r.totalCost), "1080816.00");
  assert.equal(fmt2(r.acv), "431825.67");
  assert.equal(fmt2(r.mobilisationSchedule[0]), "500.00");
  assert.equal(fmt2(sum(r.mobilisationSchedule)), "18000.00");
  assert.equal(r.gmPct?.toString(), "0.1657");
});

test("no floating point drift: 0.1 + 0.2 style amounts", () => {
  const r = priceQuote({ termMonths: 1, lines: Array.from({ length: 10 }, () => ({ description: "x", pricingModel: "one_time" as const, quantity: 1, unitPrice: "0.10" })) });
  assert.equal(fmt2(r.tcv), "1.00");
});

test("floats are rejected for money", () => {
  assert.throws(() => priceQuote({ termMonths: 12, lines: [{ description: "x", pricingModel: "recurring", quantity: 1, unitPrice: 0.1 }] }), /string/);
});

test("half-up rounding matches PostgreSQL round()", () => {
  const r = priceQuote({ termMonths: 1, lines: [{ description: "x", pricingModel: "one_time", quantity: 1, unitPrice: "2.345" }] });
  assert.equal(fmt2(r.tcv), "2.35");
});

test("invalid inputs are refused", () => {
  assert.throws(() => priceQuote({ termMonths: 0, lines: [] }), /termMonths/);
  assert.throws(() => priceQuote({ termMonths: 12, lines: [{ description: "x", pricingModel: "one_time", quantity: -1, unitPrice: 1 }] }), /negative/);
  assert.throws(() => priceQuote({ termMonths: 12, overallDiscountRate: 1, lines: [] }), /\[0, 1\)/);
});

test("employee monthly cost: base + allowances + employer on-costs + one-offs / 12", () => {
  const c = employeeMonthlyCost({ name: "Agent", monthlyBaseSalary: 1800, monthlyAllowances: 450, employerCostRate: "0.175", annualOneOffCosts: 1500 });
  assert.equal(fmt2(c.employerCost), "315.00");
  assert.equal(fmt2(c.oneOffMonthly), "125.00");
  assert.equal(fmt2(c.monthlyCost), "2690.00");
});

test("resource bundle with partial allocation", () => {
  const agent = { name: "Agent", monthlyBaseSalary: 1800, monthlyAllowances: 450, employerCostRate: "0.175", annualOneOffCosts: 1500 };
  const lead = { name: "Team lead", monthlyBaseSalary: 3200, monthlyAllowances: 600, employerCostRate: "0.175" };
  const b = bundleMonthlyCost([{ role: agent, headcount: 10 }, { role: lead, headcount: 1, allocation: "0.5" }]);
  assert.equal(fmt2(b.monthly), "29080.00"); // 26,900 + (3200+600+560)/2 = 2,180
});

test("amortisation always adds back to the exact amount", () => {
  const s = amortise("1000.00", 3);
  assert.deepEqual(s.map(fmt2), ["333.33", "333.33", "333.34"]);
  for (const n of [1, 7, 11, 13, 36, 60, 120]) assert.equal(fmt2(sum(amortise("98765.43", n))), "98765.43");
});

test("target margin pricing and gross margin", () => {
  assert.equal(fmt2(priceForTargetMargin(7500, "0.25")), "10000.00");
  const g = grossMargin(10000, 7500);
  assert.equal(fmt2(g.gm), "2500.00");
  assert.equal(g.gmPct?.toString(), "0.25");
  assert.equal(grossMargin(0, 10).gmPct, null);
});

test("multi-year TCV with yearly escalation", () => {
  const m = multiYearSchedule(10000, 3, "0.03");
  assert.deepEqual(m.rows.map((r) => r.monthlyFee), ["10000.00", "10300.00", "10609.00"]);
  assert.equal(m.tcv, "370908.00");
  assert.equal(m.acv, "123636.00");
});
