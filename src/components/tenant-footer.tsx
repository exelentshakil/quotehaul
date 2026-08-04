// Minimal branded footer shared across tenant public pages — kept separate
// from SiteFooter (the QuoteHaul marketing footer) for the same white-label
// reason TenantNav is kept separate from SiteHeader.
export function TenantFooter({ companyName }: { companyName: string }) {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-4xl px-6 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {companyName}. Instant estimates are a guide only, confirmed by a real person before anything is booked.
      </div>
    </footer>
  );
}
