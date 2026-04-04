import { getShipTypeInfo } from "../utils/ship-type";
import { getNavStatusLabel } from "../utils/nav-status";

export function formatSpeed(sog: number): string {
  return `${sog.toFixed(1)} kn`;
}

export function formatHeading(degrees: number): string {
  if (degrees === 511) return "N/A";
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round(degrees / 22.5) % 16;
  return `${degrees.toFixed(1)}\u00B0 (${dirs[index]})`;
}

export function formatCourse(degrees: number): string {
  return formatHeading(degrees);
}

export function formatShipType(code: number): string {
  return getShipTypeInfo(code).label;
}

export function formatNavStatus(code: number): string {
  return getNavStatusLabel(code);
}

export function formatEta(etaTimestamp: number): string {
  if (etaTimestamp === 0) return "N/A";
  const date = new Date(etaTimestamp);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[date.getMonth()]} ${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function formatDraught(draught: number): string {
  if (draught === 0) return "N/A";
  return `${draught.toFixed(1)} m`;
}

export function formatDimensions(a: number, b: number, c: number, d: number): string {
  const length = a + b;
  const beam = c + d;
  if (length === 0 && beam === 0) return "N/A";
  return `${length}m \u00D7 ${beam}m`;
}

export function formatMmsi(mmsi: number): string {
  return String(mmsi);
}
