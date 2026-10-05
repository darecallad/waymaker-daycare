import type { Metadata } from "next";

// Owner dashboard: never index it or follow its links.
export const metadata: Metadata = {
  title: "Daycare Owner Dashboard",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
