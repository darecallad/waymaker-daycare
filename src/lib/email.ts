import nodemailer from "nodemailer";

/**
 * Every send happens on a request path, so an SMTP host that accepts the connection and then
 * stops responding must not hold a serverless invocation open for the nodemailer defaults.
 */
const SMTP_TIMEOUTS = {
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 15_000,
};

// Waymaker Transporter (Default)
const waymakerTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  ...SMTP_TIMEOUTS,
});

// Daycare Transporter
const daycareTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.DAYCARE_EMAIL_USER,
    pass: process.env.DAYCARE_EMAIL_PASSWORD,
  },
  ...SMTP_TIMEOUTS,
});

/**
 * Escape a value before interpolating it into an HTML email body.
 *
 * Booking fields such as the parent name arrive from the public form, and the closure reason
 * is administrator supplied, so neither can be trusted as markup.
 *
 * @param value - Raw value, may be undefined
 * @returns HTML-safe text
 */
export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const getTransporter = (type: "waymaker" | "daycare") => {
  // If Daycare credentials are not set, fallback to Waymaker (or handle error)
  if (type === "daycare" && process.env.DAYCARE_EMAIL_USER) {
    return daycareTransporter;
  }
  return waymakerTransporter;
};

export const getSender = (type: "waymaker" | "daycare") => {
  if (type === "daycare" && process.env.DAYCARE_EMAIL_USER) {
    return process.env.DAYCARE_EMAIL_USER;
  }
  return process.env.EMAIL_USER;
};

// 驗證 SMTP 連接配置
export async function verifyEmailConfig() {
  let isValid = true;

  // Verify Waymaker (Only if credentials exist)
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    try {
      await waymakerTransporter.verify();
      console.log("✅ Waymaker Email server is ready");
    } catch (error) {
      console.error("❌ Waymaker Email configuration error:", error);
      isValid = false;
    }
  } else {
    console.log("ℹ️ Waymaker Email credentials not found (Skipping)");
  }
  
  // Verify Daycare
  if (process.env.DAYCARE_EMAIL_USER && process.env.DAYCARE_EMAIL_PASSWORD) {
    try {
      await daycareTransporter.verify();
      console.log("✅ Daycare Email server is ready");
    } catch (error) {
      console.error("❌ Daycare Email configuration error:", error);
      isValid = false;
    }
  } else {
    console.log("ℹ️ Daycare Email credentials not found (Skipping)");
  }
  
  return isValid;
}
