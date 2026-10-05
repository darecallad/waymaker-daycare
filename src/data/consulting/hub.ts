/** Copy for the /for-providers hub: two journeys (start vs grow) and the shared sections. */
import type { Locale } from "@/lib/i18n";
import { TRACK_RECORD, type InquiryStage, type InquiryType } from "./shared";

const n = TRACK_RECORD.daycaresWorkedWith;

const en = {
  meta: {
    title: "Daycare Consulting in California: Family Daycares & Child Care Centers",
    description: `Bilingual (English/Chinese) daycare consulting in the Bay Area. We have worked with ${n}+ daycares: licensing for family child care homes and child care centers, then enrollment through the Waymaker network.`,
    socialDescription: `Bilingual help opening or growing a licensed daycare in the Bay Area. ${n}+ daycares worked with.`,
  },
  breadcrumb: { home: "Home", page: "For Providers" },
  hero: {
    eyebrow: "For daycare owners",
    title: "Open or grow a licensed daycare in California, in English or Chinese",
    lead: "From your first licensing orientation to a full classroom: we help family daycares and child care centers get licensed, then fill their spots.",
    stat: `${n}+ Bay Area daycares worked with`,
  },
  journeys: {
    title: "Where are you today?",
    start: {
      title: "I want to open a daycare",
      body: "Choose a path, see the licensing timeline, and get a plan for your home or site.",
      cta: "Start here",
    },
    grow: {
      title: "I already run a daycare",
      body: "Fill open spots, move from a small to a large family daycare, or step up to a center.",
      cta: "Grow with us",
    },
  },
  types: {
    eyebrow: "Two paths",
    title: "Family daycare or child care center?",
    capacity: "Children",
    where: "Where",
    price: "Partnership",
    learnMore: "See details",
    sourceNote: "Capacity rules: California Department of Social Services.",
  },
  timeline: {
    title: "How long does licensing take?",
    body: "About 3–6 months for a family daycare and 6–12 months or more for a center, by our generous estimates. See every step, with official sources.",
    cta: "See the licensing timeline",
  },
  grow: {
    eyebrow: "Already licensed",
    title: "Grow the daycare you already run",
    items: [
      { title: "Fill open spots", body: "A bilingual profile in the Waymaker network, found by search engines, with online tour booking and reminders." },
      { title: "Small to large", body: "Plan the move from a small to a large family child care home: capacity, an assistant, and the fire clearance." },
      { title: "Family daycare to center", body: "Ready for a bigger program? We help you find a site and run the center licensing process." },
    ],
    cta: "Talk to us about growing",
  },
  network: {
    eyebrow: "Our track record",
    title: `${n}+ daycares we work with`,
    body: "Every daycare in our partner network is one we actively work with today. Here are some of them; each has its own bilingual profile and online tour booking.",
    cta: "See all partner daycares",
  },
  why: {
    eyebrow: "Why Waymaker",
    title: "What makes us different",
    items: [
      { title: "English and Chinese", body: "Licensing terms, forms and conversations explained in the language you think in." },
      { title: "Bay Area focus", body: "We work with daycares across Sunnyvale, Santa Clara and Newark, and know the region." },
      { title: "Licensing and enrollment", body: "Most consultants stop at the license. We keep going until families are touring." },
      { title: "Training in-house", body: "Pediatric CPR and first aid classes from Waymaker, no extra vendor." },
    ],
  },
  honest: {
    title: "What we will not promise",
    body: "Licensing decisions are made by California's Community Care Licensing Division, and timelines depend on your application, background checks, inspections and local permits. We will not guarantee approval or a date. We are consultants, not lawyers; for legal or tax questions, talk to a licensed professional. The California Child Care Resource & Referral agencies also offer free help, and we are happy to point you to them.",
  },
  form: {
    eyebrow: "Free consultation",
    title: "Tell us about your plans",
    intro: "We reply within two business days, in English or Chinese.",
    name: "Your name",
    email: "Email",
    phone: "Phone",
    city: "City",
    type: "Which path?",
    types: { family: "Family daycare", center: "Child care center", "not-sure": "Not sure yet" } satisfies Record<InquiryType, string>,
    stage: "Where are you now?",
    stages: {
      exploring: "Just exploring",
      "have-location": "I have a home or site in mind",
      applying: "Already applying",
      licensed: "Already licensed, want to grow",
    } satisfies Record<InquiryStage, string>,
    language: "Preferred language",
    languages: { en: "English", zh: "中文" },
    message: "Anything else we should know? (optional)",
    submit: "Request a free consultation",
    sending: "Sending…",
    required: "Required",
    successTitle: "Thank you! We received your request.",
    successBody: "We will contact you within two business days.",
    error: "Something went wrong. Please try again, or email us directly.",
    rateLimited: "Too many requests. Please try again later, or email us directly.",
    privacy: "We only use your details to reply to this request.",
  },
  faq: { eyebrow: "Questions owners ask", title: "Frequently Asked Questions" },
  sources: { title: "Official sources", verified: "Facts on this page last checked", newTab: "(opens in a new tab)" },
  perMonth: "per month",
  pricingNote: "Monthly partnership fee for Waymaker's consulting. State licensing fees, insurance and setup costs are separate.",
};

export type HubCopy = typeof en;

