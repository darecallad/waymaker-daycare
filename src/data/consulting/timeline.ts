/**
 * Licensing timeline: the steps come from the CDSS application-steps documents; the
 * durations are Waymaker ESTIMATES, deliberately generous, owner to refine.
 * Steps overlap in practice, so the total is stated separately rather than summed.
 */
import type { Locale } from "@/lib/i18n";
import type { ProviderPath, SourceKey } from "./shared";

export interface TimelineStep {
  title: string;
  duration: string;
  body: string;
  source: SourceKey;
}

export interface TimelineCopy {
  total: string;
  steps: TimelineStep[];
}

export interface TimelinePageCopy {
  meta: { title: string; description: string; socialDescription: string };
  breadcrumb: string;
  eyebrow: string;
  title: string;
  lead: string;
  disclaimer: string;
  totalLabel: string;
  officialLink: string;
  slowDownTitle: string;
  slowDown: string[];
  cta: string;
  paths: Record<ProviderPath, TimelineCopy>;
}

const en: TimelinePageCopy = {
  meta: {
    title: "How Long Does It Take to Open a Daycare in California? Licensing Timeline",
    description:
      "Step-by-step California daycare licensing timeline for family child care homes (about 3–6 months) and child care centers (about 6–12 months or more): orientation, application, background checks, fire and building, inspection, opening.",
    socialDescription: "Step-by-step California daycare licensing timeline, with official CDSS sources.",
  },
  breadcrumb: "Licensing timeline",
  eyebrow: "California licensing",
  title: "How long does it take to open a daycare in California?",
  lead: "Every step below comes from the California Department of Social Services. The time ranges are our own generous estimates from helping providers through the process.",
  disclaimer: "Time ranges are Waymaker estimates, not official processing times. The state does not guarantee a timeline; yours depends on how complete your application is, background checks, inspections and, for centers, local permits.",
  totalLabel: "Typical total",
  officialLink: "Official source",
  slowDownTitle: "What usually slows things down",
  slowDown: [
    "Missing documents or forms that have to be resubmitted",
    "Household members or staff whose background checks take longer",
    "Fixes found at the fire or licensing inspection",
    "For centers: zoning, building permits and renovation",
  ],
  cta: "Get your own timeline in a free consultation",
  paths: {
    family: {
      total: "About 3–6 months",
      steps: [
        { title: "Licensing orientation", duration: "1–2 weeks", body: "Take the CDSS family child care home orientation online, live virtual or in person.", source: "orientation" },
        { title: "Prepare and submit the application", duration: "2–4 weeks", body: "Complete the application forms and gather supporting documents for you and your household.", source: "fcchSteps" },
        { title: "Background checks and training", duration: "2–8 weeks", body: "Live Scan fingerprints for adults in the home, health screening, and required health and safety training including pediatric CPR and first aid.", source: "liveScan" },
        { title: "Fire clearance and home preparation", duration: "2–6 weeks", body: "Get the home ready to code. A large family child care home also needs a fire clearance.", source: "fcchSteps" },
        { title: "Home inspection", duration: "4–12 weeks", body: "A licensing analyst visits your home. Any deficiencies must be corrected before the licence is issued.", source: "fcchSteps" },
        { title: "Licensed: open and enroll", duration: "Ongoing", body: "Start enrolling families. With Waymaker, your bilingual profile and tour booking go live in the network.", source: "howTo" },
      ],
    },
    center: {
      total: "About 6–12 months, longer with construction",
      steps: [
        { title: "Licensing orientation", duration: "1–2 weeks", body: "Take the CDSS child care center orientation online.", source: "orientation" },
        { title: "Find and approve a site", duration: "1–4 months", body: "Choose a location and confirm zoning. Some cities require a conditional use permit.", source: "centerSteps" },
        { title: "Building, fire and local permits", duration: "2–6 months", body: "Renovate to code and obtain a fire clearance from the local fire authority, plus any city or county permits and business licence.", source: "centerSteps" },
        { title: "Application, director and staff", duration: "1–3 months", body: "Submit the center application, hire a qualified director and teachers, and complete Live Scan and required training.", source: "centerSteps" },
        { title: "Pre-licensing inspection", duration: "4–12 weeks", body: "A licensing analyst inspects the facility. Deficiencies must be corrected before the licence is issued.", source: "centerSteps" },
        { title: "Licensed: open and enroll", duration: "Ongoing", body: "Open your doors. With Waymaker, your bilingual profile and tour booking go live in the network.", source: "howTo" },
      ],
    },
  },
};

