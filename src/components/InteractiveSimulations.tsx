import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, RotateCcw, AlertTriangle, ShieldCheck, HelpCircle } from "lucide-react";
import { ThemeMode, themes } from "../utils/theme";

interface InteractiveSimulationsProps {
  theme?: ThemeMode;
}

export default function InteractiveSimulations({ theme = "light" }: InteractiveSimulationsProps) {
  const s = themes[theme];
  const [activeSim, setActiveSim] = useState<"error" | "hamming">("error");

  // Dynamic tab active styling
  const getSimActiveTabStyle = (tab: "error" | "hamming") => {
    const isActive = activeSim === tab;
    if (!isActive) {
      return `border-transparent ${s.textMuted} hover:${s.textSecondary} hover:${s.subBg} flex-1 py-4 px-6 text-xs font-semibold border-b-2 transition-all cursor-pointer`;
    }
    switch (theme) {
      case "dark":
        return "border-emerald-500 text-emerald-400 bg-[#161f30] flex-1 py-4 px-6 text-xs font-semibold border-b-2 transition-all cursor-pointer";
      case "galaxy":
        return "border-fuchsia-500 text-fuchsia-400 bg-[#130f2b]/90 flex-1 py-4 px-6 text-xs font-semibold border-b-2 transition-all cursor-pointer";
      case "desert":
        return "border-[#C05C33] text-[#C05C33] bg-[#FAF6F0] flex-1 py-4 px-6 text-xs font-semibold border-b-2 transition-all cursor-pointer";
      default:
        return "border-zinc-900 text-zinc-900 bg-white flex-1 py-4 px-6 text-xs font-semibold border-b-2 transition-all cursor-pointer";
    }
  };

  return (
    <div className={`${s.cardBg} border ${s.cardBorder} rounded-xl shadow-xs overflow-hidden transition-colors duration-300`} id="simulations-container">
      {/* Tab Selectors */}
      <div className={`flex border-b ${s.borderLight} ${s.subBg} transition-colors duration-300`}>
        <button
          onClick={() => setActiveSim("error")}
          className={getSimActiveTabStyle("error")}
          id="tab-error-sim"
        >
          1. Transmission Error Animator
        </button>
        <button
          onClick={() => setActiveSim("hamming")}
          className={getSimActiveTabStyle("hamming")}
          id="tab-hamming-sim"
        >
          2. Hamming Sphere Pack Visualizer
        </button>
      </div>

      <div className="p-6 md:p-8">
        {activeSim === "error" ? (
          <ErrorClassifierSimulator theme={theme} />
        ) : (
          <HammingSphereSimulator theme={theme} />
        )}
      </div>
    </div>
  );
}

// =========================================================
// SIMULATOR A: BIT ERROR CLASSIFIER & ANIMATOR
// =========================================================
interface SimulatorProps {
  theme: ThemeMode;
}