const zh: HubCopy = {
  meta: {
    title: "加州幼兒園開業顧問：家庭式托兒所與托兒中心",
    description: `灣區中英雙語幼兒園顧問。我們合作過 ${n} 家以上的幼兒園：協助家庭式托兒所與托兒中心申請執照，再透過 Waymaker 網絡招生。`,
    socialDescription: `中英雙語協助您在灣區開設或擴大持照幼兒園。已合作 ${n} 家以上。`,
  },
  breadcrumb: { home: "首頁", page: "開園諮詢" },
  hero: {
    eyebrow: "給幼兒園經營者",
    title: "在加州開設或擴大持照幼兒園，全程中英文協助",
    lead: "從第一場執照說明會到招滿學生：我們協助家庭式托兒所與托兒中心取得執照，再幫您招生。",
    stat: `已合作 ${n} 家以上灣區幼兒園`,
  },
  journeys: {
    title: "您現在的情況是？",
    start: { title: "我想開幼兒園", body: "選擇類型、看執照時間表，並為您的住家或場地擬定計劃。", cta: "從這裡開始" },
    grow: { title: "我已經在經營幼兒園", body: "招滿空位、從小型升級為大型家庭托兒所，或擴大為托兒中心。", cta: "一起成長" },
  },
  types: {
    eyebrow: "兩種類型",
    title: "家庭式托兒所，還是托兒中心？",
    capacity: "收托人數",
    where: "地點",
    price: "合作費用",
    learnMore: "了解詳情",
    sourceNote: "收托人數規定來源：加州社會服務部（CDSS）。",
  },
  timeline: {
    title: "申請執照要多久？",
    body: "依我們寬鬆的估算，家庭式托兒所約 3–6 個月，托兒中心約 6–12 個月或更久。每一步都附官方資料來源。",
    cta: "看執照時間表",
  },
  grow: {
    eyebrow: "已經有執照",
    title: "讓您的幼兒園繼續成長",
    items: [
      { title: "招滿空位", body: "在 Waymaker 網絡建立搜尋引擎找得到的中英雙語頁面，家長可以線上預約參觀並收到提醒。" },
      { title: "從小型升級為大型", body: "規劃從小型升級為大型家庭托兒所：收托人數、助理與消防核准。" },
      { title: "從家庭式擴大為中心", body: "準備好經營更大的園所？我們協助您找場地，並走完托兒中心的執照流程。" },
    ],
    cta: "諮詢擴大經營",
  },
  network: {
    eyebrow: "合作實績",
    title: `合作中的幼兒園超過 ${n} 家`,
    body: "合作網絡裡的每一家幼兒園，都是我們目前持續合作的。以下是其中幾家，每一家都有自己的中英雙語頁面與線上預約參觀。",
    cta: "看所有合作幼兒園",
  },
  why: {
    eyebrow: "為什麼選 Waymaker",
    title: "我們的不同之處",
    items: [
      { title: "中英雙語", body: "執照術語、表格和溝通，都用您最熟悉的語言說明。" },
      { title: "專注灣區", body: "我們和桑尼維爾、聖克拉拉、紐瓦克的幼兒園合作，熟悉這個地區。" },
      { title: "執照加招生", body: "多數顧問拿到執照就結束，我們一路陪到家長來參觀。" },
      { title: "訓練自己來", body: "Waymaker 自己開兒童 CPR 與急救課程，不用另外找廠商。" },
    ],
  },
  honest: {
    title: "我們不會承諾的事",
    body: "執照由加州社區照護執照處（CCLD）核發，所需時間取決於您的申請、背景審查、檢查與地方許可。我們不保證一定核准，也不保證日期。我們是顧問，不是律師；法律或稅務問題，請諮詢有執照的專業人士。加州各地的 Child Care Resource & Referral 機構也提供免費協助，我們很樂意為您介紹。",
  },
  form: {
    eyebrow: "免費諮詢",
    title: "告訴我們您的計劃",
    intro: "我們會在兩個工作天內用中文或英文回覆您。",
    name: "您的姓名",
    email: "Email",
    phone: "電話",
    city: "城市",
    type: "哪一種類型？",
    types: { family: "家庭式托兒所", center: "托兒中心", "not-sure": "還不確定" },
    stage: "您目前的進度？",
    stages: { exploring: "只是先了解", "have-location": "已經有住家或場地", applying: "正在申請", licensed: "已經有執照，想擴大" },
    language: "偏好的溝通語言",
    languages: { en: "English", zh: "中文" },
    message: "還有什麼想讓我們知道的嗎？（選填）",
    submit: "預約免費諮詢",
    sending: "送出中…",
    required: "必填",
    successTitle: "謝謝您！我們已收到您的需求。",
    successBody: "我們會在兩個工作天內與您聯繫。",
    error: "發生錯誤，請再試一次，或直接寄 email 給我們。",
    rateLimited: "送出次數太多，請稍後再試，或直接寄 email 給我們。",
    privacy: "您的資料只會用來回覆這次的諮詢。",
  },
  faq: { eyebrow: "開園常問", title: "常見問題" },
  sources: { title: "官方資料來源", verified: "本頁資訊最後查核時間", newTab: "（在新分頁開啟，英文網站）" },
  perMonth: "每月",
  pricingNote: "Waymaker 顧問服務的每月合作費用。州政府執照費、保險與開辦成本另計。",
};

export const hubCopy: Record<Locale, HubCopy> = { en, zh };
