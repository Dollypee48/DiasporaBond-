// Formatting Utilities

import { formatEther } from "./ethersHelper";

/**
 * Format number as USD currency
 */
export function formatUSD(value: number | string | bigint): string {
  const num = typeof value === "string" ? parseFloat(value) : typeof value === "bigint" ? Number(value) / 1e18 : value;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Format number with thousands separator
 */
export function formatNumber(value: number | string, decimals = 2): string {
  const num = typeof value === "string" ? parseFloat(value) : value;

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Format token amount (wei to readable)
 */
export function formatTokenAmount(value: string | bigint, symbol = "TOKEN", decimals = 2): string {
  const formatted = formatEther(value);
  const num = parseFloat(formatted);

  return `${formatNumber(num, decimals)} ${symbol}`;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number | string, decimals = 2): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return `${formatNumber(num, decimals)}%`;
}

/**
 * Format date to readable string
 */
export function formatDate(timestamp: number | bigint | Date): string {
  let date: Date;

  if (typeof timestamp === "bigint") {
    date = new Date(Number(timestamp) * 1000);
  } else if (typeof timestamp === "number") {
    date = new Date(timestamp * 1000);
  } else {
    date = timestamp;
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

/**
 * Format date and time
 */
export function formatDateTime(timestamp: number | bigint | Date): string {
  let date: Date;

  if (typeof timestamp === "bigint") {
    date = new Date(Number(timestamp) * 1000);
  } else if (typeof timestamp === "number") {
    date = new Date(timestamp * 1000);
  } else {
    date = timestamp;
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Format remaining time until deadline
 */
export function formatTimeRemaining(endTimestamp: number | bigint): string {
  const end = typeof endTimestamp === "bigint" ? Number(endTimestamp) : endTimestamp;
  const now = Math.floor(Date.now() / 1000);
  const diff = end - now;

  if (diff <= 0) return "Ended";

  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h remaining`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  } else {
    return `${minutes}m remaining`;
  }
}

/**
 * Format duration between two timestamps
 */
export function formatDuration(startTime: number | bigint, endTime: number | bigint): string {
  const start = typeof startTime === "bigint" ? Number(startTime) : startTime;
  const end = typeof endTime === "bigint" ? Number(endTime) : endTime;

  const diff = end - start;
  const days = Math.floor(diff / 86400);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) {
    return `${years} year${years !== 1 ? "s" : ""}`;
  } else if (months > 0) {
    return `${months} month${months !== 1 ? "s" : ""}`;
  } else {
    return `${days} day${days !== 1 ? "s" : ""}`;
  }
}

/**
 * Format basis points to percentage
 */
export function formatBasisPoints(basisPoints: number | bigint): string {
  const bp = typeof basisPoints === "bigint" ? Number(basisPoints) : basisPoints;
  return formatPercentage(bp / 100);
}

/**
 * Format progress percentage for progress bars
 */
export function formatProgress(current: number | bigint | string, target: number | bigint | string): string {
  const curr = typeof current === "string" ? parseFloat(current) : typeof current === "bigint" ? Number(current) : current;
  const tgt = typeof target === "string" ? parseFloat(target) : typeof target === "bigint" ? Number(target) : target;

  if (tgt === 0) return "0%";

  const percentage = (curr / tgt) * 100;
  return `${Math.min(Math.round(percentage), 100)}%`;
}

/**
 * Format status with color coding
 */
export function getStatusColor(status: string): string {
  const lowercaseStatus = status.toLowerCase();

  if (lowercaseStatus.includes("completed") || lowercaseStatus.includes("passed") || lowercaseStatus.includes("active")) {
    return "#10b981"; // Green
  } else if (lowercaseStatus.includes("pending") || lowercaseStatus.includes("progress")) {
    return "#f59e0b"; // Amber
  } else if (lowercaseStatus.includes("failed") || lowercaseStatus.includes("defaulted") || lowercaseStatus.includes("rejected")) {
    return "#ef4444"; // Red
  }

  return "#6b7280"; // Gray
}

/**
 * Truncate long text with ellipsis
 */
export function truncateText(text: string, maxLength = 50): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * Format large numbers with K, M, B notation
 */
export function formatCompactNumber(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;

  if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";

  return formatNumber(num, 2);
}

/**
 * Format voting or approval status
 */
export function formatVoteStatus(forVotes: number | bigint | string, againstVotes: number | bigint | string, total: number | bigint | string): string {
  const forNum = typeof forVotes === "string" ? parseFloat(forVotes) : typeof forVotes === "bigint" ? Number(forVotes) : forVotes;
  const againstNum = typeof againstVotes === "string" ? parseFloat(againstVotes) : typeof againstVotes === "bigint" ? Number(againstVotes) : againstVotes;
  const totalNum = typeof total === "string" ? parseFloat(total) : typeof total === "bigint" ? Number(total) : total;

  if (totalNum === 0) return "No votes";

  const forPercentage = ((forNum / totalNum) * 100).toFixed(1);
  const againstPercentage = ((againstNum / totalNum) * 100).toFixed(1);

  return `${forPercentage}% For, ${againstPercentage}% Against`;
}
