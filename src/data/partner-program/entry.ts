/**
 * Copy for the links into the partner network from other pages (/partners banner, home,
 * footer). Kept apart from `copy.ts` because the footer is on every page and should not
 * ship the whole application copy.
 */
import type { Locale } from "@/lib/i18n";

const en = {
  partners: {
    title: "Run a licensed daycare in the Bay Area?",
    body: "List it on Waymaker and let families book tours online.",
    cta: "Join our network",
  },
  home: "Already licensed? Join our network",
  footer: "Join our network",
};

export type EntryCopy = typeof en;

const zh: EntryCopy = {
  partners: {
    title: "在灣區經營持照幼兒園嗎？",
    body: "加入 Waymaker，讓家長線上預約參觀。",
    cta: "加入合作網絡",
  },
  home: "已經有執照？加入合作網絡",
  footer: "加入合作網絡",
};

export const entryCopy: Record<Locale, EntryCopy> = { en, zh };
