import { notFound } from "next/navigation";

/**
 * Any path under a language that no page claims. Claiming it here and calling
 * `notFound()` renders `[lang]/not-found.tsx` inside the site (header, footer and the
 * right `<html lang>`) instead of Next's bare 404 outside every root layout.
 */
export default function UnknownPage() {
  notFound();
}
