/**
 * Date utilities with explicit timezone handling
 */

/**
 * Get date in PST timezone with optional day offset
 * @param daysOffset Number of days to add (can be negative)
 * @returns Date string in YYYY-MM-DD format
 */
export function getPSTDate(daysOffset: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  
  return formatter.format(date); // Returns YYYY-MM-DD
}

/**
 * Mask email address for PII protection in logs
 * @param email Email address to mask
 * @returns Masked email (e.g., "j***@example.com")
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const maskedLocal = local.length > 1 ? `${local[0]}***` : local;
  return `${maskedLocal}@${domain}`;
}
