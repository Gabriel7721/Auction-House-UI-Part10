import { AppNotification } from "../types/notification";

export function formatCurrency(value?: number | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "$0.00";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDateTime(value?: string | Date | null): string {
  if (!value) return "N/A";

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleString();
}

export function formatShortDate(value?: string | Date | null): string {
  if (!value) return "N/A";

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString();
}

export function getTimeRemaining(targetDate: string | Date): {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const target =
    targetDate instanceof Date
      ? targetDate.getTime()
      : new Date(targetDate).getTime();

  const now = Date.now();
  const total = Math.max(target - now, 0);

  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return {
    total,
    days,
    hours,
    minutes,
    seconds,
  };
}

export function formatCountdown(targetDate: string | Date): string {
  const remaining = getTimeRemaining(targetDate);

  if (remaining.total <= 0) {
    return "Ended";
  }

  if (remaining.days > 0) {
    return `${remaining.days}d ${remaining.hours}h left`;
  }

  if (remaining.hours > 0) {
    return `${remaining.hours}h ${remaining.minutes}m left`;
  }

  if (remaining.minutes > 0) {
    return `${remaining.minutes}m ${remaining.seconds}s left`;
  }

  return `${remaining.seconds}s left`;
}

export function formatCondition(condition?: string): string {
  switch (condition) {
    case "new":
      return "New";
    case "used":
      return "Used";
    case "refurbished":
      return "Refurbished";
    default:
      return "Unknown";
  }
}

export function formatAuctionStatus(status?: string): string {
  switch (status) {
    case "scheduled":
      return "Scheduled";
    case "live":
      return "Live";
    case "ended":
      return "Ended";
    case "cancelled":
      return "Cancelled";
    default:
      return "Unknown";
  }
}

export function getDefaultStartDate(): Date {
  return new Date();
}

export function getDefaultEndDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date;
}

export function mergeDateTimeValue(
  current: Date,
  selected: Date,
  mode: "date" | "time",
): Date {
  const next = new Date(current);

  if (mode === "date") {
    next.setFullYear(
      selected.getFullYear(),
      selected.getMonth(),
      selected.getDate(),
    );
    return next;
  }

  next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
  return next;
}

export function formatDateOnly(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export function formatTimeOnly(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTimeDisplay(date: Date): string {
  return `${formatDateOnly(date)} • ${formatTimeOnly(date)}`;
}

export function formatNotificationType(type: AppNotification["type"]): string {
  switch (type) {
    case "auction_won":
      return "Winner";
    case "outbid":
      return "Outbid";
    case "auction_ended":
      return "Ended";
    default:
      return "Info";
  }
}
