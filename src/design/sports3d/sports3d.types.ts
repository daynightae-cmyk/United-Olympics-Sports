export type Sport3DKey =
  | "football"
  | "basketball"
  | "swimming"
  | "tennis"
  | "gymnastics"
  | "martial-arts"
  | "trophy"
  | "stopwatch"
  | string;

export interface Sport3DEntry {
  key: Sport3DKey;
  assetPath?: string | null;
  licenseSource?: string | null;
  licenseStatus?: "ok" | "review-required" | "unavailable";
}

export interface Sports3DRegistry {
  [key: string]: Sport3DEntry | undefined;
}
