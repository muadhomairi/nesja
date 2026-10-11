"use client";
import { track } from "@/lib/analytics";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

/** "Save as PDF" via the browser print dialog (print stylesheet in globals.css). */
export function PrintButton({ slug }: { slug: string }) {
  return (
    <Button variant="secondary" size="sm" data-print-hidden onClick={() => { track("resource_downloaded", { slug, format: "pdf-print" }); window.print(); }}>
      <Icon name="download" className="h-4 w-4" /> Save as PDF
    </Button>
  );
}
