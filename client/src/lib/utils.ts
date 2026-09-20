import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string | Date): string {
  if (!dateString) return "";
  const d = typeof dateString === "string" ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

/**
 * Reliable SVG Data URI placeholder for broken/blocked remote images.
 * Completely immune to CORS, network drops, and OpaqueResponseBlocking.
 */
export const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%230A0F1D'/%3E%3Cstop offset='100%25' stop-color='%23131D31'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='800' height='450' fill='url(%23g)'/%3E%3Ccircle cx='400' cy='200' r='48' fill='%2300F5A0' fill-opacity='0.12' stroke='%2300F5A0' stroke-opacity='0.3' stroke-width='2'/%3E%3Cpath d='M390 200 L400 178 L410 200 Z' fill='%2300F5A0'/%3E%3Ccircle cx='400' cy='212' r='4' fill='%23FFB020'/%3E%3Ctext x='50%25' y='285' dominant-baseline='middle' text-anchor='middle' fill='%2394A3B8' font-family='sans-serif' font-size='16' font-weight='600' letter-spacing='1'%3EDIGITAL HEROES PARTNER%3C/text%3E%3C/svg%3E";

export function handleImageError(e: React.SyntheticEvent<HTMLImageElement, Event>) {
  e.currentTarget.onerror = null;
  e.currentTarget.src = FALLBACK_IMAGE;
}
