import { useState } from "react";
import { themes, ThemeMode } from "../utils/theme";
import { 
  Github, 
  Terminal, 
  Check, 
  Copy, 
  Settings, 
  BookOpen, 
  Globe, 
  ArrowRight,
  Server,
  Sparkles,
  Info
} from "lucide-react";

interface GitHubPagesSetupProps {
  theme: ThemeMode;
}

export default function GitHubPagesSetup({ theme }: GitHubPagesSetupProps) {
  const s = themes[theme];
  const [copied, setCopied] = useState(false);
  const [checklist, setChecklist] = useState({
    repoCreated: false,
    codePushed: false,
    workflowAdded: false,
    settingsConfigured: false,
  });

  const workflowCode = `# Simple workflow for deploying static content to GitHub Pages
name: Deploy to GitHub Pages

on:
  push:
    branches: ["main", "master"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: \$\{{ steps.deployment.outputs.page_url \}}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - name: Install dependencies
        run: npm install
      - name: Build
        run: npm run build
      - name: Setup Pages
        uses: actions/configure-pages@v4
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: "./dist"
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4`;

  const handleCopy = () => {
    // Unescape the templated template string format
    const cleanCode = workflowCode.replace(/\\/g, "");
    navigator.clipboard.writeText(cleanCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist({ ...checklist, [key]: !checklist[key] });
  };

  const completedCount = Object.values(checklist).filter(Boolean).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* HEADER SECTION */}
      <div className={`${s.cardBg} border ${s.cardBorder} rounded-xl p-5 md:p-6 space-y-4 transition-colors duration-300`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/10 pb-4">
          <div className="space-y-1">
            <h2 className={`text-base font-bold tracking-tight ${s.textPrimary} flex items-center gap-2`}>
              <Github className="text-zinc-500 shrink-0" size={20} />
              GitHub Pages Static Hosting Configuration
            </h2>
            <p className={`text-xs ${s.textSecondary}`}>
              Learn how to host this custom, interactive Data Communication Assignment suite on your own GitHub account for free.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className={`text-[10px] font-bold font-mono px-2.5 py-1 rounded-full border ${s.subBorder} ${s.subBg} ${s.textSecondary}`}>
              Relative Base Path Configured
            </span>
          </div>
        </div>

        {/* EXPLAINER NOTICE */}
        <div className={`p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex gap-3 items-start`}>
          <Info size={16} className="text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-emerald-800 dark:text-emerald-200">
            <p className="font-bold">Zero-Configuration Out Of The Box</p>
            <p className="leading-relaxed">
              We have pre-configured <strong>Vite's relative base path (<code>base: "./"</code>)</strong> inside this project's configuration. This means your compiled application automatically resolves assets dynamically relative to any subdirectory layout or custom domain you host it on (e.g., <code>yourusername.github.io/your-repository/</code>) without any manual routing adjustments!
            </p>
          </div>
        </div>

        {/* PIPELINE VISUALIZATION */}
        <div className={`${s.subBg} border ${s.subBorder} rounded-lg p-4 space-y-3`}>
          <h4 className={`text-[10px] font-bold uppercase tracking-wider ${s.textMuted} flex items-center gap-1`}>
            <Server size={12} /> Deployment Pipeline Architecture
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center text-center text-xs font-mono py-1">
            <div className={`p-3 rounded border ${s.cardBorder} ${s.cardBg} flex flex-col items-center gap-1`}>
              <Github className="text-indigo-400" size={16} />
              <span className="font-bold">1. Push to GitHub</span>
              <span className={`text-[9px] ${s.textMuted}`}>Repository: Public</span>
            </div>
            <div className="hidden md:flex justify-center text-zinc-400">
              <ArrowRight size={16} />
            </div>
            <div className={`p-3 rounded border ${s.cardBorder} ${s.cardBg} flex flex-col items-center gap-1`}>
              <Terminal className="text-emerald-400" size={16} />
              <span className="font-bold">2. GitHub Actions</span>
              <span className={`text-[9px] ${s.textMuted}`}>Vite Compilation Build</span>
            </div>
            <div className="hidden md:flex justify-center text-zinc-400">
              <ArrowRight size={16} />
            </div>
            <div className={`p-3 rounded border ${s.cardBorder} ${s.cardBg} flex flex-col items-center gap-1 col-span-1 md:col-span-1`}>
              <Globe className="text-amber-400" size={16} />
              <span className="font-bold">3. GitHub Pages Live</span>
              <span className={`text-[9px] ${s.textMuted}`}>https://yourusername.github.io/...</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: INTERACTIVE CHECKLIST (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className={`${s.cardBg} border ${s.cardBorder} rounded-xl p-5 space-y-4 transition-colors duration-300`}>
            <div className="border-b border-zinc-200/10 pb-3">
              <h3 className={`text-xs font-bold uppercase tracking-wider ${s.textPrimary} flex items-center justify-between`}>
                <span>Deployment Tracker</span>
                <span className="font-mono text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {completedCount}/4 Completed
                </span>
              </h3>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => toggleCheck("repoCreated")}
                className={`w-full text-left p-3 rounded-lg border transition-all flex items-start gap-3 cursor-pointer ${
                  checklist.repoCreated 
                    ? "bg-emerald-500/5 border-emerald-500/30 text-zinc-700 dark:text-zinc-300" 
                    : `${s.cardBg} border-zinc-200/40 hover:${s.subBg}`
                }`}
              >
                <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                  checklist.repoCreated ? "bg-emerald-600 border-emerald-600 text-white" : `${s.subBg} border-zinc-300`
                }`}>
                  {checklist.repoCreated && <Check size={12} />}
                </div>
                <div className="space-y-0.5">
                  <span className={`text-xs font-bold block ${checklist.repoCreated ? "line-through text-zinc-400" : s.textPrimary}`}>
                    Step 1: Create a GitHub Repository
                  </span>
                  <p className={`text-[10px] ${s.textMuted} leading-normal`}>
                    Create a new, empty public repository on GitHub (e.g. <code>cs601-assignment-suite</code>).
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => toggleCheck("codePushed")}
                className={`w-full text-left p-3 rounded-lg border transition-all flex items-start gap-3 cursor-pointer ${
                  checklist.codePushed 
                    ? "bg-emerald-500/5 border-emerald-500/30 text-zinc-700 dark:text-zinc-300" 
                    : `${s.cardBg} border-zinc-200/40 hover:${s.subBg}`
                }`}
              >
                <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                  checklist.codePushed ? "bg-emerald-600 border-emerald-600 text-white" : `${s.subBg} border-zinc-300`
                }`}>
                  {checklist.codePushed && <Check size={12} />}
                </div>
                <div className="space-y-0.5">
                  <span className={`text-xs font-bold block ${checklist.codePushed ? "line-through text-zinc-400" : s.textPrimary}`}>
                    Step 2: Push Local Code to Repository
                  </span>
                  <p className={`text-[10px] ${s.textMuted} leading-normal`}>
                    Initialize git in your workspace directory, add files, commit, and push your branch to GitHub.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => toggleCheck("workflowAdded")}
                className={`w-full text-left p-3 rounded-lg border transition-all flex items-start gap-3 cursor-pointer ${
                  checklist.workflowAdded 
                    ? "bg-emerald-500/5 border-emerald-500/30 text-zinc-700 dark:text-zinc-300" 
                    : `${s.cardBg} border-zinc-200/40 hover:${s.subBg}`
                }`}
              >
                <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                  checklist.workflowAdded ? "bg-emerald-600 border-emerald-600 text-white" : `${s.subBg} border-zinc-300`
                }`}>
                  {checklist.workflowAdded && <Check size={12} />}
                </div>
                <div className="space-y-0.5">
                  <span className={`text-xs font-bold block ${checklist.workflowAdded ? "line-through text-zinc-400" : s.textPrimary}`}>
                    Step 3: Deploy Workflow Configuration
                  </span>
                  <p className={`text-[10px] ${s.textMuted} leading-normal`}>
                    Verify that the deployment script is placed at <code>.github/workflows/deploy.yml</code> inside your project root.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => toggleCheck("settingsConfigured")}
                className={`w-full text-left p-3 rounded-lg border transition-all flex items-start gap-3 cursor-pointer ${
                  checklist.settingsConfigured 
                    ? "bg-emerald-500/5 border-emerald-500/30 text-zinc-700 dark:text-zinc-300" 
                    : `${s.cardBg} border-zinc-200/40 hover:${s.subBg}`
                }`}
              >
                <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                  checklist.settingsConfigured ? "bg-emerald-600 border-emerald-600 text-white" : `${s.subBg} border-zinc-300`
                }`}>
                  {checklist.settingsConfigured && <Check size={12} />}
                </div>
                <div className="space-y-0.5">
                  <span className={`text-xs font-bold block ${checklist.settingsConfigured ? "line-through text-zinc-400" : s.textPrimary}`}>
                    Step 4: Enable Actions on GitHub Pages
                  </span>
                  <p className={`text-[10px] ${s.textMuted} leading-normal`}>
                    Go to <strong>Settings → Pages</strong> on your GitHub Repo page. Under <strong>Build and deployment</strong>, select <strong>GitHub Actions</strong> as your Source.
                  </p>
                </div>
              </button>
            </div>

            <div className={`p-3 rounded border ${s.subBorder} ${s.subBg} flex items-center gap-2 text-[10px] ${s.textSecondary} transition-colors duration-300`}>
              <Sparkles size={14} className="text-amber-500 shrink-0" />
              <span>Checking these boxes stores your progress locally to guide your hosting setup!</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CODE VIEWER & GUIDELINES (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className={`${s.cardBg} border ${s.cardBorder} rounded-xl p-5 space-y-4 transition-colors duration-300`}>
            <div className="flex justify-between items-center border-b border-zinc-200/10 pb-3">
              <div>
                <h3 className={`text-xs font-bold uppercase tracking-wider ${s.textPrimary} flex items-center gap-1.5`}>
                  <Terminal size={14} className="text-zinc-400" />
                  .github/workflows/deploy.yml
                </h3>
                <p className={`text-[10px] ${s.textMuted}`}>
                  This standard automation workflow file builds and deploys your code on every push.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded transition-all cursor-pointer ${
                  copied
                    ? "bg-emerald-600 text-white border border-emerald-700"
                    : "bg-zinc-800 text-zinc-200 border border-zinc-700 hover:bg-zinc-700"
                }`}
              >
                {copied ? (
                  <>
                    <Check size={12} /> Copied!
                  </>
                ) : (
                  <>
                    <Copy size={12} /> Copy Code
                  </>
                )}
              </button>
            </div>

            <div className="relative">
              <pre className="p-4 rounded-lg bg-zinc-950 font-mono text-[10px] text-zinc-300 overflow-x-auto border border-zinc-800 max-h-[380px] leading-relaxed">
                <code>{workflowCode}</code>
              </pre>
              <div className="absolute bottom-2 right-2 pointer-events-none select-none text-[9px] font-mono bg-zinc-900/80 text-zinc-500 px-2 py-0.5 rounded border border-zinc-800">
                YAML Config
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className={`font-bold ${s.textPrimary}`}>Frequently Asked Questions:</h4>
              <ul className={`list-disc list-inside space-y-1.5 ${s.textSecondary} leading-relaxed`}>
                <li>
                  <strong className={s.textPrimary}>Do I need to change the repo name inside the code?</strong> No. The application relative asset handler (Vite's base config) dynamically handles custom subpaths natively.
                </li>
                <li>
                  <strong className={s.textPrimary}>Does this require any paid features?</strong> No! GitHub Actions and GitHub Pages are 100% free for public repositories.
                </li>
                <li>
                  <strong className={s.textPrimary}>How long does deployment take?</strong> Typically, the GitHub Action takes about 1-2 minutes to install, compile, and publish. Once complete, your site goes live instantly!
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
