"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="mt-8 flex items-center gap-1.5 text-sm font-medium text-primary hover:underline print:hidden"
    >
      <Printer className="h-4 w-4" /> Print or save as PDF
    </button>
  );
}
