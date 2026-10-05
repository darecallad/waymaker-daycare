/**
 * Provider FAQ. Price and track-record answers are built from `shared.ts`, so the FAQ,
 * the visible page and the FAQPage JSON-LD can never disagree.
 */
import type { FaqItem } from "@/data/faq";
import type { Locale } from "@/lib/i18n";
import { PRICING, TRACK_RECORD, formatUsd } from "./shared";

const family = formatUsd(PRICING.family.monthly);
const center = formatUsd(PRICING.center.monthly);
const n = TRACK_RECORD.daycaresWorkedWith;

export function getConsultingFaq(locale: Locale): FaqItem[] {
  if (locale === "zh") {
    return [
      { question: "在加州開幼兒園要花多少錢？", answer: `成本分兩部分。一是開辦成本：家庭式托兒所主要是住家整理、安全設備、訓練、保險與州政府執照費；托兒中心另外還有租金、裝修、設備與人事，金額高很多。二是 Waymaker 的顧問合作費：家庭式托兒所每月 ${family}，托兒中心每月 ${center}。州政府執照費請以加州社會服務部最新公告為準。` },
      { question: "申請執照要多久？", answer: "依我們寬鬆的估算，家庭式托兒所約 3–6 個月，托兒中心約 6–12 個月，需要裝修會更久。這是估算，不是官方處理時間；州政府不保證時間，實際取決於申請是否完整、背景審查、檢查結果與地方許可。" },
      { question: "我家可以收幾個孩子？", answer: "家庭式托兒所大約 6 到 12 名。依加州社會服務部規定：小型最多 6 名，若至少 2 名是學齡兒童且嬰兒不超過 2 名，最多 8 名；大型最多 12 名，若至少 2 名是學齡兒童且嬰兒不超過 3 名，最多 14 名，而且必須有一名助理。超過這個規模就需要托兒中心執照。" },
      { question: "家庭式托兒所和托兒中心有什麼不同？", answer: "家庭式托兒所開在持照人自己居住的住家，約 6 到 12 名孩子。托兒中心開在非住宅場地，通常收 12 名以上，需要市或郡政府的許可（視當地規定）與消防核准，也需要合格的園長和老師。" },
      { question: "我租房子，也可以開家庭式托兒所嗎？", answer: "持照人必須住在提供托育的住家裡。租屋者在加州也可能申請，但有通知房東等相關規定。請以官方資料為準，諮詢時我們可以一起看您的情況。" },
      { question: "你們的顧問費怎麼算？", answer: `採每月合作制：家庭式托兒所每月 ${family}，托兒中心每月 ${center}。包含該類型頁面列出的所有服務與定期諮詢，一路協助到取得執照並開始招生。州政府執照費、保險與開辦成本另計。第一次諮詢免費。` },
      { question: "你們合作過多少家幼兒園？", answer: `我們目前持續合作的幼兒園超過 ${n} 家，這個網站上列出的每一家都是。` },
      { question: "你們可以保證我拿到執照嗎？", answer: "不行，也沒有任何人可以。執照由加州社區照護執照處（CCLD）核發。我們能做的，是幫您把申請和場地準備好，減少被退件或補件的機會。" },
      { question: "已經有執照了，你們還能幫什麼？", answer: "可以加入 Waymaker 合作網絡，擁有中英雙語園所頁面與線上預約參觀；也可以協助您從小型升級為大型家庭托兒所，或擴大為托兒中心。" },
      { question: "可以用中文諮詢嗎？", answer: "可以。諮詢、文件說明和範本都可以用中文或英文。" },
    ];
  }

  return [
    { question: "How much does it cost to open a daycare in California?", answer: `There are two parts. Startup costs: for a family daycare, mostly home preparation, safety equipment, training, insurance and the state licensing fee; a center adds a lease, renovation, equipment and staff, which costs far more. Then Waymaker's consulting partnership: ${family} per month for a family daycare and ${center} per month for a center. For state licensing fees, check the latest CDSS information.` },
    { question: "How long does it take to get a daycare license?", answer: "By our generous estimates, about 3–6 months for a family daycare and about 6–12 months for a center, longer with construction. These are estimates, not official processing times; the state does not guarantee a timeline, and yours depends on your application, background checks, inspections and local permits." },
    { question: "How many children can I care for in my home?", answer: "A family daycare serves roughly 6 to 12 children. Under California Department of Social Services rules, a small home may care for up to 6, or up to 8 if at least 2 are school-age and no more than 2 are infants; a large home may care for up to 12, or up to 14 if at least 2 are school-age and no more than 3 are infants, and requires an assistant. Beyond that, you need a child care center licence." },
    { question: "What is the difference between a family daycare and a child care center?", answer: "A family daycare (family child care home) operates in the licensee's own home, where they must live, with roughly 6 to 12 children. A child care center operates at a non-residential site, usually for 12 or more children, and needs city or county permits where required, a fire clearance, and a qualified director and staff." },
    { question: "Can I open a family daycare if I rent?", answer: "The licensee must live in the home where care is provided. Renters in California may be able to apply, with rules such as notifying the landlord. Check the official sources, and we can look at your situation together in a consultation." },
    { question: "How much does Waymaker's consulting cost?", answer: `It is a monthly partnership: ${family} per month for a family daycare and ${center} per month for a child care center. It covers every service listed for that path and regular check-ins, until you are licensed and enrolling. State licensing fees, insurance and setup costs are separate. The first consultation is free.` },
    { question: "How many daycares have you worked with?", answer: `We actively work with more than ${n} daycares today, including every daycare listed on this site.` },
    { question: "Can you guarantee I will get a license?", answer: "No, and nobody honestly can. Licenses are issued by California's Community Care Licensing Division. What we do is help you prepare your application and site so there are fewer surprises." },
    { question: "I am already licensed. How can you help?", answer: "Join the Waymaker partner network for a bilingual profile and online tour booking, or let us help you move from a small to a large family daycare, or step up to a center." },
    { question: "Can I get help in Chinese?", answer: "Yes. Consultations, explanations and templates are available in English or Chinese." },
  ];
}
