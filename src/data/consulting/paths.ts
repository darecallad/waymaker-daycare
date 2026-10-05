/**
 * Copy for the two licence paths: family child care home and child care center.
 *
 * Capacity: the headline uses the owner's plain split (family ~6-12, center 12+) because
 * that is how owners think; the official CDSS conditions sit right underneath it so the
 * page never states the rule more loosely than the state does.
 */
import type { Locale } from "@/lib/i18n";
import type { ProviderPath } from "./shared";

interface Item { title: string; body: string }

export interface PathCopy {
  slugLabel: string;
  meta: { title: string; description: string; socialDescription: string };
  name: string;
  short: string;
  capacityHeadline: string;
  capacityDetail: string[];
  where: string;
  whoFor: string[];
  budgetNote: string;
  services: Item[];
  included: string;
  cta: string;
}

const en: Record<ProviderPath, PathCopy> = {
  family: {
    slugLabel: "Family daycare",
    meta: {
      title: "Open a Family Daycare in California (Family Child Care Home)",
      description:
        "Bilingual help opening a licensed family child care home in the Bay Area: about 6 to 12 children in your own home. Licensing paperwork, home inspection prep, training, and enrollment. $900/month.",
      socialDescription: "Open a licensed family daycare at home in the Bay Area, with help in English or Chinese.",
    },
    name: "Family daycare",
    short: "Care for children in your own home.",
    capacityHeadline: "About 6–12 children",
    capacityDetail: [
      "Small family child care home: up to 6 children, or up to 8 if at least 2 are school-age and no more than 2 are infants.",
      "Large family child care home: up to 12 children, or up to 14 if at least 2 are school-age and no more than 3 are infants. Requires an assistant.",
    ],
    where: "Your own home. The licensee must live there.",
    whoFor: [
      "Parents, grandparents and caregivers who want to work from home",
      "Experienced nannies or preschool teachers ready to run their own program",
      "Small family daycares that want to grow from small to large",
    ],
    budgetNote: "Lower startup cost than a center: mostly home preparation, safety equipment, training and insurance, plus the state licensing fee.",
    services: [
      { title: "Plan your home", body: "Small or large? We look at capacity, age mix, whether you need an assistant, and whether your home and household are ready." },
      { title: "Application paperwork", body: "We help you prepare the CCLD application forms and supporting documents, and track what is still missing." },
      { title: "Background checks and training", body: "A checklist for Live Scan, health screening and required training. Pediatric CPR and first aid through Waymaker's own classes." },
      { title: "Home inspection readiness", body: "A room-by-room walk-through so your home is ready before the licensing visit." },
      { title: "Policies and parent handbook", body: "Bilingual templates for your parent agreement, policies, daily schedule and emergency plan." },
      { title: "Enrollment", body: "A bilingual profile in the Waymaker network with online tour booking, so families can find you." },
    ],
    included: "Includes everything above, a monthly check-in, and support until you are licensed and enrolling.",
    cta: "Talk to us about a family daycare",
  },
  center: {
    slugLabel: "Child care center",
    meta: {
      title: "Open a Child Care Center in California",
      description:
        "Bilingual help opening a licensed child care center in the Bay Area for 12 or more children: site review, city permits, fire clearance, director and staff, CCLD application, inspection and enrollment. $2,100/month.",
      socialDescription: "Open a licensed child care center in the Bay Area, with help in English or Chinese.",
    },
    name: "Child care center",
    short: "A program in a commercial, church or school building.",
    capacityHeadline: "12+ children",
    capacityDetail: [
      "Capacity is set by your licence, based on your space, outdoor area and qualified staff, rather than a fixed home limit.",
    ],
    where: "A non-residential site: commercial space, church, school or community building.",
    whoFor: [
      "Owners with a site, or a budget for a lease and renovation",
      "Family daycare providers ready to move to a bigger program",
      "Churches, schools and organisations adding child care",
    ],
    budgetNote: "Higher startup cost: lease or purchase, renovation to code, furniture and equipment, qualified director and staff, and insurance, plus the state licensing fee.",
    services: [
      { title: "Site review before you sign", body: "Zoning questions to ask the city, indoor and outdoor space, restrooms, exits, and fire-clearance considerations." },
      { title: "Permits and fire clearance", body: "One plan across the city or county, the building department and the local fire authority." },
      { title: "CCLD application", body: "We help assemble the center application, facility documents and required forms." },
      { title: "Director and staffing", body: "What your director and teachers need under Title 22, plus a hiring and training plan." },
      { title: "Business plan and budget", body: "Startup and operating budget, tuition planning, and a business plan for your lender or landlord." },
      { title: "Inspection and enrollment", body: "A pre-licensing readiness walk-through, then a bilingual profile and online tour booking in the Waymaker network." },
    ],
    included: "Includes everything above, regular check-ins, and coordination until you are licensed and enrolling.",
    cta: "Talk to us about a center",
  },
};

