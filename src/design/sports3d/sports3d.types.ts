export type Sport3DKey =
  | "football"
  | "basketball"
  | "swimming"
  | "tennis"
  | "trophy"
  | "stopwatch"
  | string;

export interface Sport3DEntry {
  key: Sport3DKey;
  // local public path to an image or staged 3D preview asset. Optional.
  assetPath?: string | null;
  licenseSource?: string | null;
  licenseStatus?: "ok" | "review-required" | "unavailable";
}

export interface Sports3DRegistry {
  [key: string]: Sport3DEntry | undefined;
}
