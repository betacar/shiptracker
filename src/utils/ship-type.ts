export type ShipShape =
  | "cargo"
  | "tanker"
  | "passenger"
  | "fishing"
  | "tug"
  | "sailing"
  | "hsc"
  | "military"
  | "default";

export interface ShipTypeInfo {
  readonly label: string;
  readonly color: string;
  readonly shape: ShipShape;
}

const SHIP_TYPE_MAP: Record<number, ShipTypeInfo> = {
  20: { label: "Wing in Ground", color: "#9b59b6", shape: "hsc" },
  30: { label: "Fishing", color: "#f39c12", shape: "fishing" },
  31: { label: "Towing", color: "#e67e22", shape: "tug" },
  32: { label: "Towing (large)", color: "#e67e22", shape: "tug" },
  33: { label: "Dredging", color: "#8e44ad", shape: "cargo" },
  34: { label: "Diving", color: "#2980b9", shape: "default" },
  35: { label: "Military", color: "#7f8c8d", shape: "military" },
  36: { label: "Sailing", color: "#1abc9c", shape: "sailing" },
  37: { label: "Pleasure Craft", color: "#1abc9c", shape: "sailing" },
  40: { label: "High Speed Craft", color: "#e74c3c", shape: "hsc" },
  41: { label: "High Speed Craft", color: "#e74c3c", shape: "hsc" },
  42: { label: "High Speed Craft", color: "#e74c3c", shape: "hsc" },
  43: { label: "High Speed Craft", color: "#e74c3c", shape: "hsc" },
  44: { label: "High Speed Craft", color: "#e74c3c", shape: "hsc" },
  45: { label: "High Speed Craft", color: "#e74c3c", shape: "hsc" },
  46: { label: "High Speed Craft", color: "#e74c3c", shape: "hsc" },
  47: { label: "High Speed Craft", color: "#e74c3c", shape: "hsc" },
  48: { label: "High Speed Craft", color: "#e74c3c", shape: "hsc" },
  49: { label: "High Speed Craft", color: "#e74c3c", shape: "hsc" },
  50: { label: "Pilot Vessel", color: "#f1c40f", shape: "default" },
  51: { label: "Search and Rescue", color: "#e74c3c", shape: "hsc" },
  52: { label: "Tug", color: "#e67e22", shape: "tug" },
  53: { label: "Port Tender", color: "#f1c40f", shape: "default" },
  54: { label: "Anti-pollution", color: "#27ae60", shape: "default" },
  55: { label: "Law Enforcement", color: "#2c3e50", shape: "military" },
  58: { label: "Medical Transport", color: "#e74c3c", shape: "default" },
  59: { label: "Naval Vessel", color: "#7f8c8d", shape: "military" },
  60: { label: "Passenger", color: "#3498db", shape: "passenger" },
  61: { label: "Passenger", color: "#3498db", shape: "passenger" },
  62: { label: "Passenger", color: "#3498db", shape: "passenger" },
  63: { label: "Passenger", color: "#3498db", shape: "passenger" },
  64: { label: "Passenger", color: "#3498db", shape: "passenger" },
  65: { label: "Passenger", color: "#3498db", shape: "passenger" },
  66: { label: "Passenger", color: "#3498db", shape: "passenger" },
  67: { label: "Passenger", color: "#3498db", shape: "passenger" },
  68: { label: "Passenger", color: "#3498db", shape: "passenger" },
  69: { label: "Passenger", color: "#3498db", shape: "passenger" },
  70: { label: "Cargo", color: "#2ecc71", shape: "cargo" },
  71: { label: "Cargo (Hazmat A)", color: "#2ecc71", shape: "cargo" },
  72: { label: "Cargo (Hazmat B)", color: "#2ecc71", shape: "cargo" },
  73: { label: "Cargo (Hazmat C)", color: "#2ecc71", shape: "cargo" },
  74: { label: "Cargo (Hazmat D)", color: "#2ecc71", shape: "cargo" },
  75: { label: "Cargo", color: "#2ecc71", shape: "cargo" },
  76: { label: "Cargo", color: "#2ecc71", shape: "cargo" },
  77: { label: "Cargo", color: "#2ecc71", shape: "cargo" },
  78: { label: "Cargo", color: "#2ecc71", shape: "cargo" },
  79: { label: "Cargo", color: "#2ecc71", shape: "cargo" },
  80: { label: "Tanker", color: "#e74c3c", shape: "tanker" },
  81: { label: "Tanker (Hazmat A)", color: "#e74c3c", shape: "tanker" },
  82: { label: "Tanker (Hazmat B)", color: "#e74c3c", shape: "tanker" },
  83: { label: "Tanker (Hazmat C)", color: "#e74c3c", shape: "tanker" },
  84: { label: "Tanker (Hazmat D)", color: "#e74c3c", shape: "tanker" },
  85: { label: "Tanker", color: "#e74c3c", shape: "tanker" },
  86: { label: "Tanker", color: "#e74c3c", shape: "tanker" },
  87: { label: "Tanker", color: "#e74c3c", shape: "tanker" },
  88: { label: "Tanker", color: "#e74c3c", shape: "tanker" },
  89: { label: "Tanker", color: "#e74c3c", shape: "tanker" },
};

const DEFAULT_INFO: ShipTypeInfo = {
  label: "Other",
  color: "#95a5a6",
  shape: "default",
};

export function getShipTypeInfo(code: number): ShipTypeInfo {
  return SHIP_TYPE_MAP[code] ?? DEFAULT_INFO;
}
