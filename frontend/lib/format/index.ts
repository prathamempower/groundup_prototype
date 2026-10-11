import { format, parseISO } from "date-fns";

/**
 * Format monetary amount stored in cents (minor units) or dollar strings.
 * Missing or null data returns "Incomplete", never zero.
 */
export function formatMoney(
  cents: number | string | null | undefined,
  options?: { currency?: string; showCents?: boolean; compact?: boolean }
): string {
  if (cents === null || cents === undefined || cents === "") {
    return "Incomplete";
  }

  const numCents = typeof cents === "string" ? parseFloat(cents) : cents;
  if (isNaN(numCents)) return "Incomplete";

  if (options?.compact) {
    return formatMoneyCompact(numCents, options?.currency);
  }

  const dollars = numCents / 100;
  const currency = options?.currency || "USD";
  const showCents = options?.showCents !== false;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  }).format(dollars);
}

/**
 * Format compact money (e.g. $4.2M, $385K)
 */
export function formatMoneyCompact(
  cents: number | string | null | undefined,
  currency = "USD"
): string {
  if (cents === null || cents === undefined || cents === "") {
    return "Incomplete";
  }

  const numCents = typeof cents === "string" ? parseFloat(cents) : cents;
  if (isNaN(numCents)) return "Incomplete";

  const dollars = numCents / 100;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(dollars);
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string | null | undefined, maxLen = 30): string {
  if (!text) return "";
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen - 3)}...`;
}

/**
 * Format relative time or fallback
 */
export function formatRelativeTime(isoDate: string | null | undefined): string {
  if (!isoDate) return "Unknown";
  try {
    const d = isoDate.includes("T") ? parseISO(isoDate) : new Date(isoDate + "T00:00:00Z");
    const diffDays = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays > 1 && diffDays < 30) return `${diffDays} days ago`;
    return format(d, "MMM d, yyyy");
  } catch {
    return "Unknown";
  }
}


/**
 * Format percentage
 */
export function formatPercent(
  val: number | null | undefined,
  options?: { isRatio?: boolean; decimals?: number }
): string {
  if (val === null || val === undefined || isNaN(val)) {
    return "Incomplete";
  }

  const percentage = options?.isRatio ? val * 100 : val;
  const decimals = options?.decimals ?? 1;

  return `${percentage.toFixed(decimals)}%`;
}

/**
 * Format business date e.g. "Oct 10, 2026"
 */
export function formatDate(isoDate: string | null | undefined): string {
  if (!isoDate) return "Incomplete";
  try {
    const d = isoDate.includes("T") ? parseISO(isoDate) : new Date(isoDate + "T00:00:00Z");
    if (isNaN(d.getTime())) return "Incomplete";
    return format(d, "MMM d, yyyy");
  } catch {
    return "Incomplete";
  }
}

/**
 * Format timestamp e.g. "Oct 10, 2026, 8:00 AM"
 */
export function formatDateTime(isoTimestamp: string | null | undefined): string {
  if (!isoTimestamp) return "Incomplete";
  try {
    const d = parseISO(isoTimestamp);
    if (isNaN(d.getTime())) return "Incomplete";
    return format(d, "MMM d, yyyy, h:mm a");
  } catch {
    return "Incomplete";
  }
}

/**
 * Format "As of Oct 10, 2026, 8:00 AM"
 */
export function formatAsOf(isoTimestamp: string | null | undefined): string {
  if (!isoTimestamp) return "As of current time";
  return `As of ${formatDateTime(isoTimestamp)}`;
}
