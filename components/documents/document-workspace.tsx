import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function DocumentWorkspace() {
  return (
    <div className="page-enter mx-auto max-w-[1800px] p-4 sm:p-6">
      <div className="mb-8 border-b border-[var(--gray-200)] pb-6">
        <p className="micro-label">Documents</p>
        <h2 className="font-display mt-2 text-4xl leading-none text-[var(--ink)]">
          Print Documents
        </h2>
        <p className="mt-3 text-sm text-[var(--gray-600)]">
          Your next workspace for print-ready PDFs and images.
        </p>
      </div>

      <section
        aria-labelledby="documents-empty-heading"
        className="mx-auto max-w-3xl rounded-2xl border border-[var(--gray-200)] bg-[var(--surface)] px-6 py-12 text-center sm:px-12 sm:py-16"
      >
        <div className="mx-auto flex size-14 items-center justify-center rounded-xl border border-[var(--gray-200)] bg-[var(--gray-50)]">
          <FileText className="size-6 text-[var(--gray-600)]" aria-hidden="true" />
        </div>
        <p className="micro-label mt-6">Coming soon</p>
        <h3 id="documents-empty-heading" className="font-display mt-3 text-2xl text-[var(--ink)]">
          Document printing is on its way
        </h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--gray-600)]">
          Soon you’ll be able to open a PDF or image, choose your paper,
          and fit or crop it for printing. Files will stay in your browser.
        </p>
        <p className="mt-4 text-xs text-[var(--gray-500)]">
          File import and document printing are not available yet.
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to pictures
          </Link>
        </Button>
      </section>
    </div>
  );
}
