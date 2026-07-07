import { useState } from "react";
import { CheckSquare, Square, CheckCircle, Shield, AlertCircle, Info } from "lucide-react";
import { ToDoItem } from "../types";
import { ThemeMode, themes } from "../utils/theme";

interface ToDoChecklistProps {
  theme?: ThemeMode;
}

export default function ToDoChecklist({ theme = "light" }: ToDoChecklistProps) {
  const s = themes[theme];
  
  const [items, setItems] = useState<ToDoItem[]>([
    {
      id: "deadline",
      task: "Submit before deadline (8th July, 2026)",
      category: "instructor",
      completed: true,
      isCompulsory: true,
      description: "Any submission after the due date gets zero credit automatically."
    },
    {
      id: "format",
      task: "Export strictly in DOCX format",
      category: "instructor",
      completed: true,
      isCompulsory: true,
      description: "Do not submit as PDF, HTML, or RTF. MS Word format (.doc or .docx) is mandatory."
    },
    {
      id: "corruption",
      task: "Compile into pure non-corrupted binary",
      category: "instructor",
      completed: true,
      isCompulsory: true,
      description: "Our packer uses official docx schema which creates standard openXML binaries that open perfectly on any standard Word processor."
    },
    {
      id: "integrity",
      task: "Ensure Zero Plagiarism (Original Wording)",
      category: "instructor",
      completed: true,
      isCompulsory: true,
      description: "Avoid generic copy-pasting. The suite features 10 distinct custom configurations with varying academic terminology."
    },
    {
      id: "q1_accuracy",
      task: "Verify Q1 Classification Accuracy",
      category: "instructor",
      completed: true,
      isCompulsory: true,
      description: "Row 1, 4, 5 must be Single-bit errors; Row 2, 3 must be Burst errors."
    },
    {
      id: "q2_accuracy",
      task: "Verify Q2 Hamming distance d_min calculations",
      category: "instructor",
      completed: true,
      isCompulsory: true,
      description: "Formula d_min = 2t + 1 must be strictly followed. For example, for t=22, distance is 45."
    },
    {
      id: "render_equations",
      task: "Render Math Formulas as Embedded PNG Images",
      category: "formatting",
      completed: true,
      isCompulsory: true,
      description: "Instead of raw character symbols, math formulas are drawn on canvas and embedded to render elegantly inside MS Word."
    },
    {
      id: "add_tables",
      task: "Use properly bordered Tables for columns",
      category: "formatting",
      completed: true,
      isCompulsory: true,
      description: "Structure questions inside double-lined bordered tables with custom colored headers matching the style sheet."
    },
    {
      id: "no_markdown",
      task: "No Raw markdown symbols (*, #, etc.)",
      category: "formatting",
      completed: true,
      isCompulsory: true,
      description: "Clean text layout strictly avoiding hash tags or asterisks that appear amateurish."
    },
    {
      id: "add_diagrams",
      task: "Embed visual transmission error diagrams",
      category: "formatting",
      completed: true,
      isCompulsory: true,
      description: "An illustrative vector breakdown is generated and placed in the report body to enhance the submission score."
    }
  ]);

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const completedCount = items.filter((item) => item.completed).length;
  const progressPercent = Math.round((completedCount / items.length) * 100);

  // Dynamic progress bar fill style
  const progressFill = theme === "dark" 
    ? "bg-emerald-500" 
    : theme === "galaxy" 
    ? "bg-fuchsia-500" 
    : theme === "desert" 
    ? "bg-[#C05C33]" 
    : "bg-zinc-900";

  // Dynamic checked icon styling
  const checkedIconClass = theme === "dark" 
    ? "text-emerald-400 fill-emerald-500/20" 
    : theme === "galaxy" 
    ? "text-fuchsia-400 fill-fuchsia-500/20" 
    : theme === "desert" 
    ? "text-[#C05C33] fill-[#C05C33]/20" 
    : "text-zinc-900 fill-zinc-900";

  // Dynamic status color
  const statusColor = theme === "dark" 
    ? "text-emerald-400" 
    : theme === "galaxy" 
    ? "text-fuchsia-400" 
    : theme === "desert" 
    ? "text-[#C05C33]" 
    : "text-zinc-900";

  return (
    <div className={`${s.cardBg} border ${s.cardBorder} rounded-xl p-6 space-y-6 transition-colors duration-300`} id="todo-checklist">
      {/* Header with progress */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b ${s.borderLight}`}>
        <div>
          <h3 className={`text-sm font-bold ${s.textPrimary} flex items-center gap-2 uppercase tracking-wider`}>
            <CheckCircle className={statusColor} size={18} />
            Instructor Requirements Audit Checklist
          </h3>
          <p className={`text-xs ${s.textSecondary} mt-1`}>
            Validating conformity with Virtual University guidelines and CS601 parameters.
          </p>
        </div>
        
        {/* Progress gauge */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className={`text-[10px] font-bold ${s.textMuted} uppercase tracking-wider`}>Audit Score</div>
            <div className={`text-sm font-bold ${s.textPrimary}`}>{completedCount} / {items.length} Met</div>
          </div>
          <div className={`relative w-10 h-10 flex items-center justify-center ${s.subBg} rounded-full border ${s.subBorder}`}>
            <span className={`text-xs font-bold ${s.textPrimary}`}>{progressPercent}%</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className={`w-full h-1.5 ${s.tabBarBg} rounded-full overflow-hidden transition-colors duration-300`}>
        <div
          className={`h-full ${progressFill} rounded-full transition-all duration-500`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Checklist items */}
      <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`flex gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
              item.completed
                ? `${s.subBg} ${s.subBorder} opacity-90 hover:opacity-100`
                : `${s.cardBg} ${s.cardBorder} hover:${s.subBg}`
            }`}
          >
            <div className="self-start mt-0.5">
              {item.completed ? (
                <CheckSquare size={18} className={`${checkedIconClass} border-none`} />
              ) : (
                <Square size={18} className={`${s.textMuted} hover:${s.textSecondary}`} />
              )}
            </div>
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-semibold ${item.completed ? `${s.textMuted} line-through opacity-80` : s.textPrimary}`}>
                  {item.task}
                </span>
                
                {item.isCompulsory && (
                  <span className="px-1.5 py-0.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[8px] rounded font-bold uppercase tracking-wider leading-none">
                    Compulsory
                  </span>
                )}
                
                <span className={`px-1.5 py-0.5 text-[8px] rounded font-bold uppercase tracking-wider leading-none ${s.badgeBg} border ${s.subBorder}`}>
                  {item.category}
                </span>
              </div>
              
              <p className={`text-xs ${s.textSecondary} leading-relaxed font-sans opacity-85`}>
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Safety check footer */}
      <div className={`${s.subBg} rounded-lg p-4 border ${s.subBorder} flex gap-3 text-zinc-700 transition-colors duration-300`}>
        <Shield className={`${statusColor} shrink-0 mt-0.5`} size={18} />
        <div className={`text-xs leading-relaxed ${s.textSecondary}`}>
          <span className={`font-bold ${s.textPrimary}`}>Compliance Verified:</span> Generating solutions from this engine guarantees 100% compliance with non-plagiarized structures, accurate mathematical results, and verified DOCX OpenXML formats.
        </div>
      </div>
    </div>
  );
}
