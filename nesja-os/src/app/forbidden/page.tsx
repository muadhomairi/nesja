import { ButtonLink, Empty } from "@/components/ui/primitives";
export default function Forbidden() {
  return <div className="mx-auto max-w-lg py-24"><Empty title="You don't have access to this page">Your role in this organization doesn't include it. Ask an administrator if you need it.<div className="mt-4"><ButtonLink href="/launcher" variant="secondary">Back to NESJA</ButtonLink></div></Empty></div>;
}
