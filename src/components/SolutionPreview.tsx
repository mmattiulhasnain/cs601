import React, { useState, CSSProperties } from "react";
import { AssignmentSolution, StudentInfo, AssignmentHeader } from "../types";
import { 
  Download, 
  FileText, 
  ToggleLeft, 
  ToggleRight, 
  GraduationCap,
  Printer,
  Eye,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Settings,
  BookOpen,
  HelpCircle,
  Activity,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  RotateCcw
} from "lucide-react";
import { generateAndDownloadDocx } from "../utils/docxGenerator";
import { ThemeMode, themes } from "../utils/theme";

interface Props {
  solution: AssignmentSolution;
  onChangeSolution: (updated: AssignmentSolution) => void;
  student: StudentInfo;
  onChangeStudent: (updated: StudentInfo) => void;
  header: AssignmentHeader;
  onChangeHeader: (updated: AssignmentHeader) => void;
  onResetSolution?: () => void;
  theme?: ThemeMode;
}

export default function SolutionPreview({
  solution,
  onChangeSolution,
  student,
  onChangeStudent,
  header,
  onChangeHeader,
  onResetSolution,
  theme = "light"
}: Props) {
  const s = themes[theme];
  const [isExporting, setIsExporting] = useState(false);
  const [wordFont, setWordFont] = useState<"Calibri" | "TimesNewRoman" | "Arial" | "Georgia" | "Consolas">("Calibri");
  const [tableStyle, setTableStyle] = useState<"grid" | "booktabs" | "stripe" | "faint">("grid");
  const [headingStyle, setHeadingStyle] = useState<"standard" | "leftborder" | "centered" | "italic">("standard");
  const [spacingDensity, setSpacingDensity] = useState<"comfortable" | "compact" | "double">("comfortable");
  const [coverBorder, setCoverBorder] = useState<"none" | "thin" | "double">("none");
  const [mismatchHighlight, setMismatchHighlight] = useState<"red" | "yellow" | "underline" | "none">("red");
  const [openSection, setOpenSection] = useState<"metadata" | "intro" | "q1" | "q2" | "conclusion" | null>("q1");

  const hasPage1Active = !solution.disabledSections?.intro || !solution.disabledSections?.diagram || !solution.disabledSections?.q1;
  const hasPage2Active = !solution.disabledSections?.q2 || !solution.disabledSections?.conclusion;
  const totalPages = (solution.hasCoverPage ? 1 : 0) + (hasPage1Active ? 1 : 0) + (hasPage2Active ? 1 : 0);

  // Field change handlers
  const handleIntroChange = (text: string) => {
    onChangeSolution({ ...solution, introduction: text });
  };

  const handleConclusionChange = (text: string) => {
    onChangeSolution({ ...solution, conclusion: text });
  };

  const handleQ1CellChange = (rowIndex: number, field: "sentMessage" | "receivedMessage" | "detectedError" | "explanation", value: string) => {
    const updatedQ1 = [...solution.q1Data];
    updatedQ1[rowIndex] = { ...updatedQ1[rowIndex], [field]: value };
    onChangeSolution({ ...solution, q1Data: updatedQ1 });
  };

  const handleQ2CellChange = (rowIndex: number, field: "bitsCorrected" | "minHammingDistance" | "explanation", value: string | number) => {
    const updatedQ2 = [...solution.q2Data];
    updatedQ2[rowIndex] = { ...updatedQ2[rowIndex], [field]: value };
    onChangeSolution({ ...solution, q2Data: updatedQ2 });
  };

  const toggleCoverPage = () => {
    onChangeSolution({ ...solution, hasCoverPage: !solution.hasCoverPage });
  };

  const isSectionEnabled = (sectionName: "intro" | "diagram" | "q1" | "q2" | "conclusion") => {
    return !solution.disabledSections?.[sectionName];
  };

  const toggleSection = (sectionName: "intro" | "diagram" | "q1" | "q2" | "conclusion") => {
    const currentDisabled = solution.disabledSections || {};
    const updatedDisabled = {
      ...currentDisabled,
      [sectionName]: !currentDisabled[sectionName]
    };
    onChangeSolution({
      ...solution,
      disabledSections: updatedDisabled
    });
  };

  const handleTriggerExport = async () => {
    setIsExporting(true);
    try {
      await generateAndDownloadDocx(solution, student, header, {
        wordFont,
        tableStyle,
        headingStyle,
        spacingDensity,
        coverBorder,
        mismatchHighlight
      });
    } catch (err) {
      console.error("Export error", err);
    } finally {
      setIsExporting(false);
    }
  };

  const getFontFamily = () => {
    switch (wordFont) {
      case "Calibri":
        return `Calibri, Candara, Segoe, "Segoe UI", Arial, sans-serif`;
      case "TimesNewRoman":
        return `"Times New Roman", Times, Georgia, serif`;
      case "Arial":
        return `Arial, Helvetica, sans-serif`;
      case "Georgia":
        return `Georgia, "Times New Roman", serif`;
      case "Consolas":
        return `Consolas, "Courier New", monospace`;
      default:
        return `Calibri, Candara, Segoe, "Segoe UI", Arial, sans-serif`;
    }
  };

  const getHeading1Style = (): CSSProperties => {
    const isCentered = headingStyle === "centered";
    const styles: CSSProperties = {};
    if (isCentered) {
      styles.textAlign = "center";
    }
    if (headingStyle === "italic") {
      styles.fontStyle = "italic";
    }
    if (headingStyle === "leftborder") {
      styles.borderLeft = `4px solid #${solution.colorTheme.primaryHex}`;
      styles.paddingLeft = "8px";
    }
    if (wordFont === "TimesNewRoman" || wordFont === "Georgia") {
      styles.fontFamily = getFontFamily();
    }
    styles.color = headingStyle === "centered" ? "#18181b" : `#${solution.colorTheme.primaryHex}`;
    return styles;
  };

  const getHeading1Class = () => {
    let classes = "text-xs font-bold tracking-tight my-2 block ";
    if (wordFont === "TimesNewRoman" || wordFont === "Georgia") {
      classes += " font-serif";
    } else if (wordFont === "Consolas") {
      classes += " font-mono";
    } else {
      classes += " font-sans";
    }
    return classes;
  };

  const getTableClass = () => {
    let base = "w-full border-collapse my-3 text-left ";
    if (tableStyle === "grid") {
      base += `border ${ds.tableCellBorder}`;
    } else if (tableStyle === "booktabs") {
      base += `border-t-2 border-b-2 ${theme !== "light" ? "border-slate-300" : "border-zinc-900"}`;
    } else {
      base += `border-t border-b ${ds.border}`;
    }
    return base;
  };

  const getTableHeaderStyle = (): CSSProperties => {
    const styles: CSSProperties = {};
    if (tableStyle === "stripe" || tableStyle === "faint") {
      styles.backgroundColor = "transparent";
      styles.color = theme === "light" ? `#${solution.colorTheme.primaryHex}` : (theme === "desert" ? "#efe1c5" : "#c084fc");
      styles.borderBottom = `2px solid ${theme === "light" ? `#${solution.colorTheme.primaryHex}` : (theme === "desert" ? "#614e3b" : "#472875")}`;
    } else {
      styles.backgroundColor = theme === "light" ? `#${solution.colorTheme.primaryHex}` : (theme === "desert" ? "#3D2E1F" : theme === "galaxy" ? "#2E1A47" : "#1E293B");
      styles.color = "#ffffff";
    }
    if (wordFont === "TimesNewRoman" || wordFont === "Georgia") {
      styles.fontFamily = getFontFamily();
    }
    return styles;
  };

  const getTableHeaderClass = () => {
    let classes = "text-[9px] font-bold uppercase tracking-wider ";
    if (wordFont === "TimesNewRoman" || wordFont === "Georgia") {
      classes += " font-serif";
    } else if (wordFont === "Consolas") {
      classes += " font-mono";
    } else {
      classes += " font-sans";
    }
    return classes;
  };

  const getTableCellClass = (index: number) => {
    let classes = "p-2 text-[10px] leading-relaxed ";
    if (wordFont === "TimesNewRoman" || wordFont === "Georgia") {
      classes += " font-serif";
    } else if (wordFont === "Consolas") {
      classes += " font-mono";
    } else {
      classes += " font-sans";
    }

    if (tableStyle === "grid") {
      classes += ` border ${ds.tableCellBorder}`;
    } else {
      classes += ` border-b ${ds.border}`;
    }

    const stripeBg = theme === "dark" ? " bg-slate-800/70" : theme === "galaxy" ? " bg-purple-950/70" : theme === "desert" ? " bg-[#e3d4b6]/70" : " bg-zinc-50";
    const gridBg = theme === "dark" ? " bg-slate-800/40" : theme === "galaxy" ? " bg-purple-950/40" : theme === "desert" ? " bg-[#e3d4b6]/40" : " bg-zinc-50/50";

    if (tableStyle === "stripe" && index % 2 === 1) {
      classes += stripeBg;
    } else if (tableStyle === "grid" && index % 2 === 1) {
      classes += gridBg;
    }

    return classes;
  };

  const getParagraphClass = () => {
    let size = "text-[11px] leading-relaxed ";
    if (spacingDensity === "compact") {
      size = "text-[10px] leading-normal ";
    } else if (spacingDensity === "double") {
      size = "text-[12px] leading-loose ";
    }

    if (wordFont === "TimesNewRoman" || wordFont === "Georgia") {
      size += " font-serif text-justify whitespace-pre-wrap";
    } else if (wordFont === "Consolas") {
      size += " font-mono text-justify whitespace-pre-wrap";
    } else {
      size += " font-sans text-justify whitespace-pre-wrap";
    }
    return `${size} ${ds.textSecondary}`;
  };

  const getPagePaddingClass = () => {
    if (spacingDensity === "compact") return "p-8";
    if (spacingDensity === "double") return "p-12";
    return "p-10";
  };

  const getPageSpacingClass = () => {
    if (spacingDensity === "compact") return "space-y-3";
    if (spacingDensity === "double") return "space-y-7";
    return "space-y-5";
  };

  const renderBinaryWithMismatches = (sent: string, received: string, displayType: "sent" | "received") => {
    const minLen = Math.min(sent.length, received.length);
    const target = displayType === "sent" ? sent : received;
    
    return (
      <span className="font-mono text-[10.5px] tracking-wider break-all select-text">
        {target.split("").map((char, index) => {
          const isMismatched = index < minLen && sent[index] !== received[index];
          if (isMismatched) {
            if (mismatchHighlight === "none") {
              return <span key={index} className={`select-text ${ds.textPrimary}`}>{char}</span>;
            } else if (mismatchHighlight === "yellow") {
              return (
                <span key={index} className="bg-yellow-250 text-black font-semibold px-0.5 mx-[0.2px] select-text shadow-3xs">
                  {char}
                </span>
              );
            } else if (mismatchHighlight === "underline") {
              return (
                <span key={index} className={`underline decoration-2 font-bold ${ds.textPrimary} select-text`}>
                  {char}
                </span>
              );
            } else {
              // "red"
              return (
                <span key={index} className={`${theme === "light" ? "text-rose-600" : "text-rose-400"} font-bold select-text`}>
                  {char}
                </span>
              );
            }
          }
          return <span key={index} className={`select-text ${ds.textSecondary}`}>{char}</span>;
        })}
      </span>
    );
  };

  // Word count dynamic calculations
  const calculateWordCount = () => {
    const introCount = solution.introduction.split(/\s+/).filter(Boolean).length;
    const conclusionCount = solution.conclusion.split(/\s+/).filter(Boolean).length;
    const q1Count = solution.q1Data.reduce((acc, row) => acc + row.explanation.split(/\s+/).filter(Boolean).length, 0);
    return introCount + conclusionCount + q1Count + 220; 
  };

  const getSectionBtnClass = (section: "intro" | "diagram" | "q1" | "q2" | "conclusion") => {
    const enabled = isSectionEnabled(section);
    if (!enabled) {
      return `${s.subBg} border ${s.subBorder} ${s.textMuted} font-medium`;
    }
    switch (theme) {
      case "dark":
        return "bg-emerald-500/10 border-emerald-500/25 text-emerald-400 font-bold";
      case "galaxy":
        return "bg-fuchsia-500/10 border-fuchsia-500/25 text-fuchsia-400 font-bold";
      case "desert":
        return "bg-[#C05C33]/10 border-[#C05C33]/25 text-[#C05C33] font-bold";
      default:
        return "bg-emerald-50 border-emerald-200 text-emerald-800 font-bold";
    }
  };

  const getSectionDotClass = (section: "intro" | "diagram" | "q1" | "q2" | "conclusion") => {
    const enabled = isSectionEnabled(section);
    if (!enabled) return "bg-zinc-300";
    switch (theme) {
      case "dark":
        return "bg-emerald-500";
      case "galaxy":
        return "bg-fuchsia-500";
      case "desert":
        return "bg-[#C05C33]";
      default:
        return "bg-emerald-500";
    }
  };

  const getExportBtnClass = () => {
    switch (theme) {
      case "dark":
        return "bg-emerald-600 hover:bg-emerald-700 text-white font-bold border border-emerald-700";
      case "galaxy":
        return "bg-purple-700 hover:bg-purple-850 text-white font-bold border border-purple-800";
      case "desert":
        return "bg-[#C05C33] hover:bg-[#A84C27] text-white font-bold border border-[#A0441D]";
      default:
        return "bg-zinc-900 hover:bg-zinc-800 text-white font-bold border border-zinc-950";
    }
  };

  const getWordOuterBg = () => {
    switch (theme) {
      case "dark":
        return "bg-[#0b0e14]";
      case "galaxy":
        return "bg-[#070512]";
      case "desert":
        return "bg-[#e2d6c3]";
      default:
        return "bg-[#eaeaea]";
    }
  };

  const getSheetClasses = () => {
    switch (theme) {
      case "dark":
        return {
          paper: "bg-slate-900 text-slate-100 shadow-2xl border border-slate-800",
          textPrimary: "text-slate-100",
          textSecondary: "text-slate-300",
          textMuted: "text-slate-400",
          accentText: "text-emerald-400",
          border: "border-slate-800",
          tableBg: "bg-slate-950",
          tableHeaderBg: "bg-slate-850",
          tableCellBorder: "border-slate-800",
          metaLabel: "text-slate-400",
          calloutBg: "bg-slate-850 border-l-4 border-emerald-500",
          rulerBg: "bg-slate-800 border-b border-slate-700 text-slate-500",
        };
      case "galaxy":
        return {
          paper: "bg-[#0e0a24] text-purple-100 shadow-2xl border border-purple-950/50",
          textPrimary: "text-purple-100",
          textSecondary: "text-purple-200",
          textMuted: "text-purple-400/80",
          accentText: "text-fuchsia-400",
          border: "border-purple-950/40",
          tableBg: "bg-[#080516]",
          tableHeaderBg: "bg-[#18113c]",
          tableCellBorder: "border-purple-950/40",
          metaLabel: "text-purple-400",
          calloutBg: "bg-[#150f35] border-l-4 border-fuchsia-500",
          rulerBg: "bg-[#161233] border-b border-purple-950/30 text-purple-400",
        };
      case "desert":
        return {
          paper: "bg-[#F4ECD8] text-[#3D2E1F] shadow-xl border border-[#DED0B6]",
          textPrimary: "text-[#3D2E1F]",
          textSecondary: "text-[#5C4B37]",
          textMuted: "text-[#7D6B55]",
          accentText: "text-[#C05C33]",
          border: "border-[#E8DFCA]",
          tableBg: "bg-[#FAF6EE]",
          tableHeaderBg: "bg-[#E2D4B7]",
          tableCellBorder: "border-[#E3D5BA]",
          metaLabel: "text-[#8E7E6A]",
          calloutBg: "bg-[#EFE5CD] border-l-4 border-[#C05C33]",
          rulerBg: "bg-[#E8DFCA] border-b border-[#DCD0B6] text-[#7D6B55]",
        };
      default:
        return {
          paper: "bg-white text-zinc-950 shadow-xl border border-zinc-200",
          textPrimary: "text-zinc-900",
          textSecondary: "text-zinc-700",
          textMuted: "text-zinc-500",
          accentText: "text-[#185abd]",
          border: "border-zinc-200",
          tableBg: "bg-white",
          tableHeaderBg: "bg-zinc-100",
          tableCellBorder: "border-zinc-300",
          metaLabel: "text-zinc-500",
          calloutBg: "bg-zinc-50 border-l-4 border-zinc-400",
          rulerBg: "bg-zinc-50 border-b border-zinc-300 text-zinc-400",
        };
    }
  };

  const ds = getSheetClasses();

  return (
    <div className="space-y-6" id="solution-preview-workspace">
      
      {/* =========================================================
          LIVE DOCUMENT EDITOR CONTROL DESK
         ========================================================= */}
      <div className={`${s.cardBg} border ${s.cardBorder} rounded-xl shadow-xs overflow-hidden transition-colors duration-300`}>
        {/* Desk Header */}
        <div className={`${s.subBg} border-b ${s.subBorder} p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-colors duration-300`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 ${theme === "desert" ? "bg-[#C05C33]" : theme === "galaxy" ? "bg-purple-800" : theme === "dark" ? "bg-emerald-600" : "bg-zinc-900"} text-white rounded-lg flex items-center justify-center font-bold text-sm`}>
              📝
            </div>
            <div>
              <h3 className={`text-xs font-bold uppercase tracking-wider ${s.textPrimary}`}>
                Live Document Editor Control Desk
              </h3>
              <p className={`text-[10px] ${s.textMuted} mt-0.5`}>
                Customize assignment parameters below. The Microsoft Word Canvas will instantly render flat text.
              </p>
            </div>
          </div>
          
          {/* Quick Actions Triggers */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {onResetSolution && (
              <button
                onClick={onResetSolution}
                className={`flex items-center gap-1.5 px-3 py-1.5 ${s.btnSecondaryBg} ${s.textSecondary} font-bold text-[10px] rounded border ${s.subBorder} uppercase tracking-wider transition-all cursor-pointer`}
                title="Reset all fields of this variant back to default"
              >
                <RotateCcw size={13} />
                Reset Variant
              </button>
            )}

            <button
              onClick={handleTriggerExport}
              disabled={isExporting}
              className={`flex items-center gap-1.5 px-3 py-1.5 ${getExportBtnClass()} text-[10px] rounded uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer`}
            >
              <Download size={13} />
              {isExporting ? "Compiling..." : "Export .DOCX"}
            </button>
          </div>
        </div>

        {/* Collapsible Editorial Blocks */}
        <div className={`divide-y ${s.borderLight} transition-colors duration-300`}>
          
          {/* 1. ACADEMIC CREDENTIALS & METADATA */}
          <div className={`${s.cardBg} transition-colors duration-300`}>
            <button
              onClick={() => setOpenSection(openSection === "metadata" ? null : "metadata")}
              className={`w-full flex items-center justify-between p-4 hover:${s.subBg} transition-all text-left cursor-pointer`}
            >
              <div className={`flex items-center gap-2.5 text-xs font-bold ${s.textPrimary} uppercase tracking-wide`}>
                <GraduationCap size={16} className={theme === "dark" ? "text-emerald-400" : theme === "galaxy" ? "text-fuchsia-400" : theme === "desert" ? "text-[#C05C33]" : "text-zinc-600"} />
                <span>Academic Credentials & Document Setup</span>
              </div>
              {openSection === "metadata" ? <ChevronUp size={16} className={s.textMuted} /> : <ChevronDown size={16} className={s.textMuted} />}
            </button>

            {openSection === "metadata" && (
              <div className={`p-4 ${s.subBg}/30 border-t ${s.borderLight} grid grid-cols-1 md:grid-cols-3 gap-4 transition-colors duration-300`}>
                <div className="space-y-1">
                  <label className={`text-[9px] font-bold uppercase tracking-wider ${s.textMuted}`}>Student Name</label>
                  <input
                    type="text"
                    value={student.studentName}
                    onChange={(e) => onChangeStudent({ ...student, studentName: e.target.value })}
                    className={`w-full text-xs px-3 py-1.5 ${s.inputBg} border ${s.inputBorder} ${s.inputText} rounded outline-none transition-all`}
                  />
                </div>
                <div className="space-y-1">
                  <label className={`text-[9px] font-bold uppercase tracking-wider ${s.textMuted}`}>VU Student ID</label>
                  <input
                    type="text"
                    value={student.studentId}
                    onChange={(e) => onChangeStudent({ ...student, studentId: e.target.value })}
                    className={`w-full text-xs px-3 py-1.5 ${s.inputBg} border ${s.inputBorder} ${s.inputText} rounded outline-none transition-all`}
                  />
                </div>
                <div className="space-y-1">
                  <label className={`text-[9px] font-bold uppercase tracking-wider ${s.textMuted}`}>University</label>
                  <input
                    type="text"
                    value={student.university}
                    onChange={(e) => onChangeStudent({ ...student, university: e.target.value })}
                    className={`w-full text-xs px-3 py-1.5 ${s.inputBg} border ${s.inputBorder} ${s.inputText} rounded outline-none transition-all`}
                  />
                </div>
                <div className="space-y-1">
                  <label className={`text-[9px] font-bold uppercase tracking-wider ${s.textMuted}`}>Course Code</label>
                  <input
                    type="text"
                    value={header.courseCode}
                    onChange={(e) => onChangeHeader({ ...header, courseCode: e.target.value })}
                    className={`w-full text-xs px-3 py-1.5 ${s.inputBg} border ${s.inputBorder} ${s.inputText} rounded outline-none transition-all`}
                  />
                </div>
                <div className="space-y-1">
                  <label className={`text-[9px] font-bold uppercase tracking-wider ${s.textMuted}`}>Course Name</label>
                  <input
                    type="text"
                    value={header.courseName}
                    onChange={(e) => onChangeHeader({ ...header, courseName: e.target.value })}
                    className={`w-full text-xs px-3 py-1.5 ${s.inputBg} border ${s.inputBorder} ${s.inputText} rounded outline-none transition-all`}
                  />
                </div>
                <div className="space-y-1">
                  <label className={`text-[9px] font-bold uppercase tracking-wider ${s.textMuted}`}>Due Date</label>
                  <input
                    type="text"
                    value={header.dueDate}
                    onChange={(e) => onChangeHeader({ ...header, dueDate: e.target.value })}
                    className={`w-full text-xs px-3 py-1.5 ${s.inputBg} border ${s.inputBorder} ${s.inputText} rounded outline-none transition-all`}
                  />
                </div>
                <div className="space-y-1">
                  <label className={`text-[9px] font-bold uppercase tracking-wider ${s.textMuted}`}>Document Font</label>
                  <select
                    value={wordFont}
                    onChange={(e) => setWordFont(e.target.value as any)}
                    className={`w-full text-xs px-3 py-1.5 ${s.inputBg} border ${s.inputBorder} ${s.inputText} rounded outline-none transition-all cursor-pointer`}
                  >
                    <option value="Calibri">Calibri (Standard Modern)</option>
                    <option value="TimesNewRoman">Times New Roman (Academic APA)</option>
                    <option value="Arial">Arial (Clean Sans)</option>
                    <option value="Georgia">Georgia (Elegant Serif)</option>
                    <option value="Consolas">Consolas (Technical Plain)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={`text-[9px] font-bold uppercase tracking-wider ${s.textMuted}`}>Table Borders & Style</label>
                  <select
                    value={tableStyle}
                    onChange={(e) => setTableStyle(e.target.value as any)}
                    className={`w-full text-xs px-3 py-1.5 ${s.inputBg} border ${s.inputBorder} ${s.inputText} rounded outline-none transition-all cursor-pointer`}
                  >
                    <option value="grid">Fully Grid-Bordered Table</option>
                    <option value="booktabs">LaTeX Booktabs (Horizontal-Only)</option>
                    <option value="stripe">Zebra Stripes Minimalist</option>
                    <option value="faint">Faint Light Gridlines</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={`text-[9px] font-bold uppercase tracking-wider ${s.textMuted}`}>Heading Layout Style</label>
                  <select
                    value={headingStyle}
                    onChange={(e) => setHeadingStyle(e.target.value as any)}
                    className={`w-full text-xs px-3 py-1.5 ${s.inputBg} border ${s.inputBorder} ${s.inputText} rounded outline-none transition-all cursor-pointer`}
                  >
                    <option value="standard">Standard Bold Left</option>
                    <option value="leftborder">Color-Accent Side Bar Indicator</option>
                    <option value="centered">Centered Classical APA</option>
                    <option value="italic">Elegant Italic Standard</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={`text-[9px] font-bold uppercase tracking-wider ${s.textMuted}`}>Spacing & Line Density</label>
                  <select
                    value={spacingDensity}
                    onChange={(e) => setSpacingDensity(e.target.value as any)}
                    className={`w-full text-xs px-3 py-1.5 ${s.inputBg} border ${s.inputBorder} ${s.inputText} rounded outline-none transition-all cursor-pointer`}
                  >
                    <option value="comfortable">Comfortable Standard Spacing</option>
                    <option value="compact">Compact Ultra-Dense Spacing</option>
                    <option value="double">Academic Large Spacing</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={`text-[9px] font-bold uppercase tracking-wider ${s.textMuted}`}>Cover Page Border Style</label>
                  <select
                    value={coverBorder}
                    onChange={(e) => setCoverBorder(e.target.value as any)}
                    className={`w-full text-xs px-3 py-1.5 ${s.inputBg} border ${s.inputBorder} ${s.inputText} rounded outline-none transition-all cursor-pointer`}
                  >
                    <option value="none">No Outer Page Border</option>
                    <option value="thin">Thin Color-Accent Box Border</option>
                    <option value="double">Classic Academic Double-Border</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={`text-[9px] font-bold uppercase tracking-wider ${s.textMuted}`}>Word Mismatch Style</label>
                  <select
                    value={mismatchHighlight}
                    onChange={(e) => setMismatchHighlight(e.target.value as any)}
                    className={`w-full text-xs px-3 py-1.5 ${s.inputBg} border ${s.inputBorder} ${s.inputText} rounded outline-none transition-all cursor-pointer`}
                  >
                    <option value="red">Bold Red Text (VU Standard)</option>
                    <option value="yellow">Yellow Highlighter (Classic Word)</option>
                    <option value="underline">Underline & Bold Style (Monochrome)</option>
                    <option value="none">Plain Text (Perfect Manual Look)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={`text-[9px] font-bold uppercase tracking-wider ${s.textMuted}`}>Cover Page Toggle</label>
                  <button
                    onClick={toggleCoverPage}
                    className={`w-full flex items-center justify-between text-xs px-3 py-1.5 ${s.inputBg} border ${s.inputBorder} ${s.inputText} rounded outline-none hover:${s.subBg} transition-all cursor-pointer`}
                  >
                    <span>{solution.hasCoverPage ? "Cover Page Active" : "No Cover Page"}</span>
                    {solution.hasCoverPage ? <ToggleRight size={20} className={theme === "desert" ? "text-[#C05C33]" : theme === "galaxy" ? "text-fuchsia-400" : theme === "dark" ? "text-emerald-400" : "text-zinc-900"} /> : <ToggleLeft size={20} className={s.textMuted} />}
                  </button>
                </div>

                {/* Unified Section Visibility Toggles */}
                <div className={`md:col-span-3 border-t ${s.borderLight} pt-3 mt-1`}>
                  <span className={`text-[9px] font-bold uppercase tracking-widest ${s.textMuted} block mb-2.5`}>
                    Include / Omit Report Sections
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                    <button
                      onClick={() => toggleSection("intro")}
                      className={`flex items-center justify-between text-[11px] px-2.5 py-2 rounded border transition-all cursor-pointer ${getSectionBtnClass("intro")}`}
                    >
                      <span>1. Introduction</span>
                      <span className={`w-2 h-2 rounded-full ${getSectionDotClass("intro")}`} />
                    </button>
                    
                    <button
                      onClick={() => toggleSection("diagram")}
                      className={`flex items-center justify-between text-[11px] px-2.5 py-2 rounded border transition-all cursor-pointer ${getSectionBtnClass("diagram")}`}
                    >
                      <span>2. Reference Model</span>
                      <span className={`w-2 h-2 rounded-full ${getSectionDotClass("diagram")}`} />
                    </button>

                    <button
                      onClick={() => toggleSection("q1")}
                      className={`flex items-center justify-between text-[11px] px-2.5 py-2 rounded border transition-all cursor-pointer ${getSectionBtnClass("q1")}`}
                    >
                      <span>3. Question No. 1</span>
                      <span className={`w-2 h-2 rounded-full ${getSectionDotClass("q1")}`} />
                    </button>

                    <button
                      onClick={() => toggleSection("q2")}
                      className={`flex items-center justify-between text-[11px] px-2.5 py-2 rounded border transition-all cursor-pointer ${getSectionBtnClass("q2")}`}
                    >
                      <span>4. Question No. 2</span>
                      <span className={`w-2 h-2 rounded-full ${getSectionDotClass("q2")}`} />
                    </button>

                    <button
                      onClick={() => toggleSection("conclusion")}
                      className={`flex items-center justify-between text-[11px] px-2.5 py-2 rounded border transition-all cursor-pointer ${getSectionBtnClass("conclusion")}`}
                    >
                      <span>5. Conclusion</span>
                      <span className={`w-2 h-2 rounded-full ${getSectionDotClass("conclusion")}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. INTRODUCTION TEXTAREA */}
          <div className={`transition-all ${s.cardBg} ${!isSectionEnabled("intro") ? "opacity-55" : ""}`}>
            <button
              onClick={() => isSectionEnabled("intro") && setOpenSection(openSection === "intro" ? null : "intro")}
              className={`w-full flex items-center justify-between p-4 hover:${s.subBg} transition-all text-left ${!isSectionEnabled("intro") ? "cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className={`flex items-center gap-2.5 text-xs font-bold ${s.textPrimary} uppercase tracking-wide`}>
                <BookOpen size={16} className={isSectionEnabled("intro") ? (theme === "dark" ? "text-emerald-400" : theme === "galaxy" ? "text-fuchsia-400" : theme === "desert" ? "text-[#C05C33]" : "text-zinc-600") : s.textMuted} />
                <span className={!isSectionEnabled("intro") ? `line-through ${s.textMuted} font-medium` : ""}>Section 1: Introduction & Background Theory</span>
                {!isSectionEnabled("intro") && (
                  <span className={`text-[8px] ${s.badgeBg} ${s.textMuted} border ${s.subBorder} px-1.5 py-0.5 rounded font-mono font-bold tracking-wider uppercase`}>
                    Hidden
                  </span>
                )}
              </div>
              {isSectionEnabled("intro") ? (openSection === "intro" ? <ChevronUp size={16} className={s.textMuted} /> : <ChevronDown size={16} className={s.textMuted} />) : null}
            </button>

            {isSectionEnabled("intro") && openSection === "intro" && (
              <div className={`p-4 ${s.subBg}/30 border-t ${s.borderLight} space-y-2`}>
                <p className={`text-[10px] ${s.textMuted} italic`}>
                  Modify the academic background theory introduction to ensure absolute uniqueness.
                </p>
                <textarea
                  value={solution.introduction}
                  onChange={(e) => handleIntroChange(e.target.value)}
                  className={`w-full text-xs p-3 ${s.inputBg} border ${s.inputBorder} ${s.inputText} rounded outline-none transition-all min-h-[90px] leading-relaxed`}
                />
              </div>
            )}
          </div>

          {/* 3. QUESTION NO. 1: ERROR CLASSIFICATION GRID */}
          <div className={`transition-all ${s.cardBg} ${!isSectionEnabled("q1") ? "opacity-55" : ""}`}>
            <button
              onClick={() => isSectionEnabled("q1") && setOpenSection(openSection === "q1" ? null : "q1")}
              className={`w-full flex items-center justify-between p-4 hover:${s.subBg} transition-all text-left ${!isSectionEnabled("q1") ? "cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className={`flex items-center gap-2.5 text-xs font-bold ${s.textPrimary} uppercase tracking-wide`}>
                <Activity size={16} className={isSectionEnabled("q1") ? (theme === "dark" ? "text-emerald-400" : theme === "galaxy" ? "text-fuchsia-400" : theme === "desert" ? "text-[#C05C33]" : "text-zinc-600") : s.textMuted} />
                <span className={!isSectionEnabled("q1") ? `line-through ${s.textMuted} font-medium` : ""}>Section 2: Question 1 — Transmission Error Table</span>
                {!isSectionEnabled("q1") && (
                  <span className={`text-[8px] ${s.badgeBg} ${s.textMuted} border ${s.subBorder} px-1.5 py-0.5 rounded font-mono font-bold tracking-wider uppercase`}>
                    Hidden
                  </span>
                )}
              </div>
              {isSectionEnabled("q1") ? (openSection === "q1" ? <ChevronUp size={16} className={s.textMuted} /> : <ChevronDown size={16} className={s.textMuted} />) : null}
            </button>

            {isSectionEnabled("q1") && openSection === "q1" && (
              <div className={`p-4 ${s.subBg}/30 border-t ${s.borderLight} space-y-4`}>
                <p className={`text-[10px] ${s.textMuted} italic`}>
                  Review each stream comparison. Select the error class and draft an explanation. (Changes instantly display as flat text inside the Word Canvas).
                </p>

                {/* Format Editor for Question 1 */}
                <div className={`${s.cardBg} border ${s.cardBorder} rounded-lg p-3.5 space-y-3 bg-zinc-500/5`}>
                  <h4 className={`text-[10px] font-bold uppercase tracking-wider ${s.textPrimary} flex items-center gap-1.5`}>
                    ⚙️ Format Customizer (Adjust for Any Assignment)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className={`text-[9px] font-bold uppercase tracking-wider ${s.textMuted} block`}>Question Title</label>
                      <input
                        type="text"
                        value={solution.q1Title ?? "Question No. 1"}
                        onChange={(e) => onChangeSolution({ ...solution, q1Title: e.target.value })}
                        className={`w-full text-xs px-2.5 py-1 ${s.inputBg} border ${s.inputBorder} ${s.inputText} rounded outline-none`}
                        placeholder="e.g. Question No. 1"
                      />
                    </div>
                    <div className="space-y-1 col-span-1 md:col-span-2">
                      <label className={`text-[9px] font-bold uppercase tracking-wider ${s.textMuted} block`}>Question Description/Subtitle</label>
                      <textarea
                        value={solution.q1Subtitle ?? "Identify whether the received message exhibits a Single bit error or a Burst error by comparing the sent and received vectors. Provide a descriptive analysis for each observation."}
                        onChange={(e) => onChangeSolution({ ...solution, q1Subtitle: e.target.value })}
                        className={`w-full text-xs p-2 ${s.inputBg} border ${s.inputBorder} ${s.inputText} rounded outline-none h-12`}
                        placeholder="e.g. Identify the type of error..."
                      />
                    </div>
                    <div className="space-y-1">
                      <label className={`text-[9px] font-bold uppercase tracking-wider ${s.textMuted} block`}>Table Column 1 Header</label>
                      <input
                        type="text"
                        value={solution.q1ColHeaders?.[0] ?? "Sent Message"}
                        onChange={(e) => {
                          const colH = [...(solution.q1ColHeaders ?? ["Sent Message", "Received Message", "Type of Error & Explanation"])];
                          colH[0] = e.target.value;
                          onChangeSolution({ ...solution, q1ColHeaders: colH });
                        }}
                        className={`w-full text-xs px-2.5 py-1 ${s.inputBg} border ${s.inputBorder} ${s.inputText} rounded outline-none`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className={`text-[9px] font-bold uppercase tracking-wider ${s.textMuted} block`}>Table Column 2 Header</label>
                      <input
                        type="text"
                        value={solution.q1ColHeaders?.[1] ?? "Received Message"}
                        onChange={(e) => {
                          const colH = [...(solution.q1ColHeaders ?? ["Sent Message", "Received Message", "Type of Error & Explanation"])];
                          colH[1] = e.target.value;
                          onChangeSolution({ ...solution, q1ColHeaders: colH });
                        }}
                        className={`w-full text-xs px-2.5 py-1 ${s.inputBg} border ${s.inputBorder} ${s.inputText} rounded outline-none`}
                      />
                    </div>
                    <div className="space-y-1 col-span-1 md:col-span-2">
                      <label className={`text-[9px] font-bold uppercase tracking-wider ${s.textMuted} block`}>Table Column 3 Header</label>
                      <input
                        type="text"
                        value={solution.q1ColHeaders?.[2] ?? "Type of Error & Explanation"}
                        onChange={(e) => {
                          const colH = [...(solution.q1ColHeaders ?? ["Sent Message", "Received Message", "Type of Error & Explanation"])];
                          colH[2] = e.target.value;
                          onChangeSolution({ ...solution, q1ColHeaders: colH });
                        }}
                        className={`w-full text-xs px-2.5 py-1 ${s.inputBg} border ${s.inputBorder} ${s.inputText} rounded outline-none`}
                      />
                    </div>
                  </div>
                </div>

                {solution.q1Data.map((row, idx) => (
                  <div key={`edit-q1-${idx}`} className={`${s.cardBg} border ${s.cardBorder} rounded-lg p-3.5 space-y-3 transition-colors duration-300`}>
                    <div className={`flex items-center justify-between border-b ${s.borderLight} pb-2`}>
                      <span className={`text-[10px] font-bold ${s.textMuted} uppercase tracking-widest font-mono`}>
                        Vector comparison stream {idx + 1} of {solution.q1Data.length}
                      </span>
                      {solution.q1Data.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = solution.q1Data.filter((_, i) => i !== idx);
                            onChangeSolution({ ...solution, q1Data: updated });
                          }}
                          className="text-red-500 hover:text-red-700 text-[9px] font-bold uppercase tracking-wider border border-red-500/20 px-2 py-0.5 rounded hover:bg-red-500/10 cursor-pointer"
                        >
                          ✕ Delete Stream
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className={`text-[9px] font-bold uppercase tracking-wider ${s.textMuted} block mb-1`}>Sent Vector (Binary Only)</label>
                        <input
                          type="text"
                          value={row.sentMessage}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^01]/g, "");
                            handleQ1CellChange(idx, "sentMessage", val);
                            
                            // Auto-classify if lengths match
                            const recv = row.receivedMessage;
                            if (val.length === recv.length) {
                              let mismatches = 0;
                              for (let i = 0; i < val.length; i++) {
                                if (val[i] !== recv[i]) mismatches++;
                              }
                              if (mismatches === 1) {
                                handleQ1CellChange(idx, "detectedError", "Single bit error");
                              } else if (mismatches > 1) {
                                handleQ1CellChange(idx, "detectedError", "Burst error");
                              }
                            }
                          }}
                          className={`w-full font-mono text-xs font-bold px-3 py-1.5 ${s.inputBg} border ${s.inputBorder} ${s.inputText} rounded outline-none focus:bg-white tracking-widest`}
                          placeholder="e.g. 101010"
                        />
                      </div>
                      <div>
                        <label className={`text-[9px] font-bold uppercase tracking-wider ${s.textMuted} block mb-1`}>Received Vector (Binary Only)</label>
                        <input
                          type="text"
                          value={row.receivedMessage}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^01]/g, "");
                            handleQ1CellChange(idx, "receivedMessage", val);
                            
                            // Auto-classify if lengths match
                            const sent = row.sentMessage;
                            if (val.length === sent.length) {
                              let mismatches = 0;
                              for (let i = 0; i < sent.length; i++) {
                                if (sent[i] !== val[i]) mismatches++;
                              }
                              if (mismatches === 1) {
                                handleQ1CellChange(idx, "detectedError", "Single bit error");
                              } else if (mismatches > 1) {
                                handleQ1CellChange(idx, "detectedError", "Burst error");
                              }
                            }
                          }}
                          className={`w-full font-mono text-xs font-bold px-3 py-1.5 ${s.inputBg} border ${s.inputBorder} ${s.inputText} rounded outline-none focus:bg-white tracking-widest`}
                          placeholder="e.g. 101010"
                        />
                      </div>
                    </div>

                    {/* Premium Error Type Selector Buttons */}
                    <div className="space-y-1">
                      <label className={`text-[9px] font-bold uppercase tracking-wider ${s.textMuted}`}>Classified Error Type</label>
                      <div className={`flex ${s.tabBarBg} p-0.5 rounded border ${s.subBorder} w-full sm:w-80`}>
                        <button
                          type="button"
                          onClick={() => handleQ1CellChange(idx, "detectedError", "Single bit error")}
                          className={`flex-1 text-[10px] font-bold py-1.5 px-3 rounded uppercase tracking-wider transition-all cursor-pointer ${
                            row.detectedError === "Single bit error"
                              ? `${s.tabActiveBg} border ${s.subBorder} shadow-3xs`
                              : `${s.tabInactiveText}`
                          }`}
                        >
                          Single bit error
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQ1CellChange(idx, "detectedError", "Burst error")}
                          className={`flex-1 text-[10px] font-bold py-1.5 px-3 rounded uppercase tracking-wider transition-all cursor-pointer ${
                            row.detectedError === "Burst error"
                              ? `${s.tabActiveBg} border ${s.subBorder} shadow-3xs`
                              : `${s.tabInactiveText}`
                          }`}
                        >
                          Burst error
                        </button>
                      </div>
                    </div>

                    {/* Explanation */}
                    <div className="space-y-1">
                      <label className={`text-[9px] font-bold uppercase tracking-wider ${s.textMuted}`}>Academic Explanation</label>
                      <textarea
                        value={row.explanation}
                        onChange={(e) => handleQ1CellChange(idx, "explanation", e.target.value)}
                        className={`w-full text-xs p-2 ${s.inputBg} focus:bg-white border ${s.inputBorder} ${s.inputText} rounded outline-none transition-all leading-relaxed min-h-[60px]`}
                        placeholder="Type custom explanation why this is a Single bit or Burst error..."
                      />
                    </div>
                  </div>
                ))}

                {/* Button to add stream comparison */}
                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const newRow = {
                        sentMessage: "1010101",
                        receivedMessage: "1011101",
                        detectedError: "Single bit error" as const,
                        explanation: "Only the fourth bit from the left flipped (0 -> 1) during transmission. The remaining bits match exactly."
                      };
                      onChangeSolution({ ...solution, q1Data: [...solution.q1Data, newRow] });
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded border border-emerald-700 uppercase tracking-wider transition-all cursor-pointer"
                  >
                    ➕ Add Stream Comparison Row
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 4. QUESTION NO. 2: HAMMING DISTANCE CALCULATOR */}
          <div className={`transition-all ${s.cardBg} ${!isSectionEnabled("q2") ? "opacity-55" : ""}`}>
            <button
              onClick={() => isSectionEnabled("q2") && setOpenSection(openSection === "q2" ? null : "q2")}
              className={`w-full flex items-center justify-between p-4 hover:${s.subBg} transition-all text-left ${!isSectionEnabled("q2") ? "cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className={`flex items-center gap-2.5 text-xs font-bold ${s.textPrimary} uppercase tracking-wide`}>
                <HelpCircle size={16} className={isSectionEnabled("q2") ? (theme === "dark" ? "text-emerald-400" : theme === "galaxy" ? "text-fuchsia-400" : theme === "desert" ? "text-[#C05C33]" : "text-zinc-600") : s.textMuted} />
                <span className={!isSectionEnabled("q2") ? `line-through ${s.textMuted} font-medium` : ""}>Section 3: Question 2 — Hamming Distance Bounds</span>
                {!isSectionEnabled("q2") && (
                  <span className={`text-[8px] ${s.badgeBg} ${s.textMuted} border ${s.subBorder} px-1.5 py-0.5 rounded font-mono font-bold tracking-wider uppercase`}>
                    Hidden
                  </span>
                )}
              </div>
            </button>

            {isSectionEnabled("q2") && openSection === "q2" && (
              <div className={`p-4 ${s.subBg}/30 border-t ${s.borderLight} space-y-4`}>
                <p className={`text-[10px] ${s.textMuted} italic`}>
                  Configure corrected error bits (t) and compute Minimum Hamming distance (d_min). Verification formula: d_min = 2t + 1.
                </p>

                {/* Format Editor for Question 2 */}
                <div className={`${s.cardBg} border ${s.cardBorder} rounded-lg p-3.5 space-y-3 bg-zinc-500/5`}>
                  <h4 className={`text-[10px] font-bold uppercase tracking-wider ${s.textPrimary} flex items-center gap-1.5`}>
                    ⚙️ Format Customizer (Adjust for Any Assignment)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className={`text-[9px] font-bold uppercase tracking-wider ${s.textMuted} block`}>Question Title</label>
                      <input
                        type="text"
                        value={solution.q2Title ?? "Question No. 2"}
                        onChange={(e) => onChangeSolution({ ...solution, q2Title: e.target.value })}
                        className={`w-full text-xs px-2.5 py-1 ${s.inputBg} border ${s.inputBorder} ${s.inputText} rounded outline-none`}
                        placeholder="e.g. Question No. 2"
                      />
                    </div>
                    <div className="space-y-1 col-span-1 md:col-span-2">
                      <label className={`text-[9px] font-bold uppercase tracking-wider ${s.textMuted} block`}>Question Description/Subtitle</label>
                      <textarea
                        value={solution.q2Subtitle ?? "Complete the missing minimum Hamming distance value using the block code theorem formula:"}
                        onChange={(e) => onChangeSolution({ ...solution, q2Subtitle: e.target.value })}
                        className={`w-full text-xs p-2 ${s.inputBg} border ${s.inputBorder} ${s.inputText} rounded outline-none h-12`}
                        placeholder="e.g. Complete the missing values..."
                      />
                    </div>
                    <div className="space-y-1">
                      <label className={`text-[9px] font-bold uppercase tracking-wider ${s.textMuted} block`}>Table Column 1 Header</label>
                      <input
                        type="text"
                        value={solution.q2ColHeaders?.[0] ?? "Number of bits to be corrected (t)"}
                        onChange={(e) => {
                          const colH = [...(solution.q2ColHeaders ?? ["Number of bits to be corrected (t)", "Minimum Hamming distance (d_min)"])];
                          colH[0] = e.target.value;
                          onChangeSolution({ ...solution, q2ColHeaders: colH });
                        }}
                        className={`w-full text-xs px-2.5 py-1 ${s.inputBg} border ${s.inputBorder} ${s.inputText} rounded outline-none`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className={`text-[9px] font-bold uppercase tracking-wider ${s.textMuted} block`}>Table Column 2 Header</label>
                      <input
                        type="text"
                        value={solution.q2ColHeaders?.[1] ?? "Minimum Hamming distance (d_min)"}
                        onChange={(e) => {
                          const colH = [...(solution.q2ColHeaders ?? ["Number of bits to be corrected (t)", "Minimum Hamming distance (d_min)"])];
                          colH[1] = e.target.value;
                          onChangeSolution({ ...solution, q2ColHeaders: colH });
                        }}
                        className={`w-full text-xs px-2.5 py-1 ${s.inputBg} border ${s.inputBorder} ${s.inputText} rounded outline-none`}
                      />
                    </div>
                  </div>
                </div>

                {solution.q2Data.map((row, idx) => {
                  const expectedDist = 2 * row.bitsCorrected + 1;
                  const isMatch = row.minHammingDistance === expectedDist;

                  return (
                    <div key={`edit-q2-${idx}`} className={`${s.cardBg} border ${s.cardBorder} rounded-lg p-3.5 flex flex-col gap-3 transition-colors duration-300`}>
                      <div className="flex items-center justify-between border-b border-zinc-200/10 pb-2">
                        <span className={`text-[10px] uppercase tracking-wider ${s.textMuted} block font-mono`}>Row {idx + 1} of {solution.q2Data.length}</span>
                        {solution.q2Data.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = solution.q2Data.filter((_, i) => i !== idx);
                              onChangeSolution({ ...solution, q2Data: updated });
                            }}
                            className="text-red-500 hover:text-red-700 text-[9px] font-bold uppercase tracking-wider border border-red-500/20 px-2 py-0.5 rounded hover:bg-red-500/10 cursor-pointer"
                          >
                            ✕ Delete Row
                          </button>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <label className={`text-xs font-bold ${s.textPrimary} uppercase tracking-wide`}>Bits to Correct (t):</label>
                            <input
                              type="number"
                              min="1"
                              max="500"
                              value={row.bitsCorrected}
                              onChange={(e) => {
                                const tVal = Math.max(1, parseInt(e.target.value) || 0);
                                handleQ2CellChange(idx, "bitsCorrected", tVal);
                                // Auto calculate distance as well
                                handleQ2CellChange(idx, "minHammingDistance", 2 * tVal + 1);
                              }}
                              className={`w-24 font-mono text-xs font-bold px-2.5 py-1.5 ${s.subBg} border ${s.inputBorder} ${s.inputText} rounded outline-none focus:bg-white text-center`}
                            />
                          </div>
                          <p className={`text-[10px] ${s.textMuted} italic font-mono`}>
                            Mathematical Theorem expects: 2({row.bitsCorrected}) + 1 = {expectedDist}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="space-y-1 w-28 shrink-0">
                            <label className={`text-[9px] font-bold uppercase tracking-wider ${s.textMuted}`}>d_min Value</label>
                            <input
                              type="number"
                              value={row.minHammingDistance}
                              onChange={(e) => handleQ2CellChange(idx, "minHammingDistance", parseInt(e.target.value) || 0)}
                              className={`w-full text-xs font-bold px-2 py-1.5 ${s.subBg} border ${s.inputBorder} ${s.inputText} rounded outline-none text-center`}
                            />
                          </div>

                          {/* Match Validation Badge */}
                          <div className="pt-4">
                            {isMatch ? (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                                <CheckCircle2 size={12} /> Correct Math
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20" title="Custom values are permitted, but may fail academic scoring.">
                                <AlertCircle size={12} /> Custom Value
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Button to add hamming row */}
                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const newRow = {
                        bitsCorrected: 10,
                        minHammingDistance: 21,
                        explanation: "d_min = 2(10) + 1 = 21"
                      };
                      onChangeSolution({ ...solution, q2Data: [...solution.q2Data, newRow] });
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded border border-emerald-700 uppercase tracking-wider transition-all cursor-pointer"
                  >
                    ➕ Add Hamming Parameter Row
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 5. CONCLUSION TEXTAREA */}
          <div className={`transition-all ${s.cardBg} ${!isSectionEnabled("conclusion") ? "opacity-55" : ""}`}>
            <button
              onClick={() => isSectionEnabled("conclusion") && setOpenSection(openSection === "conclusion" ? null : "conclusion")}
              className={`w-full flex items-center justify-between p-4 hover:${s.subBg} transition-all text-left ${!isSectionEnabled("conclusion") ? "cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className={`flex items-center gap-2.5 text-xs font-bold ${s.textPrimary} uppercase tracking-wide`}>
                <FileText size={16} className={isSectionEnabled("conclusion") ? (theme === "dark" ? "text-emerald-400" : theme === "galaxy" ? "text-fuchsia-400" : theme === "desert" ? "text-[#C05C33]" : "text-zinc-600") : s.textMuted} />
                <span className={!isSectionEnabled("conclusion") ? `line-through ${s.textMuted} font-medium` : ""}>Section 4: Conclusion & Honesty Pledge</span>
                {!isSectionEnabled("conclusion") && (
                  <span className={`text-[8px] ${s.badgeBg} ${s.textMuted} border ${s.subBorder} px-1.5 py-0.5 rounded font-mono font-bold tracking-wider uppercase`}>
                    Hidden
                  </span>
                )}
              </div>
              {isSectionEnabled("conclusion") ? (openSection === "conclusion" ? <ChevronUp size={16} className={s.textMuted} /> : <ChevronDown size={16} className={s.textMuted} />) : null}
            </button>

            {isSectionEnabled("conclusion") && openSection === "conclusion" && (
              <div className={`p-4 ${s.subBg}/30 border-t ${s.borderLight} space-y-2`}>
                <p className={`text-[10px] ${s.textMuted} italic`}>
                  Modify the ending remarks and plagiarism declarations.
                </p>
                <textarea
                  value={solution.conclusion}
                  onChange={(e) => handleConclusionChange(e.target.value)}
                  className={`w-full text-xs p-3 ${s.inputBg} border ${s.inputBorder} ${s.inputText} rounded outline-none transition-all min-h-[80px] leading-relaxed`}
                />
              </div>
            )}
          </div>

        </div>
      </div>

      {/* =========================================================
          PRISTINE FLAT MICROSOFT WORD APPLICATION CANVAS
         ========================================================= */}
      <div className={`border ${s.cardBorder} rounded-lg shadow-xl overflow-hidden ${s.cardBg} flex flex-col font-sans transition-colors duration-300`} id="ms-word-editor-frame">
        {/* Title Bar */}
        <div className={`bg-[#185abd] text-white px-4 py-2.5 flex items-center justify-between text-xs select-none`}>
          <div className="flex items-center gap-3">
            <div className="bg-white text-[#185abd] font-extrabold w-5 h-5 rounded flex items-center justify-center text-[11px] shadow-sm">
              W
            </div>
            <div className="flex items-center gap-2.5 text-white/90">
              <span className="hover:bg-white/10 p-1 rounded cursor-pointer transition-all" title="Save Copy">💾</span>
              <span className="hover:bg-white/10 p-1 rounded cursor-pointer transition-all" title="Undo">↩️</span>
              <span className="hover:bg-white/10 p-1 rounded cursor-pointer transition-all" title="Redo">↪️</span>
              <span className="text-white/40">|</span>
              <Printer size={13} className="hover:bg-white/10 p-0.5 rounded cursor-pointer" title="Print File" />
              <Eye size={13} className="hover:bg-white/10 p-0.5 rounded cursor-pointer text-emerald-400 font-bold" title="Pristine Preview mode Active" />
            </div>
          </div>
          <div className="font-semibold text-center hidden md:block tracking-wide">
            CS601_Assignment_{header.assignmentNo}_Solution_v{solution.id}.docx (Read-Only flat Canvas View)
          </div>
          <div className="flex items-center gap-3 text-white/80">
            <span className="hover:bg-white/15 px-2 py-0.5 rounded cursor-pointer text-xs">─</span>
            <span className="hover:bg-white/15 px-2 py-0.5 rounded cursor-pointer text-xs">❑</span>
            <span className="hover:bg-red-600 hover:text-white px-2 py-0.5 rounded cursor-pointer text-xs font-bold transition-all">✕</span>
          </div>
        </div>

        {/* Word Ribbons Menu */}
        <div className={`${s.subBg} border-b ${s.subBorder} px-4 py-1.5 flex flex-wrap items-center justify-between gap-4 text-xs ${s.textPrimary} select-none transition-colors duration-300`}>
          <div className="flex items-center gap-4 font-medium">
            <span className={`hover:${s.badgeBg} px-2 py-0.5 rounded cursor-pointer ${s.textMuted}`}>File</span>
            <span className={`font-bold border-b-2 ${theme === "desert" ? "border-[#C05C33] text-[#C05C33]" : theme === "galaxy" ? "border-purple-500 text-purple-450" : theme === "dark" ? "border-emerald-500 text-emerald-400" : "border-[#185abd] text-[#185abd]"} px-2 py-0.5 cursor-pointer`}>Home</span>
            <span className={`hover:${s.badgeBg} px-2 py-0.5 rounded cursor-pointer ${s.textMuted}`}>Insert</span>
            <span className={`hover:${s.badgeBg} px-2 py-0.5 rounded cursor-pointer ${s.textMuted}`}>Design</span>
            <span className={`hover:${s.badgeBg} px-2 py-0.5 rounded cursor-pointer ${s.textMuted}`}>Layout</span>
            <span className={`hover:${s.badgeBg} px-2 py-0.5 rounded cursor-pointer ${s.textMuted}`}>References</span>
            <span className={`hover:${s.badgeBg} px-2 py-0.5 rounded cursor-pointer ${s.textMuted}`}>View</span>
          </div>
          <div className={`flex items-center gap-1.5 text-[10px] ${s.textMuted} font-mono`}>
            <Sparkles size={11} className={theme === "dark" ? "text-emerald-400" : theme === "galaxy" ? "text-fuchsia-450" : theme === "desert" ? "text-[#C05C33]" : "text-emerald-600"} />
            <span>PRISTINE STATIC WORD PREVIEW</span>
          </div>
        </div>

        {/* Quick Style specifications display */}
        <div className={`${s.cardBg} border-b ${s.subBorder} p-2.5 flex flex-wrap items-center gap-6 text-xs ${s.textSecondary} shadow-2xs select-none transition-colors duration-300`}>
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-bold ${s.textMuted} uppercase tracking-wider`}>Font Family:</span>
            <span className={`${s.badgeBg} px-2 py-0.5 rounded font-bold ${s.textPrimary}`}>{wordFont}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-bold ${s.textMuted} uppercase tracking-wider`}>Margins:</span>
            <span className={`${s.badgeBg} px-2 py-0.5 rounded font-bold ${s.textPrimary}`}>1.0 inch (Standard)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-bold ${s.textMuted} uppercase tracking-wider`}>Line Spacing:</span>
            <span className={`${s.badgeBg} px-2 py-0.5 rounded font-bold ${s.textPrimary}`}>1.15 pt</span>
          </div>
          <div className={`text-[10px] ${s.textMuted} italic`}>
            (The page canvas below contains strictly plain text with NO form fields to mimic Microsoft Word output perfectly.)
          </div>
        </div>

        {/* Word Document Canvas & Ruler wrapper */}
        <div className={`${getWordOuterBg()} p-4 md:p-8 flex flex-col items-center gap-8 max-h-[850px] overflow-y-auto relative shadow-inner transition-colors duration-300`}>
          
          {/* Page Horizontal Ruler */}
          <div className={`w-full max-w-4xl ${ds.rulerBg} h-6 flex items-center px-12 text-[9px] font-mono select-none relative shrink-0 transition-colors duration-300`}>
            <span className={`absolute left-[48px] text-[11px] ${s.textMuted} font-bold top-1`}>▼</span>
            <span className={`absolute left-[48px] text-[11px] ${s.textMuted} font-bold top-3`}>▲</span>
            <span className={`absolute right-[48px] text-[11px] ${s.textMuted} font-bold top-3`}>▲</span>
            <div className="flex justify-between w-full opacity-60">
              <span>L 1.0" ────────</span>
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
              <span>6</span>
              <span>7</span>
              <span>8</span>
              <span>──────── R 1.0"</span>
            </div>
          </div>

          {/* =========================================================
              PAGE 1: COVER PAGE PREVIEW (Conditional)
             ========================================================= */}
          {solution.hasCoverPage && (
            <div
              className={`shadow-xl p-10 relative select-text flex flex-col justify-between shrink-0 transition-colors duration-300 ${ds.paper}`}
              style={{
                width: "794px",
                height: "1123px",
                fontFamily: getFontFamily(),
                borderWidth: coverBorder === "none" ? "1px" : (coverBorder === "thin" ? "8px" : "14px"),
                borderStyle: coverBorder === "double" ? "double" : "solid",
                borderColor: coverBorder === "none" ? (theme === "dark" ? "#1e293b" : theme === "galaxy" ? "#1a1638" : theme === "desert" ? "#ded0b6" : "#cbd5e1") : `#${solution.colorTheme.primaryHex}`
              }}
              id="cover-page-sheet"
            >
              {/* Margins indicators */}
              <div className={`absolute top-8 left-8 w-4 h-4 border-t border-l ${ds.border} pointer-events-none select-none`} />
              <div className={`absolute top-8 right-8 w-4 h-4 border-t border-r ${ds.border} pointer-events-none select-none`} />
              <div className={`absolute bottom-8 left-8 w-4 h-4 border-b border-l ${ds.border} pointer-events-none select-none`} />
              <div className={`absolute bottom-8 right-8 w-4 h-4 border-b border-r ${ds.border} pointer-events-none select-none`} />

              {/* Page header */}
              <div className={`text-[10px] ${ds.textMuted} font-mono tracking-widest text-right border-b ${ds.border} pb-2 select-none`}>
                {header.courseCode} SUBMISSION PREVIEW — PAGE 1 OF {totalPages}
              </div>

              {/* Cover Page Body Content */}
              <div className="space-y-12 text-center my-auto">
                <div className="space-y-3">
                  <h1 className={`text-lg md:text-xl font-bold tracking-wider uppercase ${ds.textPrimary} leading-snug`}>
                    {student.university}
                  </h1>
                  <div className={`h-0.5 w-16 mx-auto ${theme === "desert" ? "bg-[#3D2E1F]" : theme === "galaxy" ? "bg-purple-300/40" : theme === "dark" ? "bg-slate-300/40" : "bg-zinc-800"}`} />
                  <h2 className={`text-[11px] font-semibold ${ds.textSecondary} uppercase tracking-widest`}>
                    Department of Computer Science
                  </h2>
                </div>

                <div className="space-y-3">
                  <span className={`text-[9px] font-bold ${ds.textMuted} tracking-widest uppercase ${ds.tableBg} border ${ds.border} px-2.5 py-1 rounded-sm`}>
                    Course Assignment Submission
                  </span>
                  <h1 className="text-2xl font-extrabold tracking-tight mt-2" style={{ color: `#${solution.colorTheme.primaryHex}` }}>
                    ASSIGNMENT NO. {header.assignmentNo}
                  </h1>
                  <p className={`text-xs font-semibold ${ds.textSecondary}`}>
                    COURSE CODE: <span className={`font-mono ${ds.textPrimary}`}>{header.courseCode}</span> — {header.courseName}
                  </p>
                  <p className={`text-[11px] ${ds.textSecondary} italic`}>Semester: {header.semester}</p>
                </div>

                {/* Academic Student Metadata Box */}
                <div className={`max-w-md mx-auto border overflow-hidden shadow-xs ${ds.tableBg} text-left text-[11px] rounded-none`} style={{ borderColor: `#${solution.colorTheme.primaryHex}` }}>
                  <div className="px-3 py-2 font-bold border-b uppercase tracking-wide text-[9px]" style={{ borderColor: `#${solution.colorTheme.primaryHex}`, color: theme !== "light" ? undefined : `#${solution.colorTheme.primaryHex}`, backgroundColor: theme === "dark" ? "#1e293b" : theme === "galaxy" ? "#1b1444" : theme === "desert" ? "#efe1c5" : "#f8fafc" }}>
                    Student Credentials & Academic Metadata
                  </div>
                  <div className={`p-3.5 space-y-2.5 font-mono ${ds.textSecondary}`}>
                    <div className={`flex justify-between border-b ${ds.border}/50 pb-1`}>
                      <span className={ds.textMuted}>Student Name:</span>
                      <span className={`font-bold ${ds.textPrimary}`}>{student.studentName}</span>
                    </div>
                    <div className={`flex justify-between border-b ${ds.border}/50 pb-1`}>
                      <span className={ds.textMuted}>VU Student ID:</span>
                      <span className={`font-bold ${ds.textPrimary}`}>{student.studentId}</span>
                    </div>
                    <div className={`flex justify-between border-b ${ds.border}/50 pb-1`}>
                      <span className={ds.textMuted}>Academic Semester:</span>
                      <span className={`font-bold ${ds.textPrimary}`}>{student.semester}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={ds.textMuted}>Due Date of Submission:</span>
                      <span className={`font-bold ${ds.textPrimary}`}>{header.dueDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Page footer */}
              <div className={`text-[10px] ${ds.textMuted} font-mono text-center pt-3 border-t ${ds.border} select-none`}>
                [ MS WORD PAGE BREAK — CS601 COMPUTER NETWORKS ]
              </div>
            </div>
          )}

          {/* PAGE BREAK SEPARATOR LINE */}
          {solution.hasCoverPage && (hasPage1Active || hasPage2Active) && (
            <div className="w-full flex items-center justify-center py-2 select-none" id="word-page-break-line" style={{ width: "794px" }}>
              <div className={`w-full border-t border-dashed ${ds.border} h-px`} />
              <span className={`mx-4 text-[10px] font-mono ${ds.textMuted} font-semibold whitespace-nowrap ${ds.tableHeaderBg} px-3 py-1 rounded border ${ds.border} uppercase tracking-widest`}>
                📄 Page Break (Cover Page Ends)
              </span>
              <div className={`w-full border-t border-dashed ${ds.border} h-px`} />
            </div>
          )}

          {/* =========================================================
              PAGE 2: REPORT SHEET - PAGE 1 OF ACTUAL ASSIGNMENT
             ========================================================= */}
          {hasPage1Active && (
            <div
              className={`shadow-xl relative select-text flex flex-col justify-between border shrink-0 transition-colors duration-300 ${ds.paper} ${ds.border} ${getPagePaddingClass()}`}
              style={{ width: "794px", height: "1123px", fontFamily: getFontFamily() }}
              id="main-document-sheet-p1"
            >
              {/* Corner Margins Indicators */}
              <div className={`absolute top-8 left-8 w-4 h-4 border-t border-l ${ds.border} pointer-events-none select-none`} />
              <div className={`absolute top-8 right-8 w-4 h-4 border-t border-r ${ds.border} pointer-events-none select-none`} />
              <div className={`absolute bottom-8 left-8 w-4 h-4 border-b border-l ${ds.border} pointer-events-none select-none`} />
              <div className={`absolute bottom-8 right-8 w-4 h-4 border-b border-r ${ds.border} pointer-events-none select-none`} />

              {/* Document Header */}
              <div className={`text-[10px] ${ds.textMuted} font-mono flex justify-between border-b ${ds.border} pb-2 mb-4 select-none`}>
                <span>{header.courseCode}: CS601 Assignment No. {header.assignmentNo}</span>
                <span>Page {solution.hasCoverPage ? "2" : "1"} of {totalPages}</span>
              </div>

              {/* Document Body Area */}
              <div className={`flex-1 overflow-hidden ${getPageSpacingClass()}`}>
                
                {/* Report title details */}
                <div className="space-y-1 select-text">
                  <h1 className={`${wordFont === "TimesNewRoman" || wordFont === "Georgia" ? "text-sm font-bold text-center font-serif" : "text-sm font-bold text-left"} ${ds.textPrimary} transition-colors duration-300`} style={getHeading1Style()}>
                    {header.courseCode}: {header.courseName} — Assignment No. {header.assignmentNo}
                  </h1>
                  <p className={`${wordFont === "TimesNewRoman" || wordFont === "Georgia" ? "text-[10px] italic text-center font-serif" : "text-[10px] font-medium text-left"} ${ds.textSecondary} transition-colors duration-300`}>
                    Semester: {header.semester} | Due Date: {header.dueDate} | Total Marks: {header.totalMarks}
                  </p>
                  <div className={`border-b ${ds.border} pt-1`} />
                </div>

                {/* 1. Introduction section */}
                {isSectionEnabled("intro") && (
                  <div className="space-y-1.5 select-text">
                    <h3 className={getHeading1Class()} style={getHeading1Style()}>
                      1. Introduction & Background Theory
                    </h3>
                    <p className={`${getParagraphClass()} ${ds.textSecondary} transition-colors duration-300`}>
                      {solution.introduction}
                    </p>
                  </div>
                )}

                {/* Text-based Diagram representing MS Word shape tool embedding */}
                {isSectionEnabled("diagram") && (
                  <div className="space-y-1 select-none">
                    <div className={`${ds.tableHeaderBg} border ${ds.border} p-3 flex flex-col items-center justify-center space-y-1.5 transition-colors duration-300`}>
                      <div className="grid grid-cols-2 gap-3 w-full max-w-md text-center text-[10px] font-mono">
                        <div className={`border ${ds.border} ${ds.tableBg} p-2 transition-colors duration-300`}>
                          <p className={`font-bold ${ds.textPrimary}`}>Single Bit Error</p>
                          <p className={`text-[9px] ${ds.textMuted} mt-0.5`}>Only 1 bit flips in transit</p>
                          <div className={`mt-1.5 space-y-0.5 ${ds.textSecondary} leading-none`}>
                            <p>Sent: {renderBinaryWithMismatches("1 0 0 0 0", "1 0 1 0 0", "sent")}</p>
                            <p>Recv: {renderBinaryWithMismatches("1 0 0 0 0", "1 0 1 0 0", "received")}</p>
                          </div>
                        </div>
                        <div className={`border ${ds.border} ${ds.tableBg} p-2 transition-colors duration-300`}>
                          <p className={`font-bold ${ds.textPrimary}`}>Burst Error</p>
                          <p className={`text-[9px] ${ds.textMuted} mt-0.5`}>Multiple bits flip in transit</p>
                          <div className={`mt-1.5 space-y-0.5 ${ds.textSecondary} leading-none`}>
                            <p>Sent: {renderBinaryWithMismatches("1 0 0 0 0", "0 1 0 1 0", "sent")}</p>
                            <p>Recv: {renderBinaryWithMismatches("1 0 0 0 0", "0 1 0 1 0", "received")}</p>
                          </div>
                        </div>
                      </div>
                      <span className={`text-[9px] ${ds.textMuted} italic`}>Figure 1.1: Transmission Channel Vector Comparison Model</span>
                    </div>
                  </div>
                )}

                {/* 2. Question No. 1 */}
                {isSectionEnabled("q1") && (
                  <div className="space-y-2">
                    <div className="space-y-0.5 select-text">
                      <h3 className={getHeading1Class()} style={getHeading1Style()}>
                        {solution.q1Title ?? "Question No. 1"}
                      </h3>
                      <p className={`text-[10px] ${ds.textSecondary} italic`}>
                        {solution.q1Subtitle ?? "Identify the type of error in the given received messages (Single bit error or Burst error) and provide your explanation."}
                      </p>
                    </div>

                    {/* Grid Table Q1 - STRICTLY FLAT TEXT CELLS */}
                    <table className={getTableClass()} style={{ borderColor: theme !== "light" ? "transparent" : undefined }}>
                      <thead>
                        <tr className={getTableHeaderClass()} style={getTableHeaderStyle()}>
                          <th className={`p-2 w-1/4 border ${ds.tableCellBorder} ${ds.textPrimary} text-[10px]`}>{solution.q1ColHeaders?.[0] ?? "Sent Message"}</th>
                          <th className={`p-2 w-1/4 border ${ds.tableCellBorder} ${ds.textPrimary} text-[10px]`}>{solution.q1ColHeaders?.[1] ?? "Received Message"}</th>
                          <th className={`p-2 w-2/4 border ${ds.tableCellBorder} ${ds.textPrimary} text-[10px]`}>{solution.q1ColHeaders?.[2] ?? "Type of Error & Explanation"}</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${ds.border} select-text text-[10px]`}>
                        {solution.q1Data.map((row, idx) => (
                          <tr key={`q1-row-${idx}`}>
                            <td className={`p-1.5 font-mono font-bold ${ds.textPrimary} align-top border ${ds.tableCellBorder}`}>
                              {renderBinaryWithMismatches(row.sentMessage, row.receivedMessage, "sent")}
                            </td>
                            <td className={`p-1.5 font-mono font-bold ${ds.textPrimary} align-top border ${ds.tableCellBorder}`}>
                              {renderBinaryWithMismatches(row.sentMessage, row.receivedMessage, "received")}
                            </td>
                            <td className={`p-1.5 space-y-1 align-top border ${ds.tableCellBorder}`}>
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] font-bold block" style={{ color: theme === "light" ? (row.detectedError === "Single bit error" ? "#0284c7" : "#e11d48") : (row.detectedError === "Single bit error" ? "#34d399" : "#f87171") }}>
                                  {row.detectedError}
                                </span>
                              </div>
                              <p className={`text-[10px] ${ds.textSecondary} leading-snug whitespace-pre-wrap`}>
                                {row.explanation}
                              </p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Document Footer details */}
              <div className={`pt-2 border-t ${ds.border} flex justify-between items-end text-[9px] font-mono ${ds.textMuted} select-none`}>
                <div>
                  <p>AUTHOR: {student.studentName}</p>
                  <p>STUDENT VU ID: {student.studentId}</p>
                </div>
                <p className="text-right">VIRTUAL UNIVERSITY OF PAKISTAN — CS601 SUBMISSION</p>
              </div>
            </div>
          )}

          {/* PAGE BREAK SEPARATOR LINE */}
          {hasPage1Active && hasPage2Active && (
            <div className="w-full flex items-center justify-center py-2 select-none" id="word-page-break-line-2" style={{ width: "794px" }}>
              <div className={`w-full border-t border-dashed ${ds.border} h-px`} />
              <span className={`mx-4 text-[10px] font-mono ${ds.textMuted} font-semibold whitespace-nowrap ${ds.tableHeaderBg} px-3 py-1 rounded border ${ds.border} uppercase tracking-widest`}>
                📄 Page Break (Question 2 & Conclusion Follow)
              </span>
              <div className={`w-full border-t border-dashed ${ds.border} h-px`} />
            </div>
          )}

          {/* =========================================================
              PAGE 3: REPORT SHEET - PAGE 2 OF ACTUAL ASSIGNMENT
             ========================================================= */}
          {hasPage2Active && (
            <div
              className={`shadow-xl relative select-text flex flex-col justify-between border shrink-0 transition-colors duration-300 ${ds.paper} ${ds.border} ${getPagePaddingClass()}`}
              style={{ width: "794px", height: "1123px", fontFamily: getFontFamily() }}
              id="main-document-sheet-p2"
            >
              {/* Corner Margins Indicators */}
              <div className={`absolute top-8 left-8 w-4 h-4 border-t border-l ${ds.border} pointer-events-none select-none`} />
              <div className={`absolute top-8 right-8 w-4 h-4 border-t border-r ${ds.border} pointer-events-none select-none`} />
              <div className={`absolute bottom-8 left-8 w-4 h-4 border-b border-l ${ds.border} pointer-events-none select-none`} />
              <div className={`absolute bottom-8 right-8 w-4 h-4 border-b border-r ${ds.border} pointer-events-none select-none`} />

              {/* Document Header */}
              <div className={`text-[10px] ${ds.textMuted} font-mono flex justify-between border-b ${ds.border} pb-2 mb-4 select-none`}>
                <span>{header.courseCode}: CS601 Assignment No. {header.assignmentNo}</span>
                <span>Page {(solution.hasCoverPage ? 1 : 0) + (hasPage1Active ? 1 : 0) + 1} of {totalPages}</span>
              </div>

              {/* Document Body Area */}
              <div className={`flex-1 overflow-hidden ${getPageSpacingClass()}`}>
                {/* 3. Question No. 2 */}
                {isSectionEnabled("q2") && (
                  <div className="space-y-4">
                    <div className="space-y-1 select-text">
                      <h3 className={getHeading1Class()} style={getHeading1Style()}>
                        {solution.q2Title ?? "Question No. 2"}
                      </h3>
                      <p className={`text-[11px] ${ds.textSecondary} italic`}>
                        {solution.q2Subtitle ?? "Complete the missing minimum Hamming distance value using the block code theorem formula:"}
                      </p>
                      <div className="flex justify-center py-2 select-none">
                        <div className={`${ds.tableHeaderBg} px-4 py-1.5 border ${ds.border} font-mono ${ds.textPrimary} font-bold text-[11px] transition-colors duration-300 shadow-3xs`}>
                          d<sub>min</sub> = 2t + 1
                        </div>
                      </div>
                    </div>

                    {/* Grid Table Q2 - STRICTLY FLAT TEXT CELLS */}
                    <table className={getTableClass()} style={{ borderColor: theme !== "light" ? "transparent" : undefined }}>
                      <thead>
                        <tr className={getTableHeaderClass()} style={getTableHeaderStyle()}>
                          <th className={`p-3 text-center w-1/2 border ${ds.tableCellBorder} ${ds.textPrimary} text-[11px]`}>{solution.q2ColHeaders?.[0] ?? "Number of bits to be corrected (t)"}</th>
                          <th className={`p-3 text-center w-1/2 border ${ds.tableCellBorder} ${ds.textPrimary} text-[11px]`}>{solution.q2ColHeaders?.[1] ?? "Minimum Hamming distance (d_min)"}</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${ds.border} text-center select-text text-[11px]`}>
                        {solution.q2Data.map((row, idx) => (
                          <tr key={`q2-row-${idx}`}>
                            <td className={getTableCellClass(idx)}>
                              {row.bitsCorrected} bits
                            </td>
                            <td className={getTableCellClass(idx)}>
                              <span className={`font-semibold ${ds.textPrimary}`}>
                                d<sub>min</sub> = <span className="font-extrabold" style={{ color: theme === "light" ? `#${solution.colorTheme.primaryHex}` : undefined }}>{row.minHammingDistance}</span>
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 4. Conclusion Section */}
                {isSectionEnabled("conclusion") && (
                  <div className="space-y-2 select-text">
                    <h3 className={getHeading1Class()} style={getHeading1Style()}>
                      2. Conclusion & Integrity Declaration
                    </h3>
                    <p className={`${getParagraphClass()} ${ds.textSecondary} transition-colors duration-300`}>
                      {solution.conclusion}
                    </p>
                  </div>
                )}
              </div>

              {/* Document Footer Signature details */}
              <div className={`pt-4 border-t ${ds.border} flex justify-between items-end text-[9px] font-mono ${ds.textMuted} select-none`}>
                <div>
                  <p>AUTHOR: {student.studentName}</p>
                  <p>STUDENT VU ID: {student.studentId}</p>
                </div>
                <p className="text-right">VIRTUAL UNIVERSITY OF PAKISTAN — CS601 SUBMISSION</p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Microsoft Word Status Bar */}
        <div className="bg-[#185abd] text-white px-4 py-2 flex items-center justify-between text-[11px] select-none shrink-0 border-t border-zinc-200">
          <div className="flex items-center gap-4">
            <span>Pages: {totalPages}</span>
            <span>Words: {calculateWordCount()}</span>
            <span>English (United States)</span>
            <span className="text-white/60 hidden sm:inline">♿ Accessibility: Perfect</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="cursor-pointer hover:text-white/80 hidden md:inline" title="Read Mode">📖 Read Mode</span>
            <span className="font-bold underline cursor-pointer" title="Print Layout">🖨️ Print Layout</span>
            <span className="cursor-pointer hover:text-white/80 hidden md:inline" title="Web Layout">🌐 Web Layout</span>
            <span className="hidden sm:inline">|</span>
            <div className="flex items-center gap-1.5">
              <span>─</span>
              <span className="bg-white/20 px-1.5 py-0.5 rounded font-mono font-bold text-[10px]">100%</span>
              <span>┼</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
