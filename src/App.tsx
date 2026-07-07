import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { solutionsData, defaultStudentInfo, defaultAssignmentHeader } from "./solutionsData";
import { AssignmentSolution, StudentInfo, AssignmentHeader } from "./types";
import SolutionPreview from "./components/SolutionPreview";
import InteractiveSimulations from "./components/InteractiveSimulations";
import ToDoChecklist from "./components/ToDoChecklist";
import { 
  BookOpen, 
  FileSpreadsheet, 
  Activity, 
  CheckSquare, 
  Info, 
  ShieldCheck, 
  Award, 
  GraduationCap, 
  Sun, 
  Moon, 
  Sparkles, 
  Compass,
  Github,
  PanelLeftClose,
  PanelLeftOpen,
  Network
} from "lucide-react";
import { ThemeMode, themes } from "./utils/theme";

export default function App() {
  // State for the 10 custom templates
  const [solutions, setSolutions] = useState<AssignmentSolution[]>(solutionsData);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [studentInfo, setStudentInfo] = useState<StudentInfo>(defaultStudentInfo);
  const [assignmentHeader, setAssignmentHeader] = useState<AssignmentHeader>(defaultAssignmentHeader);

  // Active workspace tab state
  const [activeTab, setActiveTab] = useState<"document" | "simulators" | "checklist">("document");

  // Sidebar visibility state
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Theme state initialized to a random theme on app load, making the day (light) theme least prior
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem("app-theme");
    return (saved as ThemeMode) || "desert";
  });

  useEffect(() => {
    localStorage.setItem("app-theme", themeMode);
  }, [themeMode]);

  const s = themes[themeMode];
  const currentSolution = solutions[selectedIdx];

  // Handler to update active solution inside list
  const handleUpdateActiveSolution = (updatedSol: AssignmentSolution) => {
    const updatedList = [...solutions];
    updatedList[selectedIdx] = updatedSol;
    setSolutions(updatedList);
  };

  // Reset the active solution variant back to default textbook values
  const handleResetActiveSolution = () => {
    const updatedList = [...solutions];
    updatedList[selectedIdx] = JSON.parse(JSON.stringify(solutionsData[selectedIdx]));
    setSolutions(updatedList);
  };

  // Active button color classes depending on selected theme
  const getActiveBtnClass = () => {
    switch (themeMode) {
      case "dark":
        return "bg-emerald-600 border-emerald-600 text-white shadow-sm font-semibold";
      case "galaxy":
        return "bg-purple-700 border-purple-700 text-white shadow-sm font-semibold";
      case "desert":
        return "bg-[#C05C33] border-[#C05C33] text-white shadow-sm font-semibold";
      default:
        return "bg-zinc-900 border-zinc-900 text-white shadow-sm font-semibold";
    }
  };

  return (
    <div className={`min-h-screen ${s.appBg} flex flex-col font-sans transition-colors duration-300`} id="app-root">
      {/* Crafted By Signature */}
      <motion.div 
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
        className="fixed bottom-14 right-6 z-50 pointer-events-none"
      >
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border ${s.subBorder} shadow-2xl`} style={{ backgroundColor: themeMode === 'light' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(15, 15, 15, 0.6)' }}>
          <Sparkles size={12} className={themeMode === "desert" ? "text-[#C05C33]" : themeMode === "galaxy" ? "text-fuchsia-400" : themeMode === "dark" ? "text-emerald-400" : "text-zinc-900"} />
          <span className={`text-[10px] font-bold uppercase tracking-widest ${s.textPrimary}`}>
            Crafted by MUHIUM
          </span>
        </div>
      </motion.div>

      {/* Top Navigation Bar in clean minimalist style */}
      <header className={`h-16 border-b ${s.headerBorder} ${s.headerBg} px-6 flex items-center justify-between transition-colors duration-300`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-lg border ${s.subBorder} ${s.subBg} ${s.textPrimary} hover:opacity-80 transition-all cursor-pointer flex items-center justify-center`}
            title={sidebarOpen ? "Hide Sidebar Selector" : "Show Sidebar Selector"}
            id="sidebar-toggle-button"
          >
            {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
          </button>
          <div className="flex relative items-center justify-center cursor-pointer">
            <motion.div 
              animate={{ rotate: 360, borderRadius: ["10%", "50%", "10%"] }}
              transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
              className={`w-10 h-10 flex items-center justify-center text-white shadow-lg bg-gradient-to-br ${
                themeMode === "desert" ? "from-[#D87040] to-[#A04520]" : 
                themeMode === "galaxy" ? "from-purple-600 to-indigo-900" : 
                themeMode === "dark" ? "from-emerald-500 to-teal-800" : 
                "from-zinc-800 to-zinc-950"
              }`}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                <Network size={22} className="drop-shadow-md" strokeWidth={2.5} />
              </motion.div>
            </motion.div>
            <motion.div 
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.7, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 ${s.headerBg} flex items-center justify-center ${
                themeMode === "desert" ? "bg-amber-400" : 
                themeMode === "galaxy" ? "bg-fuchsia-400" : 
                themeMode === "dark" ? "bg-emerald-400" : 
                "bg-blue-500"
              }`} 
            />
          </div>
          <div>
            <h1 className={`text-sm font-bold tracking-tight ${s.headerText} flex items-center gap-2`}>
              ASSIGNMENT QUORUM <span className={`${s.badgeBg} text-[9px] px-2 py-0.5 rounded border ${s.subBorder} font-bold tracking-widest`}>v2.4</span>
            </h1>
            <p className={`text-[9px] ${s.textMuted} uppercase tracking-widest font-medium`}>
              CS601: Data Communication Solution Suite
            </p>
          </div>
        </div>

        {/* Theme Swapper and submission details */}
        <div className="flex items-center gap-6">
          {/* THEME SWITCHER */}
          <div className={`flex items-center gap-1 ${s.tabBarBg} p-1 rounded-lg transition-colors duration-300`}>
            <button
              onClick={() => setThemeMode("light")}
              className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded uppercase tracking-wider transition-all cursor-pointer ${
                themeMode === "light"
                  ? "bg-white text-zinc-950 shadow-xs border border-zinc-200/50"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
              title="Light Mode"
            >
              <Sun size={12} />
              <span className="hidden md:inline">Light</span>
            </button>
            <button
              onClick={() => setThemeMode("dark")}
              className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded uppercase tracking-wider transition-all cursor-pointer ${
                themeMode === "dark"
                  ? "bg-zinc-800 text-emerald-400 shadow-md border border-zinc-700"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
              title="Dark Mode"
            >
              <Moon size={12} />
              <span className="hidden md:inline">Dark</span>
            </button>
            <button
              onClick={() => setThemeMode("galaxy")}
              className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded uppercase tracking-wider transition-all cursor-pointer ${
                themeMode === "galaxy"
                  ? "bg-[#1e1742] text-fuchsia-400 shadow-md border border-purple-800/60"
                  : "text-indigo-400 hover:text-indigo-200"
              }`}
              title="Galaxy Mode"
            >
              <Sparkles size={12} />
              <span className="hidden md:inline">Galaxy</span>
            </button>
            <button
              onClick={() => setThemeMode("desert")}
              className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded uppercase tracking-wider transition-all cursor-pointer ${
                themeMode === "desert"
                  ? "bg-[#FAF6F0] text-[#C05C33] shadow-md border border-[#E6D5C3]"
                  : "text-[#8D6E63] hover:text-[#5D4037]"
              }`}
              title="Desert Premium"
            >
              <Compass size={12} />
              <span className="hidden md:inline">Desert</span>
            </button>
          </div>

          <div className="hidden sm:flex flex-col items-end">
            <span className={`text-[9px] ${s.textMuted} font-bold uppercase tracking-wider`}>Submission Deadline</span>
            <span className={`text-xs font-mono ${s.textSecondary} font-medium`}>8 JUL 2026 | 23:59 GMT</span>
          </div>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: 10 Unique Solutions Selector Panel (4 cols) */}
        {sidebarOpen && (
          <div className="lg:col-span-4 flex flex-col gap-4 animate-fade-in">
            <div className={`${s.cardBg} border ${s.cardBorder} rounded-xl p-5 space-y-4 flex-1 flex flex-col justify-between transition-colors duration-300`}>
              <div>
                <div className={`flex items-center gap-2 pb-3 border-b ${s.borderLight} mb-3`}>
                  <Award className={`${themeMode === "desert" ? "text-[#C05C33]" : themeMode === "galaxy" ? "text-fuchsia-400" : themeMode === "dark" ? "text-emerald-400" : "text-zinc-900"} shrink-0`} size={18} />
                  <h2 className={`text-xs font-bold uppercase tracking-wider ${s.textPrimary}`}>
                    Select Solution Variant (1 to 10)
                  </h2>
                </div>
                <p className={`text-xs ${s.textSecondary} leading-relaxed mb-4`}>
                  Choose from 10 non-plagiarized variations. Each incorporates unique academic vocabulary, structure patterns, and layout designs to ensure total originality.
                </p>

                {/* Scrollable solutions menu */}
                <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
                  {solutions.map((sol, index) => {
                    const isSelected = index === selectedIdx;
                    return (
                      <button
                        key={`sol-card-${sol.id}`}
                        onClick={() => setSelectedIdx(index)}
                        className={`w-full text-left p-3.5 rounded-lg border transition-all flex justify-between items-center cursor-pointer ${
                          isSelected
                            ? getActiveBtnClass()
                            : `${s.cardBg} hover:${s.subBg} ${s.cardBorder} ${s.textSecondary}`
                        }`}
                      >
                        <div className="space-y-1 truncate pr-3">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              isSelected ? s.activeBadgeBg : s.badgeBg
                            }`}>
                              v{String(index + 1).padStart(2, '0')}
                            </span>
                            <span className="font-bold text-xs truncate">{sol.title}</span>
                          </div>
                          <p className={`text-[10px] ${isSelected ? "text-white/80" : s.textMuted}`}>
                            Theme: {sol.styleName} | {sol.hasCoverPage ? "Cover" : "No Cover"}
                          </p>
                        </div>
                        
                        <span className={`w-2 h-2 rounded-full ${
                          isSelected ? "bg-white" : s.textMuted
                        }`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Student details editor inside selection sidebar */}
              <div className={`${s.subBg} rounded-xl p-4 border ${s.subBorder} space-y-3 mt-4 text-xs transition-colors duration-300`}>
                <h4 className={`font-bold ${s.textPrimary} flex items-center gap-1.5 uppercase tracking-wider text-[10px] border-b ${s.borderLight} pb-1.5`}>
                  <GraduationCap size={14} className={themeMode === "desert" ? "text-[#C05C33]" : themeMode === "galaxy" ? "text-fuchsia-400" : themeMode === "dark" ? "text-emerald-400" : "text-zinc-900"} /> Global Student Credentials
                </h4>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className={`text-[9px] font-bold uppercase tracking-wider ${s.textMuted} block`}>Student Name</label>
                    <input
                      type="text"
                      value={studentInfo.studentName}
                      onChange={(e) => setStudentInfo({ ...studentInfo, studentName: e.target.value })}
                      placeholder="Enter Student Name"
                      className={`w-full text-xs px-2 py-1 ${s.inputBg} border ${s.inputBorder} ${s.inputText} rounded outline-none font-mono font-bold transition-all`}
                      id="sidebar-student-name"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={`text-[9px] font-bold uppercase tracking-wider ${s.textMuted} block`}>VU Student ID</label>
                    <input
                      type="text"
                      value={studentInfo.studentId}
                      onChange={(e) => setStudentInfo({ ...studentInfo, studentId: e.target.value })}
                      placeholder="e.g. BC210400001"
                      className={`w-full text-xs px-2 py-1 ${s.inputBg} border ${s.inputBorder} ${s.inputText} rounded outline-none font-mono font-bold transition-all`}
                      id="sidebar-student-id"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={`text-[9px] font-bold uppercase tracking-wider ${s.textMuted} block`}>Academic Semester</label>
                    <input
                      type="text"
                      value={studentInfo.semester}
                      onChange={(e) => setStudentInfo({ ...studentInfo, semester: e.target.value })}
                      placeholder="e.g. Fall 2021"
                      className={`w-full text-xs px-2 py-1 ${s.inputBg} border ${s.inputBorder} ${s.inputText} rounded outline-none font-mono font-bold transition-all`}
                      id="sidebar-student-semester"
                    />
                  </div>
                </div>
                <p className={`text-[9px] ${s.textMuted} italic leading-snug`}>
                  Updating these fields immediately syncs across all 10 assignment variants and the downloadable Word file (.docx).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* RIGHT COLUMN: Interactive Workspaces & Tabbed Views (8 or 12 cols) */}
        <div className={`${sidebarOpen ? "lg:col-span-8" : "lg:col-span-12"} flex flex-col gap-6 transition-all duration-300`}>
          
          {/* Main Workspace Navigation Tabs */}
          <div className={`grid grid-cols-1 sm:grid-cols-3 ${s.tabBarBg} p-1 rounded-lg gap-1 transition-colors duration-300`}>
            <button
              onClick={() => setActiveTab("document")}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 text-xs font-bold rounded transition-all cursor-pointer ${
                activeTab === "document"
                  ? s.tabActiveBg
                  : s.tabInactiveText
              }`}
              id="workspace-tab-document"
            >
              <FileSpreadsheet size={13} className="shrink-0" />
              <span className="truncate">Word Workspace</span>
            </button>
            <button
              onClick={() => setActiveTab("simulators")}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 text-xs font-bold rounded transition-all cursor-pointer ${
                activeTab === "simulators"
                  ? s.tabActiveBg
                  : s.tabInactiveText
              }`}
              id="workspace-tab-simulators"
            >
              <Activity size={13} className="shrink-0" />
              <span className="truncate">Simulators</span>
            </button>
            <button
              onClick={() => setActiveTab("checklist")}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 text-xs font-bold rounded transition-all cursor-pointer ${
                activeTab === "checklist"
                  ? s.tabActiveBg
                  : s.tabInactiveText
              }`}
              id="workspace-tab-checklist"
            >
              <CheckSquare size={13} className="shrink-0" />
              <span className="truncate">VU Checklist</span>
            </button>
          </div>

          {/* Active Workspace Viewport */}
          <div className="flex-1">
            {activeTab === "document" && (
              <SolutionPreview
                solution={currentSolution}
                onChangeSolution={handleUpdateActiveSolution}
                student={studentInfo}
                onChangeStudent={setStudentInfo}
                header={assignmentHeader}
                onChangeHeader={setAssignmentHeader}
                onResetSolution={handleResetActiveSolution}
                theme={themeMode}
              />
            )}

            {activeTab === "simulators" && (
              <InteractiveSimulations theme={themeMode} />
            )}

            {activeTab === "checklist" && (
              <ToDoChecklist theme={themeMode} />
            )}
          </div>

        </div>

      </main>

      {/* Footer Status Bar */}
      <footer className={`h-10 border-t ${s.headerBorder} ${s.headerBg} px-6 flex items-center justify-between text-[9px] font-mono ${s.textMuted} transition-colors duration-300`}>
        <div className="flex gap-4">
          <span>MODE: ACADEMIC_AUTONOMY</span>
          <span>DOCX_ENGINE: ACTIVE</span>
        </div>
        <div className="flex gap-4">
          <span className={themeMode === "desert" ? "text-[#C05C33]" : themeMode === "galaxy" ? "text-fuchsia-400" : themeMode === "dark" ? "text-emerald-400" : "text-zinc-600"}>● 100% VERIFIED ACADEMIC GENERATOR</span>
          <span>MEM_USAGE: 384MB</span>
        </div>
      </footer>
    </div>
  );
}
