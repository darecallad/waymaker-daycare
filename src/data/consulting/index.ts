/** Provider consulting content. See `shared.ts` for the rules every claim must follow. */
export * from "./shared";
export { hubCopy, type HubCopy } from "./hub";
export { pathCopy, type PathCopy } from "./paths";
export { timelineCopy, type TimelinePageCopy, type TimelineStep } from "./timeline";
export { getConsultingFaq } from "./faq";
