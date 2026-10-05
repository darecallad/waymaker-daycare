/**
 * Copy for the provider consulting page (`/for-providers`).
 *
 * Rules for this file, because it makes claims to people about to spend real money:
 * - Every regulatory fact must come from an official CDSS / CCLD source listed in
 *   `OFFICIAL_SOURCES`, and is phrased no more strongly than the source.
 * - No licensing fees, processing times, ratios or square footage: they change, vary by
 *   case, or could not be verified from an official page. We send people to the source.
 * - No outcome promises ("100% licensed", "guaranteed approval") and no unverifiable
 *   track-record numbers. Licensing decisions belong to CCLD, not to us.
 */
import type { Locale } from "@/lib/i18n";
import type { FaqItem } from "@/data/faq";

/** When the facts on this page were last checked against the official sources. */
export const FACTS_VERIFIED = "2026-10";

export const OFFICIAL_SOURCES = [
  {
    key: "howTo",
    url: "https://www.cdss.ca.gov/inforesources/child-care-licensing/how-to-become-licensed",
    en: "CDSS: How to become licensed",
    zh: "加州社會服務部（CDSS）：如何取得執照",
  },
  {
    key: "orientation",
    url: "https://www.cdss.ca.gov/inforesources/child-care-licensing/how-to-become-licensed/register-for-an-orientation",
    en: "CDSS: Register for a licensing orientation",
    zh: "CDSS：報名執照說明會",
  },
  {
    key: "capacity",
    url: "https://www.cdss.ca.gov/Portals/9/CCLD/CCP%20Documents/Capacity%20Requirements%20FCCHs.pdf",
    en: "CDSS: Family child care home capacity requirements (PDF)",
    zh: "CDSS：家庭托兒所收托人數規定（PDF）",
  },
  {
    key: "fcchSteps",
    url: "https://www.cdss.ca.gov/Portals/9/CCLD/CCP%20Documents/family-child-care-home-application-steps.pdf",
    en: "CDSS: Family child care home application steps (PDF)",
    zh: "CDSS：家庭托兒所申請步驟（PDF）",
  },
  {
    key: "centerSteps",
    url: "https://www.cdss.ca.gov/Portals/9/CCLD/CCP%20Documents/child-care-center-license-application-steps.pdf",
    en: "CDSS: Child care center application steps (PDF)",
    zh: "CDSS：托兒中心申請步驟（PDF）",
  },
  {
    key: "regulations",
    url: "https://www.cdss.ca.gov/inforesources/Child-Care-Licensing/Resources-for-Providers/Laws-and-Regulations",
    en: "CDSS: Child care laws and regulations (Title 22)",
    zh: "CDSS：托育法規（Title 22）",
  },
] as const;

/** The two licence paths. Ids double as form values and in-page anchors. */
export const PATHS = ["family", "center"] as const;
export type ProviderPath = (typeof PATHS)[number];

/** What the inquiry form asks for. Shared by the form and the API validator. */
export const INQUIRY_TYPES = ["family-small", "family-large", "center", "not-sure", "licensed"] as const;
export const INQUIRY_STAGES = ["exploring", "have-location", "applying", "licensed"] as const;
export type InquiryType = (typeof INQUIRY_TYPES)[number];
export type InquiryStage = (typeof INQUIRY_STAGES)[number];

