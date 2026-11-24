/**
 * Partner network FAQ. Answers that depend on an owner decision are built from
 * `PROGRAM_TERMS` and left out while it is null, so the visible FAQ and the FAQPage
 * JSON-LD (both fed from this list) never show a placeholder or a guess.
 */
import type { FaqItem } from "@/data/faq";
import type { Locale } from "@/lib/i18n";
import { fill } from "./copy";
import { PROGRAM_TERMS, type ProgramTerms } from "./terms";

const COPY = {
  en: {
    cost: { q: "How much does it cost to join?", family: "Family daycares: {fee}.", center: "Child care centers: {fee}." },
    franchise: {
      q: "Is this a franchise? Do I have to change my name?",
      a: "No. You keep your daycare's name, license and policies; Waymaker lists and promotes your program.",
    },
    contract: "Do I need to sign a contract?",
    families: {
      q: "Who answers families' questions?",
      waymaker: "Waymaker takes families' first calls and emails, then passes tour requests and the family's details to you.",
      daycare: "You do: families' calls and emails go to your daycare, and tour requests arrive with the family's details.",
    },
    notLicensed: {
      q: "I am not licensed yet. Can I apply?",
      a: "Not to the network yet: every partner is licensed. Our consulting team can help you get licensed first.",
      link: "Daycare consulting",
    },
    chinese: {
      q: "Can I apply in Chinese?",
      a: "Yes. The application is available in English and Traditional Chinese, and we can reply in either language.",
    },
    leave: "How do I leave the network?",
  },
  zh: {
    cost: { q: "加入需要費用嗎？", family: "家庭式托兒所：{fee}。", center: "托兒中心：{fee}。" },
    franchise: {
      q: "這是加盟嗎？需要改名嗎？",
      a: "不是。您保留自己的園名、執照與規定；Waymaker 負責刊登與推廣您的園所。",
    },
    contract: "需要簽約嗎？",
    families: {
      q: "家長的問題由誰回答？",
      waymaker: "Waymaker 會先接聽家長的電話與 Email，再把參觀預約和家長資料轉給您。",
      daycare: "由您回答：家長的電話與 Email 會直接聯絡您的園所，參觀預約也會附上家長資料。",
    },
    notLicensed: {
      q: "我還沒有執照，可以申請嗎？",
      a: "目前還不行：網絡內每家都有執照。我們的開園諮詢可以先協助您取得執照。",
      link: "開園諮詢",
    },
    chinese: {
      q: "可以用中文申請嗎？",
      a: "可以。申請表有中英文版本，我們也可以用中文或英文回覆。",
    },
    leave: "如何退出合作網絡？",
  },
} as const;

export function getJoinFaq(locale: Locale, terms: ProgramTerms = PROGRAM_TERMS): FaqItem[] {
  const t = COPY[locale];
  const fees = (["family", "center"] as const)
    .flatMap((type) => {
      const fee = terms.feeSummary[type];
      return fee ? [fill(t.cost[type], { fee: fee[locale] })] : [];
    })
    .join(locale === "zh" ? "" : " ");
  const familiesAnswer = terms.waymakerAnswersFirstContact === null
    ? null
    : terms.waymakerAnswersFirstContact ? t.families.waymaker : t.families.daycare;

  const items: (FaqItem | null)[] = [
    fees ? { question: t.cost.q, answer: fees } : null,
    terms.model === "network" || terms.model === "both" ? { question: t.franchise.q, answer: t.franchise.a } : null,
    terms.contractSummary ? { question: t.contract, answer: terms.contractSummary[locale] } : null,
    familiesAnswer ? { question: t.families.q, answer: familiesAnswer } : null,
    { question: t.notLicensed.q, answer: t.notLicensed.a, link: { href: "/for-providers", label: t.notLicensed.link } },
    { question: t.chinese.q, answer: t.chinese.a },
    terms.leaveSummary ? { question: t.leave, answer: terms.leaveSummary[locale] } : null,
  ];
  return items.filter((item): item is FaqItem => item !== null);
}