function ErrorClassifierSimulator({ theme }: SimulatorProps) {
  const s = themes[theme];
  const [sentMsg, setSentMsg] = useState("1111000100111011");
  const [recvMsg, setRecvMsg] = useState("1010000000111011");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [mismatches, setMismatches] = useState<number[]>([]);
  const [binaryLength, setBinaryLength] = useState(sentMsg.length);

  // Synced message editing helper
  useEffect(() => {
    // Keep lengths identical
    if (recvMsg.length !== sentMsg.length) {
      if (recvMsg.length < sentMsg.length) {
        setRecvMsg(recvMsg + sentMsg.slice(recvMsg.length));
      } else {
        setRecvMsg(recvMsg.slice(0, sentMsg.length));
      }
    }
    setBinaryLength(sentMsg.length);
    resetSimulation();
  }, [sentMsg]);

  useEffect(() => {
    if (sentMsg.length !== recvMsg.length) {
      if (sentMsg.length < recvMsg.length) {
        setSentMsg(sentMsg + recvMsg.slice(sentMsg.length));
      } else {
        setSentMsg(sentMsg.slice(0, recvMsg.length));
      }
    }
    setBinaryLength(recvMsg.length);
    resetSimulation();
  }, [recvMsg]);

  // Run the animated scanning step-by-step
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
        }, 150);
      } else {
        setIsPlaying(false);
      }
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentIdx, binaryLength, sentMsg, recvMsg]);

  const startSimulation = () => {
    setMismatches([]);
    setCurrentIdx(-1);
    setIsPlaying(true);
  };

  const resetSimulation = () => {
    setMismatches([]);
    setCurrentIdx(-1);
    setIsPlaying(false);
  };

  // Immediate evaluation
  const realTimeMismatches: number[] = [];
  const minLength = Math.min(sentMsg.length, recvMsg.length);
  for (let i = 0; i < minLength; i++) {
    if (sentMsg[i] !== recvMsg[i]) {
      realTimeMismatches.push(i);
    }
  }
  const totalErrors = realTimeMismatches.length;
  let classification = "No Errors Detected";
  let explanation = "The received bit stream matches the sent bit stream perfectly.";
  
  if (totalErrors === 1) {
    classification = "Single bit error";
    explanation = `Exactly one bit has been modified during transmission (at bit position ${realTimeMismatches[0] + 1}). This represents a single-bit error, usually caused by random noise spikes.`;
  } else if (totalErrors > 1) {
    classification = "Burst error";
    explanation = `${totalErrors} bits have been modified in this block (at positions: ${realTimeMismatches.map(i => i+1).join(", ")}). This represents a burst error, typical of electromagnetic interference or long noise bursts where the duration of noise is longer than the single-bit duration.`;
  }

  const handleFlipBit = (type: "sent" | "recv", index: number) => {
    const target = type === "sent" ? sentMsg : recvMsg;
    const flipped = target[index] === "1" ? "0" : "1";
    const result = target.substring(0, index) + flipped + target.substring(index + 1);
    
    if (type === "sent") setSentMsg(result);
    else setRecvMsg(result);
  };

  // Themed active scanner accent colors
  const activeScannerColor = theme === "dark" 
    ? "bg-emerald-500" 
    : theme === "galaxy" 
    ? "bg-fuchsia-500" 
    : theme === "desert" 
    ? "bg-[#C05C33]" 
    : "bg-zinc-900";

  const getScannedBitClass = (isActive: boolean) => {
    if (isActive) {
      switch (theme) {
        case "dark":
          return "bg-emerald-500 text-zinc-950 border-emerald-400 shadow-sm scale-105";
        case "galaxy":
          return "bg-fuchsia-500 text-zinc-950 border-fuchsia-400 shadow-sm scale-105";
        case "desert":
          return "bg-[#C05C33] text-white border-[#C05C33] shadow-sm scale-105";
        default:
          return "bg-zinc-900 text-white border-zinc-900 shadow-sm scale-105";
      }
    }
    return `${s.cardBg} ${s.textSecondary} ${s.cardBorder} hover:${s.subBg}`;
  };

  const runBtnClass = theme === "dark" 
    ? "bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded transition-all shadow-xs cursor-pointer" 
    : theme === "galaxy" 
    ? "bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded transition-all shadow-xs cursor-pointer" 
    : theme === "desert" 
    ? "bg-[#C05C33] hover:bg-[#A84C27] text-white font-bold text-xs rounded transition-all shadow-xs cursor-pointer" 
    : "bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded transition-all shadow-xs cursor-pointer";

  const errorBadgeColor = theme === "desert" ? "bg-[#C05C33]/10 text-[#C05C33] border-[#C05C33]/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20";

  return (
    <div className="space-y-6" id="error-classifier-sim">
      <div>
        <h3 className={`text-sm font-bold ${s.textPrimary} uppercase tracking-wider`}>Transmission Error Animator & Classifier</h3>
        <p className={`text-xs ${s.textSecondary} mt-1 opacity-80`}>
          Animate the channel receiver scanning process to detect bit variations. Flip bits manually to customize transmissions.
        </p>
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-2">
        <span className={`text-[10px] font-bold ${s.textMuted} self-center mr-2 uppercase tracking-wider`}>Try Presets:</span>
        <button
          onClick={() => {
            setSentMsg("1111011111101101");
            setRecvMsg("1111011111101111");
          }}
          className={`px-3 py-1 ${s.subBg} hover:${s.tabBarBg} ${s.textSecondary} border ${s.subBorder} text-[10px] rounded-full font-semibold transition-all cursor-pointer`}
        >
          Assign Q1.1 (Single Bit)
        </button>
        <button
          onClick={() => {
            setSentMsg("1111000100111011");
            setRecvMsg("1010000000111011");
          }}
          className={`px-3 py-1 ${s.subBg} hover:${s.tabBarBg} ${s.textSecondary} border ${s.subBorder} text-[10px] rounded-full font-semibold transition-all cursor-pointer`}
        >
          Assign Q1.2 (Burst)
        </button>
        <button
          onClick={() => {
            setSentMsg("1000110001000110");
            setRecvMsg("1000110001010110");
          }}
          className={`px-3 py-1 ${s.subBg} hover:${s.tabBarBg} ${s.textSecondary} border ${s.subBorder} text-[10px] rounded-full font-semibold transition-all cursor-pointer`}
        >
          Assign Q1.4 (Single Bit)
        </button>
      </div>

      {/* Bit Editing Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-[10px] font-bold ${s.textMuted} uppercase tracking-wider mb-2`}>
            Sent Message (Binary String)
          </label>
          <input
            type="text"
            value={sentMsg}
            onChange={(e) => setSentMsg(e.target.value.replace(/[^01]/g, ""))}
            placeholder="Enter binary..."
            className={`w-full font-mono text-xs tracking-widest px-4 py-2.5 ${s.inputBg} border ${s.inputBorder} ${s.inputText} rounded-lg outline-none transition-all`}
          />
        </div>
        <div>
          <label className={`block text-[10px] font-bold ${s.textMuted} uppercase tracking-wider mb-2`}>
            Received Message (Binary String)
          </label>
          <input
            type="text"
            value={recvMsg}
            onChange={(e) => setRecvMsg(e.target.value.replace(/[^01]/g, ""))}
            placeholder="Enter binary..."
            className={`w-full font-mono text-xs tracking-widest px-4 py-2.5 ${s.inputBg} border ${s.inputBorder} ${s.inputText} rounded-lg outline-none transition-all`}
          />
        </div>
      </div>

      {/* Simulator Interface */}
      <div className={`${s.subBg} rounded-xl p-6 ${s.textSecondary} space-y-6 relative overflow-hidden border ${s.subBorder} transition-colors duration-300`}>
        <div className="flex justify-between items-center">
          <div className="flex space-x-1.5">
            <span className={`w-2 h-2 rounded-full ${theme === "light" ? "bg-zinc-300" : "bg-zinc-700"}`} />
            <span className={`w-2 h-2 rounded-full ${theme === "light" ? "bg-zinc-300" : "bg-zinc-700"}`} />
            <span className={`w-2 h-2 rounded-full ${theme === "light" ? "bg-zinc-400" : "bg-zinc-600"}`} />
          </div>
          <div className={`text-[9px] font-mono ${s.textMuted} uppercase tracking-widest`}>
            TRANSMISSION SCANNER v1.0
          </div>
        </div>

        {/* Binary Streams Visual Blocks */}
        <div className="space-y-4 font-mono">
          {/* Sent Stream */}
          <div>
            <div className={`text-[9px] font-bold ${s.textMuted} uppercase tracking-wider mb-1.5`}>SENT STREAM (TX)</div>
            <div className="flex flex-wrap gap-1">
              {sentMsg.split("").map((bit, idx) => (
                <button
                  key={`sent-${idx}`}
                  onClick={() => handleFlipBit("sent", idx)}
                  className={`w-8 h-10 flex flex-col justify-center items-center text-xs font-bold rounded border transition-all cursor-pointer ${getScannedBitClass(currentIdx === idx)}`}
                  title="Click to flip bit"
                >
                  <span className={`text-[8px] ${s.textMuted} block leading-none`}>{idx+1}</span>
                  <span className="leading-tight">{bit}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Separation line representing physical channel */}
          <div className={`h-[2px] ${s.tabBarBg} my-2 relative`}>
            <div className={`absolute top-1/2 left-0 h-[3px] ${activeScannerColor} transition-all duration-300`} style={{ width: `${((currentIdx + 1) / binaryLength) * 100}%`, transform: 'translateY(-50%)' }} />
          </div>

          {/* Received Stream */}
          <div>
            <div className={`text-[9px] font-bold ${s.textMuted} uppercase tracking-wider mb-1.5`}>RECEIVED STREAM (RX)</div>
            <div className="flex flex-wrap gap-1">
              {recvMsg.split("").map((bit, idx) => {
                const isChecked = idx <= currentIdx;
                const isCorrupted = sentMsg[idx] !== bit;
                const isActive = idx === currentIdx;

                let cellStyle = `${s.cardBg} ${s.textSecondary} ${s.cardBorder} hover:${s.subBg} border`;
                if (isChecked) {
                  if (isCorrupted) {
                    cellStyle = "bg-rose-500 text-white border-rose-500 shadow-xs";
                  } else {
                    switch (theme) {
                      case "dark":
                        cellStyle = "bg-emerald-600 text-white border-emerald-500 shadow-xs";
                        break;
                      case "galaxy":
                        cellStyle = "bg-purple-700 text-white border-purple-600 shadow-xs";
                        break;
                      case "desert":
                        cellStyle = "bg-[#C05C33] text-white border-[#C05C33] shadow-xs";
                        break;
                      default:
                        cellStyle = "bg-zinc-900 text-white border-zinc-900 shadow-xs";
                        break;
                    }
                  }
                }
                if (isActive) {
                  switch (theme) {
                    case "dark":
                      cellStyle += " ring-2 ring-emerald-400 scale-105";
                      break;
                    case "galaxy":
                      cellStyle += " ring-2 ring-fuchsia-400 scale-105";
                      break;
                    case "desert":
                      cellStyle += " ring-2 ring-[#C05C33] scale-105";
                      break;
                    default:
                      cellStyle += " ring-2 ring-zinc-900 scale-105";
                      break;
                  }
                }

                return (
                  <button
                    key={`recv-${idx}`}
                    onClick={() => handleFlipBit("recv", idx)}
                    className={`w-8 h-10 flex flex-col justify-center items-center text-xs font-bold rounded transition-all cursor-pointer ${cellStyle}`}
                    title="Click to flip bit"
                  >
                    <span className={`text-[8px] ${s.textMuted} block leading-none`}>{idx+1}</span>
                    <span className="leading-tight">{bit}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4 pt-2">
          {!isPlaying && currentIdx < binaryLength - 1 ? (
            <button
              onClick={startSimulation}
              className={`flex items-center gap-2 px-4 py-2 ${runBtnClass}`}
            >
              <Play size={14} /> Run Scanner
            </button>
          ) : isPlaying ? (
            <button
              onClick={() => setIsPlaying(false)}
              className={`flex items-center gap-2 px-4 py-2 ${s.btnSecondaryBg} font-bold text-xs rounded transition-all cursor-pointer`}
            >
              Pause
            </button>
          ) : (
            <button
              onClick={resetSimulation}
              className={`flex items-center gap-2 px-4 py-2 ${s.btnSecondaryBg} font-bold text-xs rounded transition-all cursor-pointer`}
            >
              <RotateCcw size={14} /> Reset
            </button>
          )}

          <div className={`self-center text-xs ${s.textSecondary}`}>
            {currentIdx === -1
              ? "Ready to initiate scan."
              : currentIdx < binaryLength - 1
              ? `Scanning channel bit ${currentIdx + 2} of ${binaryLength}...`
              : `Channel scan completed! Detected ${mismatches.length} corrupted bits.`}
          </div>
        </div>
      </div>

      {/* Live Diagnosis Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <div className={`${s.cardBg} rounded-lg p-4 border ${s.cardBorder} flex items-center space-x-3 transition-colors duration-300`}>
          <div className={`p-2 rounded-lg border ${totalErrors > 0 ? errorBadgeColor : `${s.subBg} ${s.subBorder} ${s.textSecondary}`}`}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <div className={`text-[10px] ${s.textMuted} font-bold uppercase tracking-wider`}>Corrupted Bits (XOR Weight)</div>
            <div className={`text-xs font-bold ${s.textPrimary}`}>{totalErrors} / {binaryLength} bits</div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className={`${s.cardBg} rounded-lg p-4 border ${s.cardBorder} flex items-center space-x-3 transition-colors duration-300`}>
          <div className={`p-2 rounded-lg ${s.subBg} ${s.subBorder} ${s.textSecondary} border`}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className={`text-[10px] ${s.textMuted} font-bold uppercase tracking-wider`}>Automatic Classification</div>
            <div className={`text-xs font-bold ${s.textPrimary} truncate`}>{classification}</div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className={`${s.cardBg} rounded-lg p-4 border ${s.cardBorder} flex items-center space-x-3 col-span-1 md:col-span-1 transition-colors duration-300`}>
          <div className={`p-2 rounded-lg ${s.subBg} ${s.subBorder} ${s.textSecondary} border`}>
            <HelpCircle size={20} />
          </div>
          <div>
            <div className={`text-[10px] ${s.textMuted} font-bold uppercase tracking-wider`}>Channel State</div>
            <div className={`text-xs font-bold ${s.textPrimary}`}>
              {totalErrors === 0 ? "100% Reliable Frame" : totalErrors === 1 ? "Random Single Bit Noise" : "Multi-bit Interference"}
            </div>
          </div>
        </div>
      </div>

      {/* Explanation Box */}
      <div className={`${s.subBg} rounded-lg p-5 border ${s.subBorder} ${s.textSecondary} transition-colors duration-300`}>
        <h4 className={`font-bold ${s.textPrimary} text-[10px] uppercase tracking-wider mb-1`}>Theoretical Explanation:</h4>
        <p className={`text-xs ${s.textSecondary} leading-relaxed opacity-85`}>{explanation}</p>
      </div>
    </div>
  );
}

// =========================================================
// SIMULATOR B: HAMMING DISTANCE SPHERE PACK VISUALIZER
// =========================================================
function HammingSphereSimulator({ theme }: SimulatorProps) {
  const s = themes[theme];
  const [t, setT] = useState<number>(5);
  const dMin = 2 * t + 1;

  // Slider theme accents
  const thumbColorClass = theme === "dark" 
    ? "accent-emerald-500" 
    : theme === "galaxy" 
    ? "accent-fuchsia-500" 
    : theme === "desert" 
    ? "accent-[#C05C33]" 
    : "accent-zinc-900";

  const mathPrimaryColor = theme === "dark" 
    ? "text-emerald-400" 
    : theme === "galaxy" 
    ? "text-fuchsia-400" 
    : theme === "desert" 
    ? "text-[#C05C33]" 
    : "text-zinc-900";

  const activeBadgeColor = theme === "dark" 
    ? "bg-emerald-600 text-white" 
    : theme === "galaxy" 
    ? "bg-purple-700 text-white" 
    : theme === "desert" 
    ? "bg-[#C05C33] text-white" 
    : "bg-zinc-900 text-white";

  const dotColorClass = theme === "dark" 
    ? "bg-emerald-400" 
    : theme === "galaxy" 
    ? "bg-fuchsia-400" 
    : theme === "desert" 
    ? "bg-[#C05C33]" 
    : "bg-zinc-900";

  return (
    <div className="space-y-6" id="hamming-sphere-sim">
      <div>
        <h3 className={`text-sm font-bold ${s.textPrimary} uppercase tracking-wider`}>Hamming Distance Sphere Packing Visualizer</h3>
        <p className={`text-xs ${s.textSecondary} mt-1 opacity-80`}>
          Adjust the target error correction capacity (<span className="italic">t</span>) and observe the minimum Hamming distance required to partition vector space without overlapping spheres.
        </p>
      </div>

      {/* Interactive slider */}
      <div className={`${s.subBg} p-6 rounded-xl border ${s.subBorder} space-y-4 transition-colors duration-300`}>
        <div className="flex justify-between items-center">
          <span className={`text-xs font-bold ${s.textPrimary} uppercase tracking-wider`}>Target Error Correction bits (t):</span>
          <span className={`px-3 py-1 ${activeBadgeColor} font-extrabold rounded text-xs font-mono shadow-sm`}>
            {t} bits
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="60"
          value={t}
          onChange={(e) => setT(parseInt(e.target.value))}
          className={`w-full h-1.5 ${s.tabBarBg} rounded-lg appearance-none cursor-pointer ${thumbColorClass}`}
        />
        <div className={`flex justify-between text-[10px] ${s.textMuted} font-mono`}>
          <span>t = 1 (Single bit)</span>
          <span>t = 30</span>
          <span>t = 60 (Assignment Max)</span>
        </div>
      </div>

      {/* Equation Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Math explanation */}
        <div className={`${s.cardBg} border ${s.cardBorder} rounded-xl p-6 transition-colors duration-300 flex flex-col justify-between`}>
          <div className="space-y-4">
            <h4 className={`font-bold ${s.textPrimary} text-xs tracking-wider uppercase`}>Theoretical Formula</h4>
            <div className={`flex justify-center p-4 ${s.subBg} rounded-lg border ${s.subBorder}`}>
              <span className={`text-2xl font-mono ${mathPrimaryColor} font-bold italic`}>
                d<sub>min</sub> = 2t + 1
              </span>
            </div>
            <p className={`text-xs ${s.textSecondary} leading-relaxed`}>
              According to block coding theory, to correct up to <span className={`italic font-bold ${s.textPrimary}`}>t</span> random errors, any two valid codewords must be separated by a minimum distance of at least <span className={`italic font-bold ${s.textPrimary}`}>2t + 1</span>.
            </p>
          </div>

          <div className={`border-t ${s.borderLight} pt-4 mt-4 space-y-2`}>
            <div className="flex justify-between text-xs">
              <span className={s.textMuted}>Substituted value (t):</span>
              <span className={`font-bold ${s.textSecondary}`}>{t}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className={s.textMuted}>Double capacity (2t):</span>
              <span className={`font-bold ${s.textSecondary}`}>{2 * t}</span>
            </div>
            <div className={`flex justify-between text-sm font-bold border-t border-dashed ${s.subBorder} pt-2 ${s.textPrimary}`}>
              <span>Required d<sub>min</sub>:</span>
              <span className={`${mathPrimaryColor} font-mono font-extrabold`}>{dMin}</span>
            </div>
          </div>
        </div>

        {/* Geometry Sphere visual */}
        <div className={`${s.subBg} text-zinc-800 rounded-xl p-6 relative overflow-hidden flex flex-col justify-between h-[300px] md:h-auto border ${s.subBorder} transition-colors duration-300`}>
          <h4 className={`font-bold ${s.textMuted} text-[9px] tracking-wider uppercase mb-2`}>Vector Space Spheres representation</h4>
          
          {/* Animated 2D vector space */}
          <div className="flex-1 flex justify-center items-center relative min-h-[160px]">
            {/* Codeword A sphere */}
            <div className="absolute left-1/4 flex flex-col items-center">
              {/* Radius sphere */}
              <motion.div
                animate={{ scale: 0.6 + (t / 120) }}
                transition={{ type: "spring", stiffness: 80 }}
                className={`w-32 h-32 rounded-full border border-dashed ${theme === "light" ? "border-zinc-400/50 bg-zinc-400/5" : "border-indigo-500/30 bg-indigo-500/5"} flex justify-center items-center relative`}
              >
                {/* Center codeword */}
                <span className={`w-3 h-3 rounded-full ${dotColorClass} shadow-sm z-10`} />
                
                {/* Sphere label */}
                <span className={`absolute text-[8px] font-mono ${s.textMuted} bottom-3`}>Sphere (Radius t)</span>
              </motion.div>
              <span className={`text-[10px] font-bold ${s.textMuted} mt-2`}>Codeword C₁</span>
            </div>

            {/* Distance connector */}
            <div className="absolute left-[37.5%] right-[37.5%] flex flex-col items-center">
              <div className={`h-[2px] w-full ${theme === "light" ? "bg-zinc-300" : "bg-indigo-950"} relative flex justify-center`}>
                <span className={`absolute top-1/2 -translate-y-1/2 px-2 py-0.5 ${activeBadgeColor} rounded border ${s.subBorder} text-[9px] font-mono leading-none`}>
                  d ≥ {dMin}
                </span>
              </div>
            </div>

            {/* Codeword B sphere */}
            <div className="absolute right-1/4 flex flex-col items-center">
              {/* Radius sphere */}
              <motion.div
                animate={{ scale: 0.6 + (t / 120) }}
                transition={{ type: "spring", stiffness: 80 }}
                className={`w-32 h-32 rounded-full border border-dashed ${theme === "light" ? "border-zinc-400/50 bg-zinc-400/5" : "border-indigo-500/30 bg-indigo-500/5"} flex justify-center items-center relative`}
              >
                {/* Center codeword */}
                <span className={`w-3 h-3 rounded-full ${dotColorClass} shadow-sm z-10`} />
                <span className={`absolute text-[8px] font-mono ${s.textMuted} bottom-3`}>Sphere (Radius t)</span>
              </motion.div>
              <span className={`text-[10px] font-bold ${s.textMuted} mt-2`}>Codeword C₂</span>
            </div>
          </div>

          <div className={`text-[10px] ${s.textSecondary} text-center italic mt-2`}>
            The decision spheres of radius <span className={`font-bold ${s.textPrimary}`}>t = {t}</span> do not overlap because the minimum separation distance <span className={`font-bold ${s.textPrimary}`}>d<sub>min</sub></span> is at least <span className={`font-bold ${s.textPrimary}`}>{dMin}</span>.
          </div>
        </div>
      </div>
    </div>
  );
}
