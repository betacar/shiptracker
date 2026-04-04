const NAV_STATUS_MAP: Record<number, string> = {
  0: "Under way using engine",
  1: "At anchor",
  2: "Not under command",
  3: "Restricted manoeuvrability",
  4: "Constrained by draught",
  5: "Moored",
  6: "Aground",
  7: "Engaged in fishing",
  8: "Under way sailing",
  9: "Reserved (HSC)",
  10: "Reserved (WIG)",
  11: "Power-driven towing astern",
  12: "Power-driven pushing ahead",
  13: "Reserved",
  14: "AIS-SART / MOB / EPIRB",
  15: "Not defined",
};

export function getNavStatusLabel(code: number): string {
  return NAV_STATUS_MAP[code] ?? "Unknown";
}