const zh: TimelinePageCopy = {
  meta: {
    title: "在加州開幼兒園要多久？執照申請流程與時間表",
    description:
      "加州幼兒園執照申請流程：家庭式托兒所約 3–6 個月，托兒中心約 6–12 個月或更久。說明會、申請、背景審查、消防與建築、檢查到開業，每一步都附官方資料來源。",
    socialDescription: "加州幼兒園執照申請流程與時間表，附加州政府官方資料來源。",
  },
  breadcrumb: "執照時間表",
  eyebrow: "加州執照",
  title: "在加州開幼兒園要多久？",
  lead: "以下每一個步驟都來自加州社會服務部（CDSS）。時間是我們協助經營者申請的經驗估算，抓得比較寬鬆。",
  disclaimer: "時間範圍是 Waymaker 的估算，不是官方處理時間。州政府不保證時間，實際所需取決於申請是否完整、背景審查、檢查結果，以及托兒中心需要的地方許可。",
  totalLabel: "一般總共",
  officialLink: "官方資料",
  slowDownTitle: "常見的延誤原因",
  slowDown: [
    "文件或表格缺漏，需要重新補件",
    "家人或員工的背景審查需要比較久",
    "消防或執照檢查時發現需要改善的地方",
    "托兒中心：分區、建築許可與裝修",
  ],
  cta: "免費諮詢，取得您專屬的時間表",
  paths: {
    family: {
      total: "約 3–6 個月",
      steps: [
        { title: "參加執照說明會", duration: "1–2 週", body: "參加 CDSS 家庭托兒所說明會，可選擇線上、線上直播或實體。", source: "orientation" },
        { title: "準備並送出申請", duration: "2–4 週", body: "填寫申請表，並準備您與家人的相關文件。", source: "fcchSteps" },
        { title: "背景審查與訓練", duration: "2–8 週", body: "家中成年人做 Live Scan 指紋、健康檢查，並完成必要的健康安全訓練，包括兒童 CPR 與急救。", source: "liveScan" },
        { title: "消防核准與住家準備", duration: "2–6 週", body: "依規定整理住家。大型家庭托兒所還需要消防核准。", source: "fcchSteps" },
        { title: "住家檢查", duration: "4–12 週", body: "執照人員到府檢查。發現的問題要改善後才會核發執照。", source: "fcchSteps" },
        { title: "取得執照：開業招生", duration: "持續", body: "開始招生。加入 Waymaker 後，您的中英雙語頁面與線上預約參觀就會上線。", source: "howTo" },
      ],
    },
    center: {
      total: "約 6–12 個月，需要裝修會更久",
      steps: [
        { title: "參加執照說明會", duration: "1–2 週", body: "參加 CDSS 托兒中心線上說明會。", source: "orientation" },
        { title: "尋找並確認場地", duration: "1–4 個月", body: "選擇地點並確認分區。部分城市需要申請 conditional use permit（附條件使用許可）。", source: "centerSteps" },
        { title: "建築、消防與地方許可", duration: "2–6 個月", body: "依法規裝修，取得當地消防單位的消防核准，以及市或郡政府的許可與營業執照。", source: "centerSteps" },
        { title: "申請、園長與師資", duration: "1–3 個月", body: "送出托兒中心申請，聘請合格的園長與老師，完成 Live Scan 與必要訓練。", source: "centerSteps" },
        { title: "開業前執照檢查", duration: "4–12 週", body: "執照人員檢查場地。發現的問題要改善後才會核發執照。", source: "centerSteps" },
        { title: "取得執照：開業招生", duration: "持續", body: "正式開業。加入 Waymaker 後，您的中英雙語頁面與線上預約參觀就會上線。", source: "howTo" },
      ],
    },
  },
};

export const timelineCopy: Record<Locale, TimelinePageCopy> = { en, zh };
