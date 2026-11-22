import { test } from "node:test";
import assert from "node:assert/strict";
import { csvCell } from "../src/lib/csv";

test("csv cells are quoted per RFC 4180", () => {
  assert.equal(csvCell(null), "");
  assert.equal(csvCell("plain"), "plain");
  assert.equal(csvCell('Acme, "North"'), '"Acme, ""North"""');
  assert.equal(csvCell("two\nlines"), '"two\nlines"');
});

test("spreadsheet formulas are neutralised but negative numbers are kept", () => {
  assert.equal(csvCell("=HYPERLINK(\"x\")"), "\"'=HYPERLINK(\"\"x\"\")\"");
  assert.equal(csvCell("+1+1"), "'+1+1");
  assert.equal(csvCell("@SUM(A1)"), "'@SUM(A1)");
  assert.equal(csvCell("-12.50"), "-12.50");
  assert.equal(csvCell("-cmd"), "'-cmd");
});
