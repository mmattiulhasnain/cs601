import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, RotateCcw, ShieldCheck, HelpCircle, Activity, Radio, ScanLine, AlertTriangle, Network, ChevronRight, Settings2, Zap, Waves, Cpu, Database, Eye } from "lucide-react";
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

  const themeColors = {
    dark: { primary: "emerald-500", sec: "emerald-400", hex: "#10b981" },
    galaxy: { primary: "fuchsia-500", sec: "purple-400", hex: "#d946ef" },
    desert: { primary: "[#C05C33]", sec: "amber-500", hex: "#C05C33" },
    light: { primary: "blue-600", sec: "blue-500", hex: "#2563eb" } // Using blue instead of zinc for more impact in light mode
  };
  const c = themeColors[theme as keyof typeof themeColors] || themeColors.light;

  const getSimActiveTabStyle = (tab: "error" | "hamming") => {
    const isActive = activeSim === tab;
    if (!isActive) {
      return `border-transparent ${s.textMuted} hover:${s.textSecondary} hover:${s.subBg} flex-1 py-4 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-widest`;
    }
    return `border-${c.primary} text-${c.sec} bg-${c.primary}/5 flex-1 py-4 px-6 text-sm font-extrabold border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-widest`;
  };

  return (
    <div className={`${s.cardBg} border ${s.cardBorder} rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 relative`} id="simulations-container">
      {/* Background glowing orb */}
      <div className="absolute -top-[50%] -left-[10%] w-[120%] h-[120%] opacity-20 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${c.hex}30, transparent 60%)` }} />

      <div className={`flex border-b ${s.borderLight} ${s.subBg} transition-colors duration-300 relative z-10 backdrop-blur-md`}>
        <button onClick={() => setActiveSim("error")} className={getSimActiveTabStyle("error")}>
          <Activity size={18} className={activeSim === "error" ? "animate-pulse" : ""} />
          <span className="hidden sm:inline">1. Error Animator</span>
          <span className="sm:hidden">1. Error</span>
        </button>
        <button onClick={() => setActiveSim("hamming")} className={getSimActiveTabStyle("hamming")}>
          <Network size={18} className={activeSim === "hamming" ? "animate-pulse" : ""} />
          <span className="hidden sm:inline">2. Hamming Visualizer</span>
          <span className="sm:hidden">2. Hamming</span>
        </button>
      </div>
      
      <div className="p-4 sm:p-8 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSim}
            initial={{ opacity: 0, x: -20, filter: "blur(10px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: 20, filter: "blur(10px)" }}
            transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
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

  const themeColors = {
    dark: { primary: "emerald-500", sec: "emerald-400", hex: "#10b981", glow: "shadow-emerald-500/50" },
    galaxy: { primary: "fuchsia-500", sec: "purple-400", hex: "#d946ef", glow: "shadow-fuchsia-500/50" },
    desert: { primary: "[#C05C33]", sec: "amber-500", hex: "#C05C33", glow: "shadow-[#C05C33]/50" },
    light: { primary: "blue-600", sec: "blue-500", hex: "#2563eb", glow: "shadow-blue-600/50" }
  };
  const c = themeColors[theme as keyof typeof themeColors] || themeColors.light;

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
        }, 100); // Faster scan
      } else {
        setTimeout(() => setIsPlaying(false), 200);
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
  let classification = "Optimal";
  let explanation = "The received bit stream matches the sent bit stream perfectly. No data degradation occurred over the transmission medium.";
  
  if (totalErrors === 1) {
    classification = "Single Bit Error";
    explanation = `Exactly one bit was flipped during transmission (at position ${realTimeMismatches[0] + 1}). Typically caused by isolated noise spikes (white noise).`;
  } else if (totalErrors > 1) {
    classification = "Burst Error";
    explanation = `${totalErrors} bits altered in this block. The interference lasted longer than the duration of a single bit, typically caused by impulse noise or signal fading.`;
  }

  const handleFlipBit = (type: "sent" | "recv", index: number) => {
    const target = type === "sent" ? sentMsg : recvMsg;
    const flipped = target[index] === "1" ? "0" : "1";
    const result = target.substring(0, index) + flipped + target.substring(index + 1);
    if (type === "sent") setSentMsg(result);
    else setRecvMsg(result);
  };

  // Signal drawing logic
  const drawWave = (binary: string) => {
    let path = `M 0 20 `;
    const step = 100 / Math.max(1, binary.length);
    for (let i = 0; i < binary.length; i++) {
      const bit = binary[i];
      const y = bit === "1" ? 5 : 35;
      path += `L ${i * step} ${y} L ${(i + 1) * step} ${y} `;
      if (i < binary.length - 1 && binary[i] !== binary[i+1]) {
        // Vertical connecting line logic is implicit in SVG if we just move to the next y, but we added it explicitly
      }
    }
    return path;
  };

  return (
    <div className="space-y-8" id="error-classifier-sim">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h3 className={`text-2xl font-black ${s.textPrimary} flex items-center gap-3 tracking-tighter`}>
            <div className={`p-2 rounded-xl bg-${c.primary}/10 border border-${c.primary}/20`}>
              <Waves size={24} className={`text-${c.primary}`} />
            </div>
            DATA TRANSMISSION
          </h3>
          <p className={`text-xs ${s.textSecondary} mt-2 opacity-80 uppercase tracking-widest font-bold flex items-center gap-2`}>
            <Zap size={14} className="text-amber-500" /> Channel Interference Simulator
          </p>
        </div>
        
        {/* Dynamic Metric Dashboard */}
        <div className="flex gap-3">
          <div className={`${s.subBg} border ${s.subBorder} rounded-xl px-4 py-2 flex flex-col items-center justify-center shadow-inner`}>
            <span className={`text-[9px] ${s.textMuted} uppercase tracking-widest font-bold`}>Bit Error Rate</span>
            <span className={`text-lg font-mono font-black ${totalErrors > 0 ? 'text-rose-500' : `text-${c.primary}`}`}>
              {(totalErrors / Math.max(1, binaryLength)).toFixed(2)}
            </span>
          </div>
          <div className={`${s.subBg} border ${s.subBorder} rounded-xl px-4 py-2 flex flex-col items-center justify-center shadow-inner`}>
            <span className={`text-[9px] ${s.textMuted} uppercase tracking-widest font-bold`}>Block Size</span>
            <span className={`text-lg font-mono font-black ${s.textPrimary}`}>
              {binaryLength}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <span className={`text-[10px] font-bold ${s.textMuted} uppercase tracking-widest flex items-center gap-1.5`}><Database size={12}/> Inject Scenario:</span>
        {[
          { label: "Q1.1 (Single)", s: "1111011111101101", r: "1111011111101111", icon: <Activity size={10} /> },
          { label: "Q1.2 (Burst)", s: "1111000100111011", r: "1010000000111011", icon: <Waves size={10} /> },
          { label: "Q1.4 (Single)", s: "1000110001000110", r: "1000110001010110", icon: <Activity size={10} /> },
        ].map((p, i) => (
          <motion.button 
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} 
            key={i} onClick={() => { setSentMsg(p.s); setRecvMsg(p.r); }} 
            className={`px-3 py-1.5 bg-${c.primary}/10 hover:bg-${c.primary}/20 text-${c.sec} border border-${c.primary}/30 text-[10px] rounded-lg font-bold transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer uppercase tracking-wider`}
          >
            {p.icon} {p.label}
          </motion.button>
        ))}
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        <div className="space-y-2">
          <label className={`text-[10px] font-bold ${s.textMuted} uppercase tracking-widest flex items-center gap-2`}><ChevronRight size={14} className={`text-${c.primary}`} /> Transmitter (Tx) Buffer</label>
          <input type="text" value={sentMsg} onChange={(e) => setSentMsg(e.target.value.replace(/[^01]/g, ""))} className={`w-full font-mono text-sm tracking-[0.25em] px-4 py-3 ${s.inputBg} border border-${c.primary}/30 ${s.inputText} rounded-xl outline-none focus:ring-2 focus:ring-${c.primary} focus:border-${c.primary} transition-all shadow-inner`} />
        </div>
        <div className="space-y-2">
          <label className={`text-[10px] font-bold ${s.textMuted} uppercase tracking-widest flex items-center gap-2`}><ChevronRight size={14} className="text-rose-500" /> Receiver (Rx) Buffer</label>
          <input type="text" value={recvMsg} onChange={(e) => setRecvMsg(e.target.value.replace(/[^01]/g, ""))} className={`w-full font-mono text-sm tracking-[0.25em] px-4 py-3 ${s.inputBg} border border-rose-500/30 ${s.inputText} rounded-xl outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all shadow-inner`} />
        </div>
      </div>

      {/* Main Core Animator */}
      <div className={`bg-zinc-950 rounded-3xl p-6 md:p-8 space-y-8 relative border border-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden`}>
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        
        {/* Header HUD */}
        <div className="flex justify-between items-center border-b border-zinc-800 pb-4 relative z-10">
          <div className="flex space-x-2">
            <span className={`w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)] animate-pulse`} />
            <span className={`w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]`} />
            <span className={`w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]`} />
          </div>
          <div className={`text-[10px] font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-2`}>
            <Eye size={14} className={`text-${c.primary}`} />
            OPTICAL SCANNER OCS-9000
          </div>
        </div>

        <div className="space-y-8 font-mono relative z-10">
          {/* Sent Stream */}
          <div className="relative">
            <div className={`text-[10px] font-bold text-zinc-300 uppercase tracking-widest mb-3 flex items-center gap-2`}><Cpu size={14} className={`text-${c.primary}`} /> TX_STREAM // ORIGINAL</div>
            
            {/* SVG Wave Sent */}
            <div className="h-10 mb-2 opacity-50 pointer-events-none w-full relative">
              <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full absolute inset-0">
                <path d={drawWave(sentMsg)} fill="none" stroke={c.hex} strokeWidth="1.5" strokeLinejoin="bevel" />
              </svg>
            </div>

            <div className="flex flex-wrap gap-1 md:gap-1.5 justify-center sm:justify-start">
              {sentMsg.split("").map((bit, idx) => (
                <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.9 }} key={`sent-${idx}`} onClick={() => handleFlipBit("sent", idx)} className={`w-7 h-10 md:w-10 md:h-14 flex flex-col justify-center items-center text-sm font-bold rounded-lg transition-all cursor-pointer border ${currentIdx === idx ? `bg-${c.primary} text-white border-${c.primary} shadow-[0_0_15px_${c.hex}] scale-110 z-10` : `bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800`}`}>
                  <span className={`text-[7px] md:text-[8px] ${currentIdx === idx ? 'text-white/80' : 'text-zinc-600'} block leading-none`}>{idx+1}</span>
                  <span className="leading-tight mt-1">{bit}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Animated Laser Scanner */}
          <div className="h-[2px] bg-zinc-800 my-4 relative rounded-full">
            <motion.div 
              className="absolute top-0 left-0 h-full bg-white shadow-[0_0_10px_#fff,0_0_20px_#fff]" 
              animate={{ width: `${((currentIdx + 1) / binaryLength) * 100}%` }}
              transition={{ ease: "linear", duration: 0.1 }}
            />
            {isPlaying && (
              <motion.div 
                className="absolute top-1/2 -mt-6 w-[2px] h-12 bg-white blur-[1px] shadow-[0_0_15px_#fff] z-50 pointer-events-none"
                animate={{ left: `${((currentIdx + 1) / binaryLength) * 100}%` }}
                transition={{ ease: "linear", duration: 0.1 }}
              />
            )}
          </div>

          {/* Received Stream */}
          <div className="relative">
            <div className={`text-[10px] font-bold text-zinc-300 uppercase tracking-widest mb-3 flex items-center gap-2`}><ScanLine size={14} className="text-rose-500" /> RX_STREAM // RECEIVED</div>
            
            {/* SVG Wave Received */}
            <div className="h-10 mb-2 opacity-50 pointer-events-none w-full relative">
              <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full absolute inset-0">
                <path d={drawWave(recvMsg)} fill="none" stroke="#f43f5e" strokeWidth="1.5" strokeLinejoin="bevel" />
              </svg>
            </div>

            <div className="flex flex-wrap gap-1 md:gap-1.5 justify-center sm:justify-start relative">
              {recvMsg.split("").map((bit, idx) => {
                const isChecked = idx <= currentIdx;
                const isCorrupted = sentMsg[idx] !== bit;
                const isActive = idx === currentIdx;
                
                let btnClass = "bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800";
                let motionProps = {};
                
                if (isChecked) {
                  if (isCorrupted) {
                    btnClass = "bg-rose-500 text-white border-rose-400 shadow-[0_0_15px_#f43f5e] z-10";
                    motionProps = {
                      animate: { x: [-2, 2, -2, 0] },
                      transition: { duration: 0.2 }
                    };
                  } else {
                    btnClass = `bg-${c.primary}/20 text-${c.sec} border-${c.primary}/50`;
                  }
                }
                if (isActive) btnClass += ` ring-2 ring-white scale-110 z-20 shadow-[0_0_20px_#fff]`;

                return (
                  <motion.button 
                    whileHover={{ y: -2 }} 
                    whileTap={{ scale: 0.9 }} 
                    {...motionProps}
                    key={`recv-${idx}`} 
                    onClick={() => handleFlipBit("recv", idx)} 
                    className={`w-7 h-10 md:w-10 md:h-14 flex flex-col justify-center items-center text-sm font-bold rounded-lg border transition-colors cursor-pointer ${btnClass}`}
                  >
                    <span className={`text-[7px] md:text-[8px] ${isChecked && isCorrupted ? 'text-white/80' : 'text-zinc-600'} block leading-none`}>{idx+1}</span>
                    <span className="leading-tight mt-1">{bit}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Console Footer */}
        <div className={`flex justify-between items-center pt-6 border-t border-zinc-800 mt-6 relative z-10`}>
          <div className="flex gap-3">
            {!isPlaying ? (
              <button onClick={startSimulation} className={`flex items-center gap-2 px-6 py-3 bg-${c.primary} hover:bg-${c.primary}/80 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_${c.hex}] hover:-translate-y-0.5 cursor-pointer`}>
                <Play size={14} fill="currentColor" /> Initiate Scan
              </button>
            ) : (
              <button onClick={resetSimulation} className={`flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_#e11d48] hover:-translate-y-0.5 cursor-pointer`}>
                <RotateCcw size={14} /> Halt
              </button>
            )}
            <button onClick={resetSimulation} className={`flex items-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all cursor-pointer border border-zinc-700`}>
              Reset
            </button>
          </div>
          <div className="flex items-center gap-4 hidden sm:flex">
            <div className={`text-[10px] font-bold text-zinc-400 uppercase tracking-widest`}>Corruption Log</div>
            <div className="flex gap-1">
              <AnimatePresence>
                {mismatches.map((m, i) => (
                  <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0 }} key={i} className="w-6 h-6 bg-rose-500 rounded text-white flex items-center justify-center text-[10px] font-mono font-bold shadow-[0_0_10px_#f43f5e]">
                    {m + 1}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 gap-6`}>
        <motion.div initial={false} animate={{ borderColor: totalErrors > 0 ? (totalErrors === 1 ? '#eab308' : '#f43f5e') : c.hex }} className={`${s.cardBg} border-2 rounded-2xl p-6 transition-colors duration-500 shadow-xl relative overflow-hidden flex flex-col justify-center`}>
          <div className="absolute -right-8 -bottom-8 opacity-[0.03] rotate-12">
            {totalErrors === 0 ? <ShieldCheck size={180} /> : <AlertTriangle size={180} />}
          </div>
          <h4 className={`font-black ${s.textPrimary} text-xs uppercase tracking-widest mb-3 flex items-center gap-2`}>
            {totalErrors === 0 ? <ShieldCheck size={18} className={`text-${c.primary}`} /> : <AlertTriangle size={18} className={totalErrors === 1 ? "text-amber-500" : "text-rose-500"} />}
            Diagnostic Result
          </h4>
          <div className={`text-2xl font-black tracking-tighter ${totalErrors === 0 ? `text-${c.primary}` : totalErrors === 1 ? 'text-amber-500' : 'text-rose-500'} mb-3`}>
            {classification.toUpperCase()}
          </div>
          <p className={`text-xs ${s.textSecondary} leading-relaxed opacity-90 font-medium`}>{explanation}</p>
        </motion.div>

        <div className={`${s.subBg} border ${s.subBorder} rounded-2xl p-6 space-y-4 shadow-inner flex flex-col justify-center`}>
          <h4 className={`font-black ${s.textPrimary} text-xs uppercase tracking-widest mb-2 flex items-center gap-2`}>
            <HelpCircle size={16} className={`text-${c.primary}`} />
            Telecommunication Theory
          </h4>
          <ul className={`text-[11px] space-y-3 ${s.textSecondary} leading-relaxed font-medium`}>
            <li className="flex items-start gap-2"><div className={`w-1.5 h-1.5 mt-1.5 rounded-full bg-${c.primary} shrink-0`} /><div><strong className={s.textPrimary}>Single-Bit Error:</strong> Isolated corruption of exactly 1 bit per data unit. Rare in serial data transmission without structured noise.</div></li>
            <li className="flex items-start gap-2"><div className={`w-1.5 h-1.5 mt-1.5 rounded-full bg-${c.primary} shrink-0`} /><div><strong className={s.textPrimary}>Burst Error:</strong> 2 or more corrupted bits. Length is measured from the first to the last corrupted bit (inclusive).</div></li>
            <li className="flex items-start gap-2"><div className={`w-1.5 h-1.5 mt-1.5 rounded-full bg-${c.primary} shrink-0`} /><div><strong className={s.textPrimary}>Error Detection:</strong> To reliably detect <span className="italic font-bold">d</span> errors, minimum Hamming distance must be <span className="italic font-bold">d + 1</span>.</div></li>
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
    dark: { primary: "emerald-500", sec: "emerald-400", hex: "#10b981", bg: "bg-[#161f30]" },
    galaxy: { primary: "fuchsia-500", sec: "purple-400", hex: "#d946ef", bg: "bg-[#130f2b]" },
    desert: { primary: "[#C05C33]", sec: "amber-500", hex: "#C05C33", bg: "bg-[#FAF6F0]" },
    light: { primary: "blue-600", sec: "blue-500", hex: "#2563eb", bg: "bg-white" }
  };
  const c = themeColors[theme as keyof typeof themeColors] || themeColors.light;

  return (
    <div className="space-y-8" id="hamming-sphere-sim">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h3 className={`text-2xl font-black ${s.textPrimary} uppercase tracking-tighter flex items-center gap-3`}>
            <div className={`p-2 rounded-xl bg-${c.primary}/10 border border-${c.primary}/20`}>
              <Network size={24} className={`text-${c.primary}`} />
            </div>
            Hamming Sphere Visualizer
          </h3>
          <p className={`text-xs ${s.textSecondary} mt-2 opacity-80 uppercase tracking-widest font-bold flex items-center gap-2`}>
            <Activity size={14} className="text-amber-500" /> Vector Space Partitioning
          </p>
        </div>
      </div>

      <div className={`${s.subBg} p-8 rounded-3xl border ${s.subBorder} space-y-8 transition-colors duration-300 shadow-xl relative overflow-hidden`}>
        <div className={`absolute top-0 right-0 w-64 h-64 bg-${c.primary}/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2`} />
        
        <div className="flex justify-between items-center border-b border-zinc-500/20 pb-4 relative z-10">
          <span className={`text-sm font-black ${s.textPrimary} uppercase tracking-widest flex items-center gap-2`}>
            <Settings2 size={18} className={`text-${c.primary}`} /> Target Error Correction (t)
          </span>
          <motion.div key={t} initial={{ scale: 1.3, rotate: -5 }} animate={{ scale: 1, rotate: 0 }} className={`px-5 py-2 bg-${c.primary} text-white font-black rounded-xl text-lg font-mono shadow-[0_5px_15px_${c.hex}60]`}>
            {t} bits
          </motion.div>
        </div>
        <div className="relative pt-6 pb-2 z-10">
          <input type="range" min="1" max="60" value={t} onChange={(e) => setT(parseInt(e.target.value))} className={`w-full h-3 ${s.tabBarBg} rounded-full appearance-none cursor-pointer accent-${c.primary} outline-none focus:ring-4 focus:ring-${c.primary}/30 transition-all shadow-inner`} />
          <div className="absolute -top-1 left-0 right-0 flex justify-between px-2 pointer-events-none">
            {[1, 15, 30, 45, 60].map((val) => (
              <div key={val} className="flex flex-col items-center">
                <div className={`w-1 h-3 rounded-full ${t >= val ? `bg-${c.primary}` : 'bg-zinc-400/30'} mb-1 transition-colors`} />
              </div>
            ))}
          </div>
          <div className={`flex justify-between text-[10px] ${s.textMuted} font-mono mt-4 uppercase tracking-widest font-bold px-1`}>
            <span>t=1 (Min)</span>
            <span>t=30 (Mid)</span>
            <span>t=60 (Max)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className={`xl:col-span-4 ${s.cardBg} border ${s.cardBorder} rounded-3xl p-8 transition-colors duration-300 flex flex-col shadow-xl`}>
          <div className="space-y-6 flex-1">
            <h4 className={`font-black ${s.textPrimary} text-xs tracking-widest uppercase flex items-center gap-2`}><HelpCircle size={16} className={`text-${c.primary}`} /> Mathematical Proof</h4>
            <div className={`flex justify-center items-center py-10 ${c.bg} rounded-2xl border ${s.subBorder} shadow-inner relative overflow-hidden`}>
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
              <motion.span key={dMin} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className={`text-5xl font-mono text-${c.sec} font-black italic tracking-tighter drop-shadow-md relative z-10`}>
                d<sub className="text-2xl ml-1">min</sub> = 2t + 1
              </motion.span>
            </div>
            <p className={`text-[11px] ${s.textSecondary} leading-relaxed opacity-90 font-medium`}>
              To reliably correct up to <span className={`font-black text-${c.sec} uppercase px-1 bg-${c.primary}/10 rounded`}>t</span> random errors in a block code, the valid codewords must be separated by a minimum Hamming distance of <span className={`font-black text-${c.sec} uppercase px-1 bg-${c.primary}/10 rounded`}>2t + 1</span> to prevent their decoding spheres from overlapping.
            </p>
          </div>
          <div className={`border-t ${s.borderLight} pt-6 mt-6 space-y-4`}>
            <div className="flex justify-between text-xs items-center bg-zinc-500/5 p-3 rounded-xl">
              <span className={`${s.textMuted} uppercase tracking-wider font-bold text-[10px]`}>Radius (t)</span>
              <span className={`font-mono font-black text-${c.sec}`}>{t}</span>
            </div>
            <div className="flex justify-between text-xs items-center bg-zinc-500/5 p-3 rounded-xl">
              <span className={`${s.textMuted} uppercase tracking-wider font-bold text-[10px]`}>Diameter (2t)</span>
              <span className={`font-mono font-black text-${c.sec}`}>{2 * t}</span>
            </div>
            <div className={`flex justify-between text-sm font-black border-t-2 border-dashed ${s.borderLight} pt-4 mt-2 ${s.textPrimary} items-center`}>
              <span className="uppercase tracking-widest">Required d<sub className="text-[10px]">min</sub></span>
              <motion.span key={dMin} initial={{ scale: 1.5, color: '#10b981' }} animate={{ scale: 1, color: '' }} className={`text-${c.sec} font-mono font-black text-2xl`}>{dMin}</motion.span>
            </div>
          </div>
        </div>

        <div className={`xl:col-span-8 bg-zinc-950 text-zinc-300 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between min-h-[450px] border border-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)]`}>
          {/* Deep Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/50 to-zinc-950" />
          </div>
          
          <h4 className={`font-black text-zinc-400 text-[10px] tracking-widest uppercase mb-4 relative z-10 bg-zinc-900/80 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg backdrop-blur-md border border-zinc-800`}><Eye size={14} className={`text-${c.primary}`}/> Vector Space Geometry Map</h4>
          
          <div className="flex-1 flex justify-center items-center relative z-10 w-full h-full mt-4">
            
            {/* Codeword A (Left) */}
            <div className="absolute left-[15%] md:left-1/4 flex flex-col items-center">
              <motion.div animate={{ scale: 0.6 + (t / 80) }} transition={{ type: "spring", stiffness: 50, damping: 20 }} className={`w-48 h-48 rounded-full border border-dashed border-${c.primary}/50 bg-${c.primary}/5 flex justify-center items-center relative backdrop-blur-sm`}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className={`absolute inset-0 rounded-full border-2 border-${c.primary}/20 border-t-${c.primary}`} />
                <span className={`w-4 h-4 rounded-full bg-${c.sec} shadow-[0_0_20px_${c.hex}] z-10`} />
                <motion.span key={t} className={`absolute text-[10px] font-mono font-black text-white bottom-6 uppercase tracking-widest bg-zinc-900/90 px-3 py-1 rounded-lg border border-zinc-700 shadow-xl`}>r = {t}</motion.span>
              </motion.div>
              <span className={`text-[10px] font-black text-white mt-6 uppercase tracking-widest bg-zinc-900/90 px-3 py-1.5 rounded-lg border border-zinc-700 shadow-xl`}>Codeword C₁</span>
            </div>

            {/* Distance Axis */}
            <div className="absolute left-[40%] md:left-[35%] right-[40%] md:right-[35%] flex flex-col items-center justify-center h-full z-20">
              <div className={`h-[3px] w-full bg-zinc-700 relative flex justify-center overflow-visible rounded-full`}>
                <div className="absolute top-1/2 -mt-1 -left-1 w-2.5 h-2.5 rounded-full bg-zinc-400 shadow-[0_0_10px_#fff]" />
                <div className="absolute top-1/2 -mt-1 -right-1 w-2.5 h-2.5 rounded-full bg-zinc-400 shadow-[0_0_10px_#fff]" />
                <motion.span key={dMin} initial={{ y: -10, opacity: 0, scale: 0.8 }} animate={{ y: -24, opacity: 1, scale: 1 }} className={`absolute px-4 py-1.5 bg-${c.primary} text-white font-black rounded-xl border border-white/20 text-xs font-mono leading-none shadow-[0_10px_20px_${c.hex}50] whitespace-nowrap`}>
                  d ≥ {dMin}
                </motion.span>
              </div>
            </div>

            {/* Codeword B (Right) */}
            <div className="absolute right-[15%] md:right-1/4 flex flex-col items-center">
              <motion.div animate={{ scale: 0.6 + (t / 80) }} transition={{ type: "spring", stiffness: 50, damping: 20 }} className={`w-48 h-48 rounded-full border border-dashed border-${c.primary}/50 bg-${c.primary}/5 flex justify-center items-center relative backdrop-blur-sm`}>
                <motion.div animate={{ rotate: -360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className={`absolute inset-0 rounded-full border-2 border-${c.primary}/20 border-b-${c.primary}`} />
                <span className={`w-4 h-4 rounded-full bg-${c.sec} shadow-[0_0_20px_${c.hex}] z-10`} />
                <motion.span key={t} className={`absolute text-[10px] font-mono font-black text-white bottom-6 uppercase tracking-widest bg-zinc-900/90 px-3 py-1 rounded-lg border border-zinc-700 shadow-xl`}>r = {t}</motion.span>
              </motion.div>
              <span className={`text-[10px] font-black text-white mt-6 uppercase tracking-widest bg-zinc-900/90 px-3 py-1.5 rounded-lg border border-zinc-700 shadow-xl`}>Codeword C₂</span>
            </div>
          </div>

          <div className={`text-[11px] text-zinc-400 text-center font-medium mt-8 relative z-10 bg-zinc-900/90 py-3 rounded-xl border border-zinc-800 backdrop-blur-md shadow-lg`}>
            Spheres of radius <span className={`font-black text-white px-1 bg-zinc-800 rounded`}>t = {t}</span> do not overlap because the partition space <span className="font-mono text-white">d_min ≥ {dMin}</span>.
          </div>
        </div>
      </div>
    </div>
  );
}
