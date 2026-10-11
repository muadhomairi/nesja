import { Container } from "@/components/ui/Section";
import { FormAlert } from "@/components/ui/Field";
import type { Block } from "@/config/resources";

/** Legal page shell. Content must be reviewed by counsel before launch. */
export function LegalPage({ title, updated, blocks }: { title: string; updated: string; blocks: Block[] }) {
  return (
    <article className="pb-24 pt-32 md:pt-40">
      <Container className="max-w-3xl">
        <h1 className="text-display-md text-cloud">{title}</h1>
        <p className="mt-3 text-sm text-mist">Last updated {updated}</p>
        <div className="mt-6"><FormAlert tone="info">This page describes how this website works today. It is a working draft pending legal review before public launch.</FormAlert></div>
        <div className="prose-nesja mt-8">
          {blocks.map((b, i) => b.type === "h2" ? <h2 key={i}>{b.text}</h2> : b.type === "list" ? <ul key={i}>{b.items.map((x) => <li key={x}>{x}</li>)}</ul> : <p key={i}>{"text" in b ? b.text : ""}</p>)}
        </div>
      </Container>
    </article>
  );
}
