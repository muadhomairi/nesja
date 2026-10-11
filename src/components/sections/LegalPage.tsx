import Link from "next/link";
import { Container } from "@/components/ui/Section";
import { companyFacts } from "@/config/legal";
import type { Block } from "@/config/resources";

/**
 * Legal page shell. Company facts (entity, registration, address, legal
 * email) come from src/config/legal.ts and render only when configured.
 */
export function LegalPage({ title, updated, intro, blocks, showCompanyDetails }: { title: string; updated: string; intro?: string; blocks: Block[]; showCompanyDetails?: boolean }) {
  const details = [
    ["Legal entity", companyFacts.legalEntityName],
    ["Registration number", companyFacts.registrationNumber],
    ["Registered address", companyFacts.registeredAddress],
    ["Email", companyFacts.legalEmail],
  ].filter(([, v]) => v);
  return (
    <article className="pb-24 pt-32 md:pt-40">
      <Container className="max-w-3xl">
        <h1 className="text-display-md text-cloud">{title}</h1>
        <p className="mt-3 text-sm text-mist">Last updated {updated}</p>
        {intro && <p className="mt-8 text-lg leading-relaxed text-silver">{intro}</p>}
        <div className="prose-nesja mt-8">
          {blocks.map((b, i) => b.type === "h2" ? <h2 key={i}>{b.text}</h2> : b.type === "h3" ? <h3 key={i}>{b.text}</h3> : b.type === "list" ? <ul key={i}>{b.items.map((x) => <li key={x}>{x}</li>)}</ul> : <p key={i}>{"text" in b ? b.text : ""}</p>)}
          {showCompanyDetails && details.length > 0 && (
            <>
              <h2>Company details</h2>
              <ul>{details.map(([k, v]) => <li key={k}>{k}: {v}</li>)}</ul>
            </>
          )}
        </div>
        <p className="mt-10 text-sm text-mist">Questions about this page? <Link href="/contact?type=general&from=legal" className="text-teal hover:underline">Contact NESJA</Link>.</p>
      </Container>
    </article>
  );
}