const zh: Record<ProviderPath, PathCopy> = {
  family: {
    slugLabel: "家庭式托兒所",
    meta: {
      title: "在加州開家庭式托兒所（Family Child Care Home）",
      description:
        "中英雙語協助您在灣區自己家裡開設持照的家庭式托兒所，約可收 6 到 12 名孩子。執照申請文件、住家檢查準備、訓練與招生。每月 $900。",
      socialDescription: "在灣區自己家裡開設持照的家庭式托兒所，全程中英文協助。",
    },
    name: "家庭式托兒所",
    short: "在您自己的家裡照顧孩子。",
    capacityHeadline: "約 6–12 名孩子",
    capacityDetail: [
      "小型家庭托兒所：最多 6 名；若至少 2 名是學齡兒童，且嬰兒不超過 2 名，最多 8 名。",
      "大型家庭托兒所：最多 12 名；若至少 2 名是學齡兒童，且嬰兒不超過 3 名，最多 14 名。必須有一名助理。",
    ],
    where: "您自己的住家，持照人必須住在這裡。",
    whoFor: [
      "想在家工作的父母、祖父母或照顧者",
      "有經驗、準備自己經營的保母或幼教老師",
      "想從小型擴大為大型的家庭托兒所",
    ],
    budgetNote: "開辦成本比托兒中心低：主要是住家整理、安全設備、訓練與保險，以及州政府的執照費。",
    services: [
      { title: "住家規劃", body: "小型還是大型？我們評估收托人數、年齡組合、是否需要助理，以及住家和家人是否準備好。" },
      { title: "申請文件", body: "協助準備 CCLD 申請表與附件，並追蹤還缺哪些文件。" },
      { title: "背景審查與訓練", body: "Live Scan、健康檢查與必要訓練的檢查清單。兒童 CPR 與急救由 Waymaker 自己開課。" },
      { title: "住家檢查準備", body: "逐一房間檢查，讓您的住家在執照人員來訪前就準備好。" },
      { title: "政策與家長手冊", body: "中英雙語範本：家長合約、園所政策、每日作息與緊急應變計劃。" },
      { title: "招生", body: "在 Waymaker 網絡建立中英雙語園所頁面，家長可以線上預約參觀。" },
    ],
    included: "包含以上所有服務、每月固定諮詢，一路協助到取得執照並開始招生。",
    cta: "諮詢家庭式托兒所",
  },
  center: {
    slugLabel: "托兒中心",
    meta: {
      title: "在加州開托兒中心（Child Care Center）",
      description:
        "中英雙語協助您在灣區開設可收 12 名以上孩子的持照托兒中心：場地評估、市政府許可、消防核准、園長與師資、CCLD 申請、檢查與招生。每月 $2,100。",
      socialDescription: "在灣區開設持照托兒中心，全程中英文協助。",
    },
    name: "托兒中心",
    short: "開在商業空間、教會或學校建築的園所。",
    capacityHeadline: "12 名以上孩子",
    capacityDetail: [
      "收托人數依執照而定，根據您的室內外空間與合格師資核定，不像住家有固定上限。",
    ],
    where: "非住宅場地：商業空間、教會、學校或社區建築。",
    whoFor: [
      "已有場地，或有租約與裝修預算的經營者",
      "準備升級到更大規模的家庭托兒所",
      "想增設托育服務的教會、學校與機構",
    ],
    budgetNote: "開辦成本較高：租金或購置、依法規裝修、家具設備、合格的園長與老師、保險，以及州政府的執照費。",
    services: [
      { title: "簽約前的場地評估", body: "要問市政府的分區問題、室內外空間、廁所、出口，以及消防核准的考量。" },
      { title: "許可與消防核准", body: "整合市或郡政府、建築部門與當地消防單位的步驟。" },
      { title: "CCLD 申請", body: "協助準備托兒中心申請表、場地文件與必要表格。" },
      { title: "園長與師資", body: "說明 Title 22 對園長與老師的要求，並規劃招聘與訓練。" },
      { title: "商業計劃與預算", body: "開辦與營運預算、學費規劃，以及給銀行或房東看的商業計劃書。" },
      { title: "檢查與招生", body: "開業前逐項檢查，再到 Waymaker 網絡建立中英雙語頁面與線上預約參觀。" },
    ],
    included: "包含以上所有服務、定期諮詢與協調，一路協助到取得執照並開始招生。",
    cta: "諮詢托兒中心",
  },
};

export const pathCopy: Record<Locale, Record<ProviderPath, PathCopy>> = { en, zh };