const en = {
  meta: {
    title: "Daycare Consulting in California: Family Child Care Homes & Centers",
    description:
      "Bilingual (English/Chinese) help opening a licensed daycare in the Bay Area: family child care homes and child care centers. Licensing paperwork, inspection prep, business setup, and enrollment after you open.",
    socialDescription: "Bilingual help opening a licensed family child care home or child care center in the Bay Area.",
  },
  breadcrumb: { home: "Home", page: "For Providers" },
  hero: {
    eyebrow: "For daycare owners",
    title: "Open a licensed daycare in California, with help in English or Chinese",
    lead: "Whether you want to care for children in your own home or open a child care center, we help you understand the California licensing path, prepare your application and site, and fill your spots once you open.",
    primary: "Get a free consultation",
    secondary: "Which license fits me?",
  },
  compare: {
    eyebrow: "Two paths",
    title: "Family child care home or child care center?",
    intro: "California licenses these differently. The right one depends on where you will provide care and how many children you want to serve.",
    rowLabels: { where: "Where", size: "How many children", process: "What the process involves", fits: "Usually fits" },
    family: {
      name: "Family child care home",
      where: "Your own home. The licensee must live there.",
      size: [
        "Small: up to 6 children, or up to 8 if at least 2 are school-age and no more than 2 are infants.",
        "Large: up to 12 children, or up to 14 if at least 2 are school-age and no more than 3 are infants. A large home requires an assistant.",
      ],
      process: "Orientation (online, live virtual or in person), application, background checks, required training, and a home inspection.",
      fits: "Caregivers starting small, or growing an existing home daycare from small to large.",
      cta: "See family daycare help",
    },
    center: {
      name: "Child care center",
      where: "A non-residential site such as a commercial space, church or school building.",
      size: ["Set by the licence, the space and staffing, rather than a fixed home limit."],
      process: "Orientation (online), application, city or county permits where required, a fire clearance from the local fire authority, qualified director and staff, and a pre-licensing inspection.",
      fits: "Owners with a site and budget for a larger program, or home providers ready to move up.",
      cta: "See center help",
    },
    sourceNote: "Source: California Department of Social Services. Rules change, so always confirm with the official pages below.",
  },
  services: {
    eyebrow: "How we help",
    family: {
      title: "Family child care home",
      items: [
        { title: "Plan your home", body: "Small or large? We walk through capacity, age mix, an assistant, and whether your home and household are ready." },
        { title: "Application paperwork", body: "Help preparing the CCLD application forms and supporting documents, and keeping track of what is still missing." },
        { title: "Inspection readiness", body: "A walk-through checklist so your home is ready before the licensing visit, not after." },
        { title: "Policies and parent handbook", body: "Bilingual templates for your parent agreement, policies and daily routines." },
        { title: "Training", body: "Pediatric CPR and first aid through Waymaker's own classes, plus guidance on the other required training." },
        { title: "Small to large", body: "Already licensed? We help you plan the move to a large family child care home." },
      ],
    },
    center: {
      title: "Child care center",
      items: [
        { title: "Site and feasibility", body: "Review a location before you sign: zoning questions to ask the city, space, outdoor area, and fire-clearance considerations." },
        { title: "Permits and licensing", body: "A step-by-step plan across CCLD, the city or county, and the fire authority, and help assembling the application." },
        { title: "Business plan and budget", body: "Startup and operating budget, tuition planning and a business plan you can take to a lender or landlord." },
        { title: "Director and staffing", body: "What Title 22 requires of your director and teachers, plus hiring and training plans." },
        { title: "Policies and curriculum", body: "Operations manual, parent handbook and program design, in English and Chinese." },
        { title: "Pre-licensing inspection", body: "A readiness walk-through so the inspection is a confirmation, not a surprise." },
      ],
    },
  },
  after: {
    eyebrow: "After you are licensed",
    title: "A license is the start. Families are the business.",
    body: "Most consultants stop when the license arrives. Waymaker runs a network of licensed Bay Area daycares that parents browse and book tours with online, in English and Chinese. When your program is licensed, you can apply to join.",
    points: [
      "A bilingual profile page that search engines can find",
      "Online tour booking with reminders",
      "Listed alongside our partner daycares in Sunnyvale, Santa Clara and Newark",
    ],
    cta: "See the partner network",
  },
  why: {
    eyebrow: "Why Waymaker",
    title: "What makes us different",
    items: [
      { title: "English and Chinese", body: "Licensing terms, forms and conversations explained in the language you think in." },
      { title: "Bay Area focus", body: "We work with daycares in Sunnyvale, Santa Clara and Newark, and know the region." },
      { title: "We run daycares too", body: "Waymaker works with licensed daycares every day: tours, families, schedules." },
      { title: "Training in-house", body: "Pediatric CPR and first aid classes from Waymaker, no extra vendor." },
    ],
  },
  steps: {
    eyebrow: "How it works",
    title: "Working with us",
    items: [
      { title: "Free consultation", body: "Tell us your situation. We tell you which license fits and what the path looks like." },
      { title: "Your plan", body: "A written checklist for your path, with what you do, what we do, and what the state does." },
      { title: "Prepare and apply", body: "We help with paperwork, your site and training, and keep you on track until inspection." },
      { title: "Open and enroll", body: "Join the Waymaker network and start booking tours with families." },
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
    city: "City where you plan to open",
    type: "What are you planning?",
    types: {
      "family-small": "Small family child care home",
      "family-large": "Large family child care home",
      center: "Child care center",
      "not-sure": "Not sure yet",
      licensed: "Already licensed, want to grow",
    } satisfies Record<InquiryType, string>,
    stage: "Where are you now?",
    stages: {
      exploring: "Just exploring",
      "have-location": "I have a home or site in mind",
      applying: "Already applying",
      licensed: "Already licensed",
    } satisfies Record<InquiryStage, string>,
    language: "Preferred language",
    languages: { en: "English", zh: "中文" },
    message: "Anything else we should know? (optional)",
    submit: "Request a consultation",
    sending: "Sending…",
    required: "Required",
    successTitle: "Thank you! We received your request.",
    successBody: "We will contact you within two business days.",
    error: "Something went wrong. Please try again, or email us directly.",
    rateLimited: "Too many requests. Please try again later, or email us directly.",
    privacy: "We only use your details to reply to this request.",
  },
  sources: { title: "Official sources", verified: "Facts on this page last checked" },
};

type ConsultingCopy = typeof en;

const zh: ConsultingCopy = {
  meta: {
    title: "加州幼兒園開業顧問：家庭式托兒所與托兒中心",
    description:
      "中英雙語協助您在灣區開設合法持照的幼兒園：家庭式托兒所（Family Child Care Home）與托兒中心（Child Care Center）。執照申請文件、檢查準備、商業規劃，以及開業後的招生。",
    socialDescription: "中英雙語協助您在灣區開設持照的家庭式托兒所或托兒中心。",
  },
  breadcrumb: { home: "首頁", page: "開園諮詢" },
  hero: {
    eyebrow: "給想開幼兒園的您",
    title: "在加州開一間合法持照的幼兒園，全程中英文協助",
    lead: "不論您想在自己家裡照顧孩子，還是開一間托兒中心，我們協助您了解加州的執照流程、準備申請文件與場地，並在開業後幫您招滿學生。",
    primary: "預約免費諮詢",
    secondary: "我適合哪一種執照？",
  },
  compare: {
    eyebrow: "兩種執照",
    title: "家庭式托兒所，還是托兒中心？",
    intro: "加州對這兩種的執照規定不同。適合哪一種，取決於您在哪裡照顧孩子，以及想收多少孩子。",
    rowLabels: { where: "地點", size: "可收托人數", process: "申請流程包括", fits: "通常適合" },
    family: {
      name: "家庭式托兒所",
      where: "您自己的住家，持照人必須住在這裡。",
      size: [
        "小型：最多 6 名孩子；若至少 2 名是學齡兒童，且嬰兒不超過 2 名，最多可收 8 名。",
        "大型：最多 12 名孩子；若至少 2 名是學齡兒童，且嬰兒不超過 3 名，最多可收 14 名。大型必須有一名助理。",
      ],
      process: "說明會（線上、線上直播或實體）、申請表、背景審查、必要的訓練，以及住家檢查。",
      fits: "想從小規模開始的照顧者，或想把現有家庭托兒所從小型擴大為大型的人。",
      cta: "了解家庭式托兒所協助",
    },
    center: {
      name: "托兒中心",
      where: "非住宅場地，例如商業空間、教會或學校建築。",
      size: ["依執照、場地空間與人力而定，不像住家有固定的上限。"],
      process: "說明會（線上）、申請表、市或郡政府需要的許可、當地消防單位的消防核准、合格的園長與老師，以及開業前的執照檢查。",
      fits: "已有場地與預算、想經營較大規模的人，或準備升級的家庭托兒所經營者。",
      cta: "了解托兒中心協助",
    },
    sourceNote: "資料來源：加州社會服務部（CDSS）。法規可能變動，請務必以下方官方網頁為準。",
  },
  services: {
    eyebrow: "我們怎麼協助",
    family: {
      title: "家庭式托兒所",
      items: [
        { title: "住家規劃", body: "小型還是大型？我們一起評估收托人數、年齡組合、是否需要助理，以及住家和家人是否準備好了。" },
        { title: "申請文件", body: "協助準備 CCLD 申請表與附件，並追蹤還缺哪些文件。" },
        { title: "檢查準備", body: "提供逐項檢查清單，讓您的住家在執照人員來訪前就準備好。" },
        { title: "政策與家長手冊", body: "中英雙語範本：家長合約、園所政策與每日作息。" },
        { title: "訓練課程", body: "Waymaker 自己開設兒童 CPR 與急救課程，也會說明其他必要的訓練。" },
        { title: "從小型升級為大型", body: "已經有執照了？我們協助您規劃升級為大型家庭托兒所。" },
      ],
    },
    center: {
      title: "托兒中心",
      items: [
        { title: "場地評估", body: "簽約前先評估地點：要問市政府哪些分區問題、室內外空間，以及消防核准的考量。" },
        { title: "許可與執照", body: "整合 CCLD、市或郡政府與消防單位的步驟，並協助準備申請文件。" },
        { title: "商業計劃與預算", body: "開辦與營運預算、學費規劃，以及可以拿給銀行或房東看的商業計劃書。" },
        { title: "園長與師資", body: "說明 Title 22 對園長與老師的資格要求，並協助規劃招聘與訓練。" },
        { title: "政策與課程", body: "營運手冊、家長手冊與課程設計，中英文都有。" },
        { title: "開業前檢查", body: "事先逐項檢查，讓執照檢查只是確認，不會有意外。" },
      ],
    },
  },
  after: {
    eyebrow: "拿到執照之後",
    title: "執照只是開始，招到學生才是事業。",
    body: "多數顧問拿到執照就結束了。Waymaker 經營一個灣區持照幼兒園網絡，家長可以用中文或英文在線上瀏覽並預約參觀。您的園所取得執照後，可以申請加入。",
    points: [
      "搜尋引擎找得到的中英雙語園所頁面",
      "線上預約參觀與提醒",
      "和桑尼維爾、聖克拉拉、紐瓦克的合作幼兒園一起展示",
    ],
    cta: "看看合作幼兒園網絡",
  },
  why: {
    eyebrow: "為什麼選 Waymaker",
    title: "我們的不同之處",
    items: [
      { title: "中英雙語", body: "執照術語、表格和溝通，都用您最熟悉的語言說明。" },
      { title: "專注灣區", body: "我們和桑尼維爾、聖克拉拉、紐瓦克的幼兒園合作，熟悉這個地區。" },
      { title: "我們每天都在和幼兒園合作", body: "參觀、家長、排程，這些都是我們每天在做的事。" },
      { title: "訓練自己來", body: "Waymaker 自己開兒童 CPR 與急救課程，不用另外找廠商。" },
    ],
  },
  steps: {
    eyebrow: "合作流程",
    title: "和我們合作",
    items: [
      { title: "免費諮詢", body: "告訴我們您的情況，我們告訴您適合哪一種執照，以及大概的流程。" },
      { title: "專屬計劃", body: "一份書面檢查清單：哪些是您要做的、哪些是我們做的、哪些是政府審核的。" },
      { title: "準備與申請", body: "協助文件、場地與訓練，一路陪您到執照檢查。" },
      { title: "開業與招生", body: "加入 Waymaker 網絡，開始接受家長預約參觀。" },
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
    city: "預計開業的城市",
    type: "您打算開哪一種？",
    types: {
      "family-small": "小型家庭式托兒所",
      "family-large": "大型家庭式托兒所",
      center: "托兒中心",
      "not-sure": "還不確定",
      licensed: "已經有執照，想擴大",
    },
    stage: "您目前的進度？",
    stages: {
      exploring: "只是先了解",
      "have-location": "已經有住家或場地",
      applying: "正在申請",
      licensed: "已經有執照",
    },
    language: "偏好的溝通語言",
    languages: { en: "English", zh: "中文" },
    message: "還有什麼想讓我們知道的嗎？（選填）",
    submit: "預約諮詢",
    sending: "送出中…",
    required: "必填",
    successTitle: "謝謝您！我們已收到您的需求。",
    successBody: "我們會在兩個工作天內與您聯繫。",
    error: "發生錯誤，請再試一次，或直接寄 email 給我們。",
    rateLimited: "送出次數太多，請稍後再試，或直接寄 email 給我們。",
    privacy: "您的資料只會用來回覆這次的諮詢。",
  },
  sources: { title: "官方資料來源", verified: "本頁資訊最後查核時間" },
};

export const consultingCopy: Record<Locale, ConsultingCopy> = { en, zh };

/** Provider FAQ. The visible list and the FAQPage JSON-LD both read from here. */
export function getConsultingFaq(locale: Locale): FaqItem[] {
  if (locale === "zh") {
    return [
      {
        question: "家庭式托兒所和托兒中心有什麼不同？",
        answer: "家庭式托兒所開在持照人自己居住的住家，依小型或大型有收托人數上限。托兒中心開在非住宅場地，需要市或郡政府的許可（視當地規定）與消防核准，也需要合格的園長和老師。",
      },
      {
        question: "小型和大型家庭托兒所各可以收幾個孩子？",
        answer: "小型最多 6 名，若至少 2 名是學齡兒童且嬰兒不超過 2 名，最多 8 名。大型最多 12 名，若至少 2 名是學齡兒童且嬰兒不超過 3 名，最多 14 名，而且必須有一名助理。資料來源：加州社會服務部。",
      },
      {
        question: "我租房子，也可以開家庭式托兒所嗎？",
        answer: "持照人必須住在提供托育的住家裡。租屋者在加州也可能申請，但有通知房東等相關規定。請以官方資料為準，諮詢時我們可以一起看您的情況。",
      },
      {
        question: "申請執照的第一步是什麼？",
        answer: "參加加州社會服務部的執照說明會。家庭式托兒所的說明會有線上、線上直播和實體三種；托兒中心的說明會在線上。",
      },
      {
        question: "拿到執照要多久？費用多少？",
        answer: "這取決於您的申請是否完整、背景審查、檢查結果，以及托兒中心需要的地方許可，官方沒有保證的時間。州政府的執照費用請以加州社會服務部最新公告為準。我們的顧問費用會在免費諮詢後，依您的情況提供書面報價。",
      },
      {
        question: "你們可以保證我拿到執照嗎？",
        answer: "不行，也沒有任何人可以。執照由加州社區照護執照處（CCLD）核發。我們能做的，是幫您把申請和場地準備好，減少被退件或補件的機會。",
      },
      {
        question: "可以用中文諮詢嗎？",
        answer: "可以。諮詢、文件說明和範本都可以用中文或英文。",
      },
      {
        question: "拿到執照之後，你們還能幫什麼？",
        answer: "您可以申請加入 Waymaker 合作幼兒園網絡，擁有中英雙語的園所頁面，家長可以在線上預約參觀。",
      },
    ];
  }

  return [
    {
      question: "What is the difference between a family child care home and a child care center?",
      answer: "A family child care home operates in the licensee's own home, where they must live, with a capacity limit that depends on whether it is small or large. A child care center operates at a non-residential site and needs city or county permits where required, a fire clearance from the local fire authority, and a qualified director and staff.",
    },
    {
      question: "How many children can a small or large family child care home serve?",
      answer: "A small home may care for up to 6 children, or up to 8 if at least 2 are school-age and no more than 2 are infants. A large home may care for up to 12, or up to 14 if at least 2 are school-age and no more than 3 are infants, and requires an assistant. Source: California Department of Social Services.",
    },
    {
      question: "Can I open a family child care home if I rent?",
      answer: "The licensee must live in the home where care is provided. Renters in California may be able to apply, with rules such as notifying the landlord. Check the official sources, and we can look at your situation together in a consultation.",
    },
    {
      question: "What is the first step to getting licensed?",
      answer: "Attend a California Department of Social Services licensing orientation. Family child care home orientations are offered online, live virtual or in person; child care center orientations are online.",
    },
    {
      question: "How long does licensing take, and what does it cost?",
      answer: "It depends on how complete your application is, background checks, inspection results and, for centers, local permits. There is no officially guaranteed timeline. For state licensing fees, check the latest CDSS information. Our consulting fee is quoted in writing after the free consultation, based on your situation.",
    },
    {
      question: "Can you guarantee I will get a license?",
      answer: "No, and nobody honestly can. Licenses are issued by California's Community Care Licensing Division. What we do is help you prepare your application and site so there are fewer surprises.",
    },
    {
      question: "Can I get help in Chinese?",
      answer: "Yes. Consultations, explanations and templates are available in English or Chinese.",
    },
    {
      question: "What happens after I am licensed?",
      answer: "You can apply to join the Waymaker partner network: a bilingual profile page and online tour booking for parents.",
    },
  ];
}
