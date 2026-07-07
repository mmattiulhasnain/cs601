export type ThemeMode = "light" | "dark" | "galaxy" | "desert";

export interface ThemeStyles {
  appBg: string;
  headerBg: string;
  headerText: string;
  headerBorder: string;
  cardBg: string;
  cardBorder: string;
  subBg: string;
  subBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  tabBarBg: string;
  tabActiveBg: string;
  tabActiveText: string;
  tabInactiveText: string;
  inputBg: string;
  inputBorder: string;
  inputText: string;
  btnSecondaryBg: string;
  accentText: string;
  accentBg: string;
  accentBorder: string;
  badgeBg: string;
  activeBadgeBg: string;
  divider: string;
  borderLight: string;
}

export const themes: Record<ThemeMode, ThemeStyles> = {
  light: {
    appBg: "bg-[#fcfcfc] text-zinc-800",
    headerBg: "bg-white",
    headerText: "text-zinc-900",
    headerBorder: "border-zinc-200/80",
    cardBg: "bg-white",
    cardBorder: "border-zinc-200/80 shadow-xs",
    subBg: "bg-zinc-50",
    subBorder: "border-zinc-150",
    textPrimary: "text-zinc-900",
    textSecondary: "text-zinc-700",
    textMuted: "text-zinc-400",
    tabBarBg: "bg-zinc-100 border border-zinc-200/60",
    tabActiveBg: "bg-white text-zinc-950 shadow-xs border border-zinc-200/50",
    tabActiveText: "text-zinc-950",
    tabInactiveText: "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50/50",
    inputBg: "bg-white",
    inputBorder: "border-zinc-200 focus:border-zinc-950",
    inputText: "text-zinc-800",
    btnSecondaryBg: "bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-300",
    accentText: "text-zinc-900",
    accentBg: "bg-zinc-900",
    accentBorder: "border-zinc-950",
    badgeBg: "bg-zinc-100 text-zinc-500",
    activeBadgeBg: "bg-white/10 text-white",
    divider: "divide-zinc-100",
    borderLight: "border-zinc-100",
  },
  dark: {
    appBg: "bg-[#0b0f19] text-zinc-300",
    headerBg: "bg-[#161f30]",
    headerText: "text-white",
    headerBorder: "border-zinc-800/80",
    cardBg: "bg-[#161f30]",
    cardBorder: "border-zinc-800/80 shadow-lg",
    subBg: "bg-[#1d293d]",
    subBorder: "border-zinc-700",
    textPrimary: "text-zinc-100",
    textSecondary: "text-zinc-300",
    textMuted: "text-zinc-500",
    tabBarBg: "bg-[#111926] border border-zinc-800/60",
    tabActiveBg: "bg-[#1d293d] text-emerald-400 shadow-md border border-zinc-700",
    tabActiveText: "text-emerald-400",
    tabInactiveText: "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50",
    inputBg: "bg-[#111926]",
    inputBorder: "border-zinc-700 focus:border-emerald-400",
    inputText: "text-zinc-100",
    btnSecondaryBg: "bg-[#253248] hover:bg-[#2d3d57] text-zinc-200 border-zinc-600",
    accentText: "text-emerald-400",
    accentBg: "bg-emerald-500/10",
    accentBorder: "border-emerald-500/30",
    badgeBg: "bg-zinc-800 text-zinc-400",
    activeBadgeBg: "bg-emerald-500/20 text-emerald-300",
    divider: "divide-zinc-800",
    borderLight: "border-zinc-800",
  },
  galaxy: {
    appBg: "bg-gradient-to-br from-[#0a0518] via-[#0f0c24] to-[#03010a] text-purple-100",
    headerBg: "bg-[#130f2b]/95 backdrop-blur-md",
    headerText: "text-purple-100",
    headerBorder: "border-indigo-950/80",
    cardBg: "bg-[#130f2b]/90 backdrop-blur-md",
    cardBorder: "border-indigo-900/50 shadow-indigo-950/45 shadow-lg",
    subBg: "bg-[#1e1742]/80",
    subBorder: "border-indigo-800/50",
    textPrimary: "text-purple-50",
    textSecondary: "text-indigo-200",
    textMuted: "text-purple-400/80",
    tabBarBg: "bg-[#0d0a21] border border-indigo-950/60",
    tabActiveBg: "bg-[#1e1742] text-fuchsia-400 shadow-lg border border-purple-800/60",
    tabActiveText: "text-fuchsia-400",
    tabInactiveText: "text-indigo-400 hover:text-indigo-200 hover:bg-[#1a143b]/50",
    inputBg: "bg-[#0d0a21]/80",
    inputBorder: "border-indigo-950 focus:border-fuchsia-400",
    inputText: "text-purple-100",
    btnSecondaryBg: "bg-[#241c50] hover:bg-[#2f2569] text-purple-200 border-indigo-900",
    accentText: "text-fuchsia-400",
    accentBg: "bg-fuchsia-500/10",
    accentBorder: "border-fuchsia-500/30",
    badgeBg: "bg-indigo-950 text-indigo-300",
    activeBadgeBg: "bg-fuchsia-500/20 text-fuchsia-300",
    divider: "divide-indigo-950/40",
    borderLight: "border-indigo-950/40",
  },
  desert: {
    appBg: "bg-[#F5EFE6] text-[#3E2723]",
    headerBg: "bg-[#FAF6F0]",
    headerText: "text-[#3E2723]",
    headerBorder: "border-[#E6D5C3]",
    cardBg: "bg-[#FAF6F0]",
    cardBorder: "border-[#E6D5C3] shadow-md",
    subBg: "bg-[#EFE9DB]",
    subBorder: "border-[#D2B48C]/40",
    textPrimary: "text-[#3E2723]",
    textSecondary: "text-[#5D4037]",
    textMuted: "text-[#8D6E63]",
    tabBarBg: "bg-[#E4DBC8] border border-[#D2B48C]/45",
    tabActiveBg: "bg-[#FAF6F0] text-[#C05C33] shadow-md border border-[#E6D5C3]",
    tabActiveText: "text-[#C05C33]",
    tabInactiveText: "text-[#8D6E63] hover:text-[#5D4037] hover:bg-[#FAF6F0]/50",
    inputBg: "bg-[#FFFDF9]",
    inputBorder: "border-[#E6D5C3] focus:border-[#C05C33]",
    inputText: "text-[#3E2723]",
    btnSecondaryBg: "bg-[#EFE9DB] hover:bg-[#E4DBC8] text-[#5D4037] border-[#D2B48C]/60",
    accentText: "text-[#C05C33]",
    accentBg: "bg-[#C05C33]/10",
    accentBorder: "border-[#C05C33]/30",
    badgeBg: "bg-[#E4DBC8] text-[#8D6E63]",
    activeBadgeBg: "bg-[#C05C33]/20 text-[#C05C33]",
    divider: "divide-[#E6D5C3]/40",
    borderLight: "border-[#E6D5C3]/40",
  }
};
