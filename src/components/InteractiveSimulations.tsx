import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, RotateCcw, ShieldCheck, HelpCircle, Activity, Radio, ScanLine, AlertTriangle, Network, ChevronRight, ActivitySquare, Settings2 } from "lucide-react";
import { ThemeMode, themes } from "../utils/theme";

interface InteractiveSimulationsProps {
  theme?: ThemeMode;
}

interface SimulatorProps {
  theme: ThemeMode;
}

export default function InteractiveSimulations({ theme = "light" }: InteractiveSimulationsProps) {
  const s = themes[theme];
  const [activeSim, setActiveSim] = useState<"error" | "hamming">("error");

  const getSimActiveTabStyle = (tab: "error" | "hamming") => {
    const isActive = activeSim === tab;
    if (!isActive) {
      return `border-transparent ${s.textMuted} hover:${s.textSecondary} hover:${s.subBg} flex-1 py-4 px-6 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2`;
    }
    switch (theme) {
      case "dark":
        return "border-emerald-500 text-emerald-400 bg-[#161f30] flex-1 py-4 px-6 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2";
      case "galaxy":
        return "border-fuchsia-500 text-fuchsia-400 bg-[#130f2b]/90 flex-1 py-4 px-6 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2";
      case "desert":
        return "border-[#C05C33] text-[#C05C33] bg-[#FAF6F0] flex-1 py-4 px-6 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2";
      default:
        return "border-zinc-900 text-zinc-900 bg-white flex-1 py-4 px-6 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2";
    }
  };

  return (
    <div className={`${s.cardBg} border ${s.cardBorder} rounded-xl shadow-2xl overflow-hidden transition-colors duration-300 relative`} id="simulations-container">
      {/* Decorative backdrop elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-20">
        <div className={`absolute top-[-50%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] ${theme === 'dark' ? 'from-emerald-900/20 via-transparent to-transparent' : theme === 'galaxy' ? 'from-fuchsia-900/20 via-transparent to-transparent' : theme === 'desert' ? 'from-amber-900/10 via-transparent to-transparent' : 'from-zinc-300/30 via-transparent to-transparent'} blur-3xl`} />
      </div>

      <div className={`flex border-b ${s.borderLight} ${s.subBg} transition-colors duration-300 relative z-10`}>
        <button onClick={() => setActiveSim("error")} className={getSimActiveTabStyle("error")} id="tab-error-sim">
          <Activity size={16} className={activeSim === "error" ? "animate-pulse" : ""} />
          1. Transmission Error Animator
        </button>
        <button onClick={() => setActiveSim("hamming")} className={getSimActiveTabStyle("hamming")} id="tab-hamming-sim">
          <Network size={16} className={activeSim === "hamming" ? "animate-pulse" : ""} />
          2. Hamming Sphere Visualizer
        </button>
      </div>
      <div className="p-6 md:p-8 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSim}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.3 }}
          >
            {activeSim === "error" ? <ErrorClassifierSimulator theme={theme} /> : <HammingSphereSimulator theme={theme} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function ErrorClassifierSimulator({ theme }: SimulatorProps) {
  const s = themes[theme];
  const [sentMsg, setSentMsg] = useState("1111000100111011");
  const [recvMsg, setRecvMsg] = useState("1010000000111011");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [mismatches, setMismatches] = useState<number[]>([]);
  const [binaryLength, setBinaryLength] = useState(sentMsg.length);

  useEffect(() => {
    if (recvMsg.length !== sentMsg.length) {
      if (recvMsg.length < sentMsg.length) setRecvMsg(recvMsg + sentMsg.slice(recvMsg.length));
      else setRecvMsg(recvMsg.slice(0, sentMsg.length));
    }
    setBinaryLength(sentMsg.length);
    resetSimulation();
  }, [sentMsg]);

  useEffect(() => {
    if (sentMsg.length !== recvMsg.length) {
      if (sentMsg.length < recvMsg.length) setSentMsg(sentMsg + recvMsg.slice(sentMsg.length));
      else setSentMsg(sentMsg.slice(0, recvMsg.length));
    }
    setBinaryLength(recvMsg.length);
    resetSimulation();
  }, [recvMsg]);

  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      if (currentIdx < binaryLength - 1) {
        interval = setInterval(() => {
          setCurrentIdx((prev) => {
            const next = prev + 1;
            if (sentMsg[next] !== recvMsg[next]) {
              setMismatches((prevMis) => [...prevMis, next]);
            }
            return next;
          });
        }, 120);
      } else {
        setIsPlaying(false);
      }
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentIdx, binaryLength, sentMsg, recvMsg]);

  const startSimulation = () => { setMismatches([]); setCurrentIdx(-1); setIsPlaying(true); };
  const resetSimulation = () => { setMismatches([]); setCurrentIdx(-1); setIsPlaying(false); };

  const realTimeMismatches: number[] = [];
  const minLength = Math.min(sentMsg.length, recvMsg.length);
  for (let i = 0; i < minLength; i++) {
    if (sentMsg[i] !== recvMsg[i]) realTimeMismatches.push(i);
  }
  const totalErrors = realTimeMismatches.length;
  let classification = "No Errors Detected";
  let explanation = "The received bit stream matches the sent bit stream perfectly.";
  
  if (totalErrors === 1) {
    classification = "Single Bit Error";
    explanation = `Exactly one bit has been modified during transmission (at bit position ${realTimeMismatches[0] + 1}). This represents a single-bit error, usually caused by random noise spikes.`;
  } else if (totalErrors > 1) {
    classification = "Burst Error";
    explanation = `${totalErrors} bits have been modified in this block (at positions: ${realTimeMismatches.map(i => i+1).join(", ")}). This represents a burst error, typical of electromagnetic interference or long noise bursts.`;
  }

  const handleFlipBit = (type: "sent" | "recv", index: number) => {
    const target = type === "sent" ? sentMsg : recvMsg;
    const flipped = target[index] === "1" ? "0" : "1";
    const result = target.substring(0, index) + flipped + target.substring(index + 1);
    if (type === "sent") setSentMsg(result);
    else setRecvMsg(result);
  };

  const themeColors = {
    dark: { primary: "emerald-500", glow: "shadow-emerald-500/50" },
    galaxy: { primary: "fuchsia-500", glow: "shadow-fuchsia-500/50" },
    desert: { primary: "[#C05C33]", glow: "shadow-[#C05C33]/50" },
    light: { primary: "zinc-900", glow: "shadow-zinc-900/50" }
  };
  const c = themeColors[theme as keyof typeof themeColors] || themeColors.light;

  return (
    <div className="space-y-8" id="error-classifier-sim">
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-xl font-bold ${s.textPrimary} flex items-center gap-2 tracking-tight`}>
            <Radio size={24} className={`text-${c.primary}`} />
            Transmission Error Animator
          </h3>
          <p className={`text-xs ${s.textSecondary} mt-1 opacity-80 uppercase tracking-wider font-semibold`}>
            Real-time channel receiver scanning process
          </p>
        </div>
        <div className={`px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase tracking-widest border ${s.subBorder} ${s.subBg} shadow-sm flex items-center gap-2`}>
          BER (Bit Error Rate): <span className={`text-${c.primary}`}>{(totalErrors / binaryLength || 0).toFixed(2)}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className={`text-[10px] font-bold ${s.textMuted} self-center mr-2 uppercase tracking-wider flex items-center gap-1`}><ScanLine size={12}/> Presets:</span>
        {[
          { label: "Q1.1 (Single)", s: "1111011111101101", r: "1111011111101111" },
          { label: "Q1.2 (Burst)", s: "1111000100111011", r: "1010000000111011" },
          { label: "Q1.4 (Single)", s: "1000110001000110", r: "1000110001010110" },
        ].map((p, i) => (
          <button key={i} onClick={() => { setSentMsg(p.s); setRecvMsg(p.r); }} className={`px-4 py-1.5 ${s.subBg} hover:${s.tabBarBg} ${s.textPrimary} border ${s.subBorder} text-[10px] rounded-full font-bold transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer`}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        <div>
          <label className={`block text-[10px] font-bold ${s.textMuted} uppercase tracking-wider mb-2 flex items-center gap-1`}><ChevronRight size={12} /> Sent Message</label>
          <input type="text" value={sentMsg} onChange={(e) => setSentMsg(e.target.value.replace(/[^01]/g, ""))} className={`w-full font-mono text-sm tracking-[0.2em] px-4 py-3 ${s.inputBg} border ${s.inputBorder} ${s.inputText} rounded-xl outline-none focus:ring-2 focus:ring-${c.primary} transition-all shadow-inner`} />
        </div>
        <div>
          <label className={`block text-[10px] font-bold ${s.textMuted} uppercase tracking-wider mb-2 flex items-center gap-1`}><ChevronRight size={12} /> Received Message</label>
          <input type="text" value={recvMsg} onChange={(e) => setRecvMsg(e.target.value.replace(/[^01]/g, ""))} className={`w-full font-mono text-sm tracking-[0.2em] px-4 py-3 ${s.inputBg} border ${s.inputBorder} ${s.inputText} rounded-xl outline-none focus:ring-2 focus:ring-${c.primary} transition-all shadow-inner`} />
        </div>
      </div>

      <div className={`${s.subBg} rounded-2xl p-6 md:p-8 ${s.textSecondary} space-y-8 relative overflow-hidden border ${s.subBorder} shadow-lg transition-colors duration-300`}>
        <div className="flex justify-between items-center border-b border-zinc-500/20 pb-4">
          <div className="flex space-x-2">
            <span className={`w-3 h-3 rounded-full bg-rose-500/80 shadow-sm`} />
            <span className={`w-3 h-3 rounded-full bg-amber-500/80 shadow-sm`} />
            <span className={`w-3 h-3 rounded-full bg-emerald-500/80 shadow-sm`} />
          </div>
          <div className={`text-[10px] font-mono ${s.textMuted} uppercase tracking-widest flex items-center gap-2`}>
            <ActivitySquare size={14} className={`text-${c.primary} animate-pulse`} />
            OPTICAL SCANNER v2.0
          </div>
        </div>

        <div className="space-y-6 font-mono relative">
          <div>
            <div className={`text-[10px] font-bold ${s.textPrimary} uppercase tracking-widest mb-3 flex items-center gap-2`}><span className={`w-2 h-2 rounded-full bg-${c.primary}`}></span> TX_STREAM (SENT)</div>
            <div className="flex flex-wrap gap-1.5">
              {sentMsg.split("").map((bit, idx) => (
                <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.9 }} key={`sent-${idx}`} onClick={() => handleFlipBit("sent", idx)} className={`w-8 h-12 md:w-10 md:h-14 flex flex-col justify-center items-center text-sm font-bold rounded-lg border transition-all cursor-pointer ${currentIdx === idx ? `bg-${c.primary} text-white border-${c.primary} shadow-lg scale-110 z-10` : `${s.cardBg} ${s.textSecondary} ${s.cardBorder} hover:${s.subBg}`}`}>
                  <span className={`text-[8px] md:text-[9px] ${currentIdx === idx ? 'text-white/80' : s.textMuted} block leading-none`}>{idx+1}</span>
                  <span className="leading-tight mt-1">{bit}</span>
                </motion.button>
              ))}
            </div>
          </div>

          <div className={`h-[3px] ${s.tabBarBg} my-6 relative rounded-full overflow-hidden`}>
            <motion.div 
              className={`absolute top-0 left-0 h-full bg-${c.primary} ${c.glow} blur-[1px]`} 
              animate={{ width: `${((currentIdx + 1) / binaryLength) * 100}%` }}
              transition={{ ease: "linear", duration: 0.1 }}
            />
          </div>

          <div>
            <div className={`text-[10px] font-bold ${s.textPrimary} uppercase tracking-widest mb-3 flex items-center gap-2`}><span className={`w-2 h-2 rounded-full bg-rose-500`}></span> RX_STREAM (RECV)</div>
            <div className="flex flex-wrap gap-1.5 relative">
              {recvMsg.split("").map((bit, idx) => {
                const isChecked = idx <= currentIdx;
                const isCorrupted = sentMsg[idx] !== bit;
                const isActive = idx === currentIdx;
                let cellStyle = `${s.cardBg} ${s.textSecondary} ${s.cardBorder} hover:${s.subBg} border`;
                
                if (isChecked) {
                  if (isCorrupted) cellStyle = "bg-rose-500 text-white border-rose-600 shadow-rose-500/40 shadow-lg scale-105 z-10 animate-pulse";
                  else cellStyle = `bg-${c.primary} text-white border-${c.primary} shadow-sm`;
                }
                if (isActive) cellStyle += ` ring-4 ring-${c.primary}/50 scale-110 z-20`;

                return (
                  <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.9 }} key={`recv-${idx}`} onClick={() => handleFlipBit("recv", idx)} className={`w-8 h-12 md:w-10 md:h-14 flex flex-col justify-center items-center text-sm font-bold rounded-lg transition-all cursor-pointer ${cellStyle}`}>
                    <span className={`text-[8px] md:text-[9px] ${isChecked ? 'text-white/80' : s.textMuted} block leading-none`}>{idx+1}</span>
                    <span className="leading-tight mt-1">{bit}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        <div className={`flex justify-between items-center pt-6 border-t ${s.borderLight}`}>
          <div className="flex gap-3">
            {!isPlaying ? (
              <button onClick={startSimulation} className={`flex items-center gap-2 px-5 py-2.5 bg-${c.primary} hover:bg-${c.primary}/90 text-white font-bold text-[10px] uppercase tracking-widest rounded-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer`}>
                <Play size={14} fill="currentColor" /> Run Scan
              </button>
            ) : (
              <button onClick={resetSimulation} className={`flex items-center gap-2 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-[10px] uppercase tracking-widest rounded-lg transition-all shadow-lg hover:-translate-y-0.5 cursor-pointer`}>
                <RotateCcw size={14} /> Stop
              </button>
            )}
            <button onClick={resetSimulation} className={`flex items-center gap-2 px-4 py-2.5 ${s.cardBg} border ${s.cardBorder} ${s.textSecondary} hover:${s.textPrimary} font-bold text-[10px] uppercase tracking-widest rounded-lg transition-all cursor-pointer`}>
              Reset
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className={`text-[10px] font-bold ${s.textMuted} uppercase tracking-wider`}>Errors Found</div>
            <div className="flex gap-1.5">
              <AnimatePresence>
                {mismatches.map((m, i) => (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} key={i} className="w-6 h-6 bg-rose-500 rounded-md text-white flex items-center justify-center text-[10px] font-bold shadow-md">
                    {m + 1}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4`}>
        <motion.div initial={false} animate={{ borderColor: totalErrors > 0 ? (totalErrors === 1 ? '#eab308' : '#f43f5e') : '#10b981' }} className={`${s.cardBg} border-2 rounded-xl p-6 transition-colors duration-500 shadow-sm relative overflow-hidden`}>
          <div className="absolute -right-4 -top-4 opacity-10">
            {totalErrors === 0 ? <ShieldCheck size={100} /> : <AlertTriangle size={100} />}
          </div>
          <h4 className={`font-bold ${s.textPrimary} text-xs uppercase tracking-wider mb-2 flex items-center gap-2`}>
            {totalErrors === 0 ? <ShieldCheck size={16} className="text-emerald-500" /> : <AlertTriangle size={16} className={totalErrors === 1 ? "text-amber-500" : "text-rose-500"} />}
            Classification Result
          </h4>
          <div className={`text-xl font-extrabold ${totalErrors === 0 ? 'text-emerald-500' : totalErrors === 1 ? 'text-amber-500' : 'text-rose-500'} mb-2`}>
            {classification.toUpperCase()}
          </div>
          <p className={`text-xs ${s.textSecondary} leading-relaxed opacity-90`}>{explanation}</p>
        </motion.div>

        <div className={`${s.subBg} border ${s.subBorder} rounded-xl p-6 space-y-4`}>
          <h4 className={`font-bold ${s.textPrimary} text-xs uppercase tracking-wider mb-2 flex items-center gap-2`}>
            <HelpCircle size={16} className={`text-${c.primary}`} />
            Context & Rules
          </h4>
          <ul className={`text-[10px] space-y-2 ${s.textSecondary} leading-relaxed list-disc list-inside`}>
            <li><strong className={s.textPrimary}>Single-Bit Error:</strong> Isolated corruption of exactly 1 bit per data unit. Rare in serial data transmission without structured noise.</li>
            <li><strong className={s.textPrimary}>Burst Error:</strong> 2 or more corrupted bits. Length is measured from the first to the last corrupted bit (inclusive).</li>
            <li><strong className={s.textPrimary}>Error Detection:</strong> To reliably detect <span className="italic font-bold">d</span> errors, minimum Hamming distance must be <span className="italic font-bold">d + 1</span>.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function HammingSphereSimulator({ theme }: SimulatorProps) {
  const s = themes[theme];
  const [t, setT] = useState<number>(5);
  const dMin = 2 * t + 1;

  const themeColors = {
    dark: { primary: "emerald-500", sec: "emerald-400" },
    galaxy: { primary: "fuchsia-500", sec: "purple-400" },
    desert: { primary: "[#C05C33]", sec: "amber-500" },
    light: { primary: "zinc-900", sec: "zinc-600" }
  };
  const c = themeColors[theme as keyof typeof themeColors] || themeColors.light;

  return (
    <div className="space-y-8" id="hamming-sphere-sim">
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-xl font-bold ${s.textPrimary} uppercase tracking-tight flex items-center gap-2`}>
            <Network size={24} className={`text-${c.primary}`} />
            Hamming Sphere Pack Visualizer
          </h3>
          <p className={`text-xs ${s.textSecondary} mt-1 opacity-80 uppercase tracking-wider font-semibold`}>
            Adjust capacity (t) to observe minimum partition distance
          </p>
        </div>
      </div>

      <div className={`${s.subBg} p-8 rounded-2xl border ${s.subBorder} space-y-8 transition-colors duration-300 shadow-md`}>
        <div className="flex justify-between items-center border-b border-zinc-500/20 pb-4">
          <span className={`text-xs font-bold ${s.textPrimary} uppercase tracking-widest flex items-center gap-2`}>
            <Settings2 size={16} /> Target Error Correction (t)
          </span>
          <motion.div key={t} initial={{ scale: 1.2, color: '#10b981' }} animate={{ scale: 1, color: '' }} className={`px-4 py-1.5 bg-${c.primary} text-white font-extrabold rounded-lg text-sm font-mono shadow-lg`}>
            {t} bits
          </motion.div>
        </div>
        <div className="relative pt-4">
          <input type="range" min="1" max="60" value={t} onChange={(e) => setT(parseInt(e.target.value))} className={`w-full h-2 ${s.tabBarBg} rounded-full appearance-none cursor-pointer accent-${c.primary} outline-none focus:ring-4 focus:ring-${c.primary}/30 transition-all`} />
          <div className="absolute -top-3 left-0 right-0 flex justify-between px-1 pointer-events-none">
            {[1, 15, 30, 45, 60].map((val) => (
              <div key={val} className="flex flex-col items-center">
                <div className={`w-1 h-2 bg-${c.primary} mb-1`} />
              </div>
            ))}
          </div>
          <div className={`flex justify-between text-[10px] ${s.textMuted} font-mono mt-4 uppercase tracking-widest font-bold`}>
            <span>t=1 (Min)</span>
            <span>t=30 (Mid)</span>
            <span>t=60 (Max)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className={`lg:col-span-5 ${s.cardBg} border ${s.cardBorder} rounded-2xl p-6 transition-colors duration-300 flex flex-col shadow-md`}>
          <div className="space-y-6 flex-1">
            <h4 className={`font-bold ${s.textPrimary} text-[10px] tracking-widest uppercase flex items-center gap-2`}><HelpCircle size={14} className={`text-${c.primary}`} /> Mathematical Proof</h4>
            <div className={`flex justify-center items-center py-8 ${s.subBg} rounded-xl border ${s.subBorder} shadow-inner`}>
              <motion.span key={dMin} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`text-4xl font-mono text-${c.sec} font-bold italic tracking-tighter drop-shadow-sm`}>
                d<sub className="text-xl">min</sub> = 2t + 1
              </motion.span>
            </div>
            <p className={`text-xs ${s.textSecondary} leading-relaxed opacity-90`}>
              To reliably correct up to <span className={`italic font-extrabold text-${c.sec} px-1 bg-${c.primary}/10 rounded`}>t</span> random errors in a block code, the legal codewords must be separated by a minimum Hamming distance of at least <span className={`italic font-extrabold text-${c.sec} px-1 bg-${c.primary}/10 rounded`}>2t + 1</span>.
            </p>
          </div>
          <div className={`border-t ${s.borderLight} pt-6 mt-6 space-y-3`}>
            <div className="flex justify-between text-xs items-center">
              <span className={`${s.textMuted} uppercase tracking-wider font-bold text-[10px]`}>Radius (t)</span>
              <span className={`font-mono font-bold text-${c.sec} bg-${c.primary}/10 px-2 py-0.5 rounded`}>{t}</span>
            </div>
            <div className="flex justify-between text-xs items-center">
              <span className={`${s.textMuted} uppercase tracking-wider font-bold text-[10px]`}>Diameter (2t)</span>
              <span className={`font-mono font-bold text-${c.sec} bg-${c.primary}/10 px-2 py-0.5 rounded`}>{2 * t}</span>
            </div>
            <div className={`flex justify-between text-sm font-bold border-t-2 border-dashed ${s.borderLight} pt-3 ${s.textPrimary} items-center`}>
              <span className="uppercase tracking-widest">Required d<sub className="text-[10px]">min</sub></span>
              <motion.span key={dMin} initial={{ scale: 1.5 }} animate={{ scale: 1 }} className={`text-${c.sec} font-mono font-extrabold text-xl`}>{dMin}</motion.span>
            </div>
          </div>
        </div>

        <div className={`lg:col-span-7 ${s.subBg} text-zinc-800 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-[400px] border ${s.subBorder} shadow-inner transition-colors duration-300`}>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          
          <h4 className={`font-bold ${s.textMuted} text-[10px] tracking-widest uppercase mb-4 relative z-10 bg-${s.subBg}/80 inline-block px-2 py-1 rounded backdrop-blur-sm border ${s.borderLight}`}>Vector Space Geometry Map</h4>
          
          <div className="flex-1 flex justify-center items-center relative z-10 w-full h-full">
            <div className="absolute left-1/4 flex flex-col items-center">
              <motion.div animate={{ scale: 0.5 + (t / 70) }} transition={{ type: "spring", stiffness: 60, damping: 15 }} className={`w-40 h-40 rounded-full border-2 border-dashed border-${c.primary} bg-${c.primary}/10 flex justify-center items-center relative backdrop-blur-sm shadow-xl`}>
                <span className={`w-4 h-4 rounded-full bg-${c.sec} shadow-[0_0_15px_rgba(0,0,0,0.5)] z-10`} />
                <motion.span key={t} className={`absolute text-[9px] font-mono font-bold ${s.textPrimary} bottom-4 uppercase tracking-widest bg-${s.cardBg}/80 px-2 rounded`}>r = {t}</motion.span>
              </motion.div>
              <span className={`text-[10px] font-bold text-${c.sec} mt-4 uppercase tracking-widest bg-${s.cardBg}/80 px-2 py-0.5 rounded border ${s.borderLight}`}>Codeword A</span>
            </div>

            <div className="absolute left-[35%] right-[35%] flex flex-col items-center justify-center h-full">
              <div className={`h-[2px] w-full bg-${s.textSecondary} relative flex justify-center overflow-visible`}>
                <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-zinc-400" />
                <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-zinc-400" />
                <motion.span key={dMin} initial={{ y: -10, opacity: 0 }} animate={{ y: -20, opacity: 1 }} className={`absolute px-3 py-1 bg-${c.primary} text-white font-extrabold rounded-lg border-2 border-white/20 text-[10px] font-mono leading-none shadow-xl whitespace-nowrap`}>
                  d ≥ {dMin}
                </motion.span>
              </div>
            </div>

            <div className="absolute right-1/4 flex flex-col items-center">
              <motion.div animate={{ scale: 0.5 + (t / 70) }} transition={{ type: "spring", stiffness: 60, damping: 15 }} className={`w-40 h-40 rounded-full border-2 border-dashed border-${c.primary} bg-${c.primary}/10 flex justify-center items-center relative backdrop-blur-sm shadow-xl`}>
                <span className={`w-4 h-4 rounded-full bg-${c.sec} shadow-[0_0_15px_rgba(0,0,0,0.5)] z-10`} />
                <motion.span key={t} className={`absolute text-[9px] font-mono font-bold ${s.textPrimary} bottom-4 uppercase tracking-widest bg-${s.cardBg}/80 px-2 rounded`}>r = {t}</motion.span>
              </motion.div>
              <span className={`text-[10px] font-bold text-${c.sec} mt-4 uppercase tracking-widest bg-${s.cardBg}/80 px-2 py-0.5 rounded border ${s.borderLight}`}>Codeword B</span>
            </div>
          </div>

          <div className={`text-[10px] ${s.textSecondary} text-center font-semibold mt-4 relative z-10 bg-${s.cardBg}/90 py-2 rounded-lg border ${s.borderLight} backdrop-blur-sm shadow-sm`}>
            Spheres of radius <span className={`font-extrabold text-${c.sec}`}>t = {t}</span> do not overlap because <span className="font-mono">d_min ≥ {dMin}</span>.
          </div>
        </div>
      </div>
    </div>
  );
}
