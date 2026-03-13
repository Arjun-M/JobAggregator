"use client";

// This component is no longer a slide-out. It's now a simple utility for /explore page.
export function GlobalSearch() {
  return (
    <div style={{ display: 'none' }}>
      {/* This component is technically still used by explore, but the form is in explore itself */}
    </div>
  );
}
