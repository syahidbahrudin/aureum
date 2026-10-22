import { Suspense } from "react";
import { CorrectionsBrowser } from "@/components/corrections/corrections-browser";
import { mockCorrectionFlags, mockCorrectionRecords } from "@/lib/mock/corrections";

export default function CorrectionsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Corrections</h1>
        <p className="text-muted-foreground">
          Post-publication corrections and source-change flags. A source change
          flags affected articles for review; it does not rewrite the published
          article.
        </p>
      </div>
      <Suspense>
        <CorrectionsBrowser
          flags={mockCorrectionFlags}
          records={mockCorrectionRecords}
        />
      </Suspense>
    </div>
  );
}
