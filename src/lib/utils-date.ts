/**
 * Date utilities with explicit timezone handling for PST/PDT (America/Los_Angeles)
 * and PII protection for sensitive data in logs.
 * 
 * This module provides timezone-aware date formatting and email masking utilities
 * to ensure consistent PST date calculations and protect user privacy in logs.
 * 
 * @module utils-date
 * @see {@link getPSTDate} for PST date formatting
 * @see {@link maskEmail} for PII-safe email logging
 */

/**
 * Get date in PST timezone with optional day offset.
 * 
 * Uses Intl.DateTimeFormat to explicitly format dates in America/Los_Angeles timezone,
 * ensuring consistent PST/PDT handling regardless of server timezone. Returns dates
 * in ISO 8601 YYYY-MM-DD format suitable for Redis keys and database queries.
 * 
 * @param {number} daysOffset - Number of days to add to current date (can be negative).
 *                              Defaults to 0 (today).
 *                              Examples: -1 (yesterday), 0 (today), 1 (tomorrow)
 * @returns {string} Date string in YYYY-MM-DD format (e.g., "2026-01-21")
 * 
 * @example
 * // Get today in PST
 * const today = getPSTDate(); // "2026-01-20"
 * 
 * @example
 * // Get tomorrow in PST (for reminder scheduling)
 * const tomorrow = getPSTDate(1); // "2026-01-21"
 * 
 * @example
 * // Get yesterday in PST (for cleanup operations)
 * const yesterday = getPSTDate(-1); // "2026-01-19"
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
 * Mask email address for PII protection in logs.
 * 
 * Transforms email addresses to protect Personally Identifiable Information (PII)
 * while maintaining readability for debugging. Preserves the first character of
 * the local part and the full domain, replacing the rest with asterisks.
 * 
 * @param {string} email - Email address to mask (e.g., "john@example.com")
 * @returns {string} Masked email address (e.g., "j***@example.com")
 *                   Returns original string if no @ symbol found
 * 
 * @example
 * // Basic email masking
 * maskEmail("john.doe@gmail.com"); // "j***@gmail.com"
 * 
 * @example
 * // Short email addresses
 * maskEmail("a@test.com"); // "a@test.com" (single char preserved)
 * 
 * @example
 * // Use in logs
 * console.log(`Email sent to ${maskEmail(booking.email)}`);
 * // Output: Email sent to j***@example.com
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const maskedLocal = local.length > 1 ? `${local[0]}***` : local;
  return `${maskedLocal}@${domain}`;
}
