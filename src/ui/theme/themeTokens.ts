export const themeTokens = {
  light: {
    canvas: "#f6f1e6",
    canvasSoft: "#efe6d4",
    surface1: "#fffaf3",
    surface2: "#f5efe7",
    surface3: "#eee4d3",
    textPrimary: "#1d1b19",
    textSecondary: "#4f4a44",
    textMuted: "#756d65",
    border: "rgba(53, 40, 21, 0.14)",
    borderStrong: "rgba(53, 40, 21, 0.28)",
    brand: "#a97a1e",
    brandSoft: "#efe0af",
    brandStrong: "#7d5b14",
    success: "#1c7f5f",
    warning: "#b76f1d",
    danger: "#b6423d",
    info: "#2d6da6",
    overlay: "rgba(22, 15, 6, 0.48)",
    shadowCard: "0 18px 42px rgba(64, 49, 22, 0.12)",
    shadowFloating: "0 26px 64px rgba(39, 31, 20, 0.18)",
    shadowFocus: "0 0 0 3px rgba(169, 122, 30, 0.2)",
  },
  dark: {
    canvas: "#07080b",
    canvasSoft: "#10141a",
    surface1: "#11161d",
    surface2: "#171d27",
    surface3: "#1e2732",
    textPrimary: "#f6f3ee",
    textSecondary: "#d4d0ca",
    textMuted: "#a5a29c",
    border: "rgba(214, 175, 72, 0.2)",
    borderStrong: "rgba(214, 175, 72, 0.36)",
    brand: "#d8b35a",
    brandSoft: "#352d1d",
    brandStrong: "#f4d27b",
    success: "#5ec39b",
    warning: "#f0b75d",
    danger: "#f28a82",
    info: "#7abaf0",
    overlay: "rgba(8, 7, 6, 0.62)",
    shadowCard: "0 18px 48px rgba(0, 0, 0, 0.24)",
    shadowFloating: "0 26px 64px rgba(0, 0, 0, 0.36)",
    shadowFocus: "0 0 0 3px rgba(216, 179, 90, 0.24)",
  },
} as const;

export type ThemeMode = keyof typeof themeTokens;

export function getThemeState(mode: ThemeMode) {
  return themeTokens[mode];
}
