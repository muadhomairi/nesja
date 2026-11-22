// End-to-end journey against a running app + local Supabase (supabase start). Usage:
//   APP=http://localhost:3100 MAILPIT=http://127.0.0.1:54324 node scripts/e2e.mjs [screenshot-dir]
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const APP = process.env.APP ?? "http://localhost:3100";
const MAILPIT = process.env.MAILPIT ?? "http://127.0.0.1:54324";
const SHOTS = process.argv[2]; if (SHOTS) mkdirSync(SHOTS, { recursive: true });
const run = Date.now().toString(36);
const owner = { email: `owner.${run}@acme.example`, password: "Nesja-Test-2026!" };
const finance = { email: `finance.${run}@acme.example`, password: "Nesja-Fin-2026!x" };
const results = [];
const ok = (name, cond, detail = "") => { results.push({ name, pass: !!cond, detail }); console.log(`${cond ? "ok" : "FAIL"} - ${name}${detail ? ` (${detail})` : ""}`); };
const errors = [];

async function mailLink(to, re) {
  for (let i = 0; i < 30; i++) {
    const list = await (await fetch(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:${to}`)}`)).json();
    if (list.messages?.length) {
      const msg = await (await fetch(`${MAILPIT}/api/v1/message/${list.messages[0].ID}`)).json();
      const m = (msg.HTML || msg.Text).match(re);
      if (m) return m[1].replace(/&amp;/g, "&");
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`no e-mail for ${to}`);
}

const browser = await chromium.launch();
async function ctx() {
  const c = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await c.newPage();
  p.on("pageerror", (e) => errors.push(`pageerror ${p.url()}: ${e.message}`));
  p.on("response", (r) => { if (r.status() >= 500) errors.push(`${r.status()} ${r.url()}`); });
  return p;
}
const shot = async (p, name) => { if (SHOTS) await p.screenshot({ path: join(SHOTS, `${name}.png`), fullPage: true }); };

try {
  // 1. Sign-up and e-mail verification
  const p = await ctx();
  await p.goto(`${APP}/login`); await shot(p, "01-login");
  await p.goto(`${APP}/signup`);
  await p.fill("#full_name", "Olivia Owner"); await p.fill("#email", owner.email); await p.fill("#password", owner.password);
  await p.click("button[type=submit]");
  await p.getByText("Check your inbox").waitFor();
  ok("sign-up asks for e-mail verification", true);
  await p.goto(await mailLink(owner.email, /href="([^"]+verify[^"]+)"/));
  await p.waitForURL(/\/onboarding/);
  ok("verification link signs in and opens onboarding", p.url().includes("/onboarding"));

  // 2. Organization provisioning + configuration
  await p.fill("#name", "Acme Services"); await p.fill("#slug", `acme-${run}`); await p.click("button[type=submit]");
  await p.waitForURL(/step=configure/); ok("organization created", true);
  await p.fill("#units", "North America\nEMEA"); await p.click("button[type=submit]");
  await p.waitForURL(/step=team/); ok("configuration saved", true);
  await p.fill("#email", finance.email); await p.selectOption("#role", "finance"); await p.click("button[type=submit]");
  await p.getByText(/Invitation sent/).waitFor(); ok("team invitation sent", true);
  await p.goto(`${APP}/onboarding?step=import`);
  const csv = join(tmpdir(), `acc-${run}.csv`); writeFileSync(csv, "number,name,industry,country\nAC-1,Harbor Freight Lines,Logistics,US\nAC-2,Summit Care Clinics,Healthcare,GB\n");
  await p.setInputFiles("input[type=file]", csv); await p.click("button[type=submit]");
  await p.getByText("Imported 2 accounts").waitFor(); ok("CSV import of accounts", true);
  await p.goto(`${APP}/onboarding?step=subscription`); await shot(p, "02-onboarding-subscription");
  ok("subscription step shows trial and no prices", await p.getByText("Pricing to be confirmed").first().isVisible());

  // 3. Launcher and command center
  await p.goto(`${APP}/launcher`); await shot(p, "03-launcher");
  ok("launcher: Engage marked not deployed", await p.getByText("Not deployed yet").isVisible());
  ok("launcher: Deliver marked coming soon", await p.getByText("Coming soon").isVisible());
  await p.goto(`${APP}/commercial`); ok("command center renders", await p.getByText("Commercial command center").isVisible());

  // 4. Opportunity → quotation (CPQ) → submit raises margin approval
  await p.goto(`${APP}/commercial/opportunities/new`);
  await p.fill("#name", "Harbor managed service desk"); await p.fill("#expected_close", "2027-03-31"); await p.click("button[type=submit]");
  await p.waitForURL(/opportunities\/[0-9a-f-]{36}/); const oppUrl = p.url(); ok("opportunity created", true);
  await p.fill("input[aria-label=Description]", "Service desk agents");
  await p.fill("input[aria-label=quantity]", "10"); await p.fill("input[aria-label=unit_price]", "4000"); await p.fill("input[aria-label=unit_cost]", "3400");
  await shot(p, "04-cpq");
  ok("live CPQ preview TCV = 10 × 4,000 × 36", await p.getByText("USD 1440000.00").first().isVisible());
  await p.click("text=Save draft quotation"); await p.waitForURL(/quotes\/[0-9a-f-]{36}/); const quoteUrl = p.url();
  ok("quotation saved and recomputed in the database", await p.getByText("$1,440,000.00").first().isVisible());
  await p.click("text=Submit"); await p.getByText("Gross margin is below the rate card target").waitFor();
  ok("low margin (15%) raised an approval", true);
  await p.goto(`${APP}/commercial/approvals`);
  ok("requester cannot decide own approval", (await p.locator("button", { hasText: "Approve" }).count()) === 0);

  // 5. Invited Finance user joins and approves (segregation of duties)
  const f = await ctx();
  await f.goto(await mailLink(finance.email, /href="([^"]+verify[^"]+)"/));
  await f.waitForURL(/auth\/reset/);
  await f.fill("#password", finance.password); await f.fill("#confirm", finance.password); await f.click("button[type=submit]");
  await f.waitForURL((u) => u.pathname === "/launcher"); await shot(f, "05a-invitee-launcher"); ok("invited user set a password and joined the organization", await f.getByText("Acme Services").first().isVisible());
  await f.goto(`${APP}/commercial/approvals`); await shot(f, "05-approvals");
  await f.fill("input[aria-label='Decision note']", "Approved for strategic entry"); await f.click("button:has-text('Approve')");
  await f.waitForTimeout(2000); await shot(f, "05b-after-approve"); await f.locator("span", { hasText: /^Approved$/ }).first().waitFor(); ok("finance approved the margin exception", true);

  // 6. Issue, accept, Closed Won
  await p.goto(quoteUrl); await p.click("text=Issue to customer"); await p.getByText("This revision is locked").waitFor();
  ok("issued quotation is locked", true);
  await p.click("text=Mark accepted"); await p.waitForTimeout(800);
  await p.goto(oppUrl); await p.selectOption("select", "closed_won"); await p.click("text=Update");
  await p.waitForTimeout(1200); await p.reload();
  ok("opportunity closed won after accepted quote + approval", await p.getByText("Closed won", { exact: true }).first().isVisible());
  await shot(p, "06-opportunity-won");

  // 7. Tenant isolation through the UI: Acme users cannot open a Northstar record
  const res = await p.goto(`${APP}/commercial/accounts/${"bd4f5e4c-0000-4000-8000-000000000000"}`);
  ok("unknown / foreign record id returns 404", res.status() === 404);

  // 8. Demo environment
  const d = await ctx();
  await d.goto(`${APP}/demo`); await shot(d, "07-demo-entry"); await d.click("button[type=submit]");
  await d.waitForURL(/demo\/journeys/); await shot(d, "08-demo-journeys");
  ok("demo session starts on the journeys page", (await d.locator("li.card").count()) === 6);
  for (const path of ["/commercial", "/commercial/accounts", "/commercial/opportunities", "/commercial/quotes", "/commercial/tenders", "/commercial/agreements", "/commercial/renewals", "/commercial/approvals", "/commercial/performance", "/commercial/costing", "/commercial/documents", "/commercial/activities"]) {
    const r = await d.goto(`${APP}${path}`); ok(`demo ${path} renders`, r.status() === 200);
    await shot(d, `09-demo${path.replace(/\//g, "-")}`);
  }
  // Each journey step link resolves
  await d.goto(`${APP}/demo/journeys`);
  const hrefs = await d.locator("li.card a").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  let bad = 0; for (const h of hrefs) { const r = await d.goto(`${APP}${h}`); if (r.status() !== 200) bad++; }
  ok(`all ${hrefs.length} journey steps open`, bad === 0, `${bad} failed`);
  await d.goto(`${APP}/commercial/performance`); await d.locator("#units a").first().click(); await d.waitForURL(/unit=/);
  ok("MIS drill-down by business unit", true);
  await d.goto(`${APP}/commercial`); await d.evaluate(() => document.documentElement.classList.add("dark")); await shot(d, "10-command-center-dark");
  await d.goto(`${APP}/admin`); ok("read-only demo role cannot open administration", d.url().includes("/forbidden"));
} catch (e) {
  ok("journey completed without exceptions", false, e.message);
} finally {
  ok("no server errors or page errors", errors.length === 0, errors.slice(0, 5).join(" | "));
  await browser.close();
  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  process.exit(failed.length ? 1 : 0);
}
