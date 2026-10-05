import type { Metadata } from "next";
import { RootDocument } from "@/components/layout/RootDocument";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// Owner dashboard: never index it or follow its links.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Daycare Owner Dashboard", template: `%s | ${SITE_NAME}` },
  robots: { index: false, follow: false },
  icons: { icon: "/favicon.svg" },
};

/**
 * Root layout for the dashboard: English-only, no language segment, no public chrome.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RootDocument locale="en">
      <main className="flex-1">{children}</main>
    </RootDocument>
  );
}
