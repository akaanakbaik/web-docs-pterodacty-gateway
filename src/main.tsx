import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Bot, Check, ChevronRight, Code2, Command, Copy, ExternalLink, Github, Heart, Menu, Search, Shield, Sparkles, Trash2, X, Zap } from "lucide-react";
import { NPM_PACKAGE_URL, PACKAGE_NAME, SDK_REPOSITORY_URL, SDK_VERSION, docs, docsByPath, knowledgeBase, navGroups, type DocSection, type SimulationStep } from "./data/docs";
import "./styles.css";

type ChatMessage = { role: "user" | "assistant"; content: string };
type RouteState = { path: string; doc: DocSection };
type RichPart = { type: "text"; value: string } | { type: "code"; value: string; title: string };

const defaultAssistant: ChatMessage = { role: "assistant", content: `Halo! Aku AI docs assistant untuk ${PACKAGE_NAME} v${SDK_VERSION}. Tanya install, CLI, SDK, retry, safe mode, file, backup, bot, website API, error, atau release.` };
const commandPattern = /^\s*(\$\s*)?(npm|npx|pnpm|yarn|ptero-|ptg\b|ptero-wizard|git|cd|rm|cp|mv|mkdir|curl|wget|sudo|node|tsc|vite|vercel|export|cat|grep|docker|systemctl|journalctl|chmod|chown|ls\b|which\b|echo\b|tar\b)\b/i;

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s-]/gi, " ").replace(/\s+/g, " ").trim();
}

function resolveRoute(): RouteState {
  const path = window.location.pathname === "/" ? "/docs/overview" : window.location.pathname;
  const doc = docsByPath.get(path) ?? docsByPath.get("/docs/overview") ?? docs[0];
  return { path: doc.path, doc };
}

function navigateTo(path: string) {
  const doc = docsByPath.get(path);
  if (!doc) return;
  window.history.pushState({}, "", doc.path);
  window.dispatchEvent(new PopStateEvent("popstate"));
  setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 40);
}

function scoreDoc(doc: DocSection, query: string) {
  const q = normalize(query);
  if (!q) return 1;
  const haystack = normalize([doc.path, doc.title, doc.summary, doc.beginner, ...doc.body, doc.code ?? "", doc.tags.join(" "), doc.group, ...doc.steps.map((step) => `${step.title} ${step.detail} ${step.command ?? ""}`), ...doc.examples.map((example) => `${example.title} ${example.code}`)].join(" "));
  return q.split(" ").filter(Boolean).reduce((score, term) => {
    if (normalize(doc.title).includes(term)) score += 10;
    if (normalize(doc.path).includes(term)) score += 7;
    if (doc.tags.some((tag) => normalize(tag).includes(term))) score += 6;
    if (normalize(doc.summary).includes(term)) score += 4;
    if (haystack.includes(term)) score += 1;
    return score;
  }, 0);
}

function inferCodeTitle(language: string | undefined, value: string) {
  const lang = language?.trim().toLowerCase();
  if (lang) {
    if (["bash", "sh", "shell", "zsh", "cmd", "terminal"].includes(lang)) return "command";
    if (["ts", "tsx"].includes(lang)) return "typescript";
    if (["js", "jsx"].includes(lang)) return "javascript";
    return lang;
  }
  const first = value.trim().split("\n")[0] ?? "";
  if (commandPattern.test(first)) return "command";
  if (/import\s|export\s|const\s|await\s|function\s|=>/.test(value)) return "typescript";
  if (/^\s*[{[]/.test(value)) return "json";
  return "code";
}

function splitTextAndCommandBlocks(text: string): RichPart[] {
  const parts: RichPart[] = [];
  const lines = text.split("\n");
  let buffer: string[] = [];
  let commandBuffer: string[] = [];
  const flushText = () => {
    const value = buffer.join("\n").trim();
    if (value) parts.push({ type: "text", value });
    buffer = [];
  };
  const flushCommand = () => {
    const value = commandBuffer.join("\n").trim();
    if (value) parts.push({ type: "code", value, title: "command" });
    commandBuffer = [];
  };
  for (const line of lines) {
    const isCommand = commandPattern.test(line) || (commandBuffer.length > 0 && /^\s{2,}|\\\s*$/.test(commandBuffer[commandBuffer.length - 1] ?? ""));
    if (isCommand) {
      flushText();
      commandBuffer.push(line.replace(/^\$\s*/, ""));
    } else {
      flushCommand();
      buffer.push(line);
    }
  }
  flushText();
  flushCommand();
  return parts;
}

function parseRichContent(content: string): RichPart[] {
  const parts: RichPart[] = [];
  const fence = /```([^\n`]*)\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = fence.exec(content)) !== null) {
    const before = content.slice(lastIndex, match.index);
    parts.push(...splitTextAndCommandBlocks(before));
    const value = match[2]?.trim() ?? "";
    if (value) parts.push({ type: "code", value, title: inferCodeTitle(match[1], value) });
    lastIndex = fence.lastIndex;
  }
  parts.push(...splitTextAndCommandBlocks(content.slice(lastIndex)));
  return parts;
}

function App() {
  const [route, setRoute] = useState<RouteState>(() => resolveRoute());
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeProgress, setRouteProgress] = useState(0);
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setRoute(resolveRoute());
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  useEffect(() => {
    document.title = `${route.doc.title} · Pterodactyl Gateway Docs`;
  }, [route.doc.title]);

  const filteredDocs = useMemo(() => docs.map((doc) => ({ doc, score: scoreDoc(doc, query) })).filter((entry) => entry.score > 0).sort((a, b) => b.score - a.score).map((entry) => entry.doc), [query]);

  function goTo(path: string, source: "desktop" | "mobile" | "default" = "default") {
    if (path === route.path) return;
    setRouteLoading(true);
    setRouteProgress(12);
    window.setTimeout(() => {
      navigateTo(path);
      if (source === "mobile") setMenuOpen(false);
      setRouteProgress(82);
    }, 260);
    window.setTimeout(() => { setRouteProgress(100); window.setTimeout(() => { setRouteLoading(false); setRouteProgress(0); }, 160); }, 390);
  }

  function handleSearch(value: string) {
    setQuery(value);
    const best = docs.map((doc) => ({ doc, score: scoreDoc(doc, value) })).filter((entry) => entry.score > 0).sort((a, b) => b.score - a.score)[0]?.doc;
    if (value.trim() && best && best.path !== route.path) navigateTo(best.path);
  }

  return (
    <div className="app-shell min-h-screen overflow-x-hidden bg-paper text-ink">
      <div className="motion-orb orb-clay pointer-events-none fixed left-[-7rem] top-20 h-56 w-56 rounded-full bg-clay/10 blur-3xl sm:h-64 sm:w-64" />
      <div className="motion-orb orb-sage pointer-events-none fixed right-[-8rem] top-40 h-56 w-56 rounded-full bg-sage/10 blur-3xl sm:h-72 sm:w-72" />
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} routeLoading={routeLoading} routeProgress={routeProgress} goTo={goTo} />
      <main className="relative mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 px-3 pb-8 pt-20 sm:px-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-5 lg:px-6 lg:pb-12 lg:pt-24">
        <section className="min-w-0 space-y-4 overflow-hidden">
          {route.path === "/docs/overview" && <Hero />}
          <div className="lg:hidden"><SearchBox query={query} setQuery={handleSearch} /></div>
          <QuickStats />
          <DocsPage doc={route.doc} filteredDocs={filteredDocs} />
          <Footer />
        </section>
        <aside className="hidden min-w-0 lg:block"><Sidebar query={query} setQuery={handleSearch} activePath={route.path} filteredDocs={filteredDocs} onNavigate={(path) => goTo(path, "desktop")} /></aside>
      </main>
      <FloatingAssistant activeDoc={route.doc} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} query={query} setQuery={handleSearch} activePath={route.path} filteredDocs={filteredDocs} onNavigate={(path) => goTo(path, "mobile")} />
    </div>
  );
}

function Header({ menuOpen, setMenuOpen, routeLoading, routeProgress, goTo }: { menuOpen: boolean; setMenuOpen: (value: boolean) => void; routeLoading: boolean; routeProgress: number; goTo: (path: string) => void }) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-line/80 bg-paper/82 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-3 sm:px-5 lg:px-6">
        <button className="min-w-0 flex items-center gap-2 text-left" onClick={() => goTo("/docs/overview")} aria-label="Akadev Pterodactyl Gateway Docs">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-line bg-card shadow-hair"><img src="/manus-storage/pterodactyl-gateway-docs-logo_71d25669.png" alt="" className="h-7 w-7 object-contain" onError={(event) => { event.currentTarget.src = "/icon.svg"; }} /></span>
          <span className="min-w-0 leading-tight"><span className="block truncate text-sm font-extrabold tracking-tight sm:text-base">Pterodactyl Gateway</span><span className="hidden text-[11px] font-medium text-muted sm:block">Stable npm docs · v{SDK_VERSION}</span></span>
        </button>
        <nav className="hidden items-center gap-2 md:flex">
          <button className="rounded-full px-3 py-2 text-xs font-semibold text-muted transition hover:bg-card hover:text-ink" onClick={() => goTo("/docs/install")}>Install</button>
          <button className="rounded-full px-3 py-2 text-xs font-semibold text-muted transition hover:bg-card hover:text-ink" onClick={() => goTo("/docs/integrations/telegram-bot")}>Integrasi</button>
          <button className="rounded-full px-3 py-2 text-xs font-semibold text-muted transition hover:bg-card hover:text-ink" onClick={() => window.dispatchEvent(new Event("open-ai"))}>AI</button>
          <a className="rounded-full px-3 py-2 text-xs font-semibold text-muted transition hover:bg-card hover:text-ink" href={NPM_PACKAGE_URL} target="_blank" rel="noreferrer">npm</a>
          <a className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-2 text-xs font-bold shadow-hair transition hover:border-clay/40" href={SDK_REPOSITORY_URL} target="_blank" rel="noreferrer"><Github className="h-3.5 w-3.5" /> GitHub</a>
        </nav>
        <button className="focus-ring grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-line bg-card md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open menu">{menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button>
      </div>
      <AnimatePresence>{routeLoading && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-[3px] w-full bg-white/5"><div className="route-progress h-full bg-gradient-to-r from-clay via-sage to-clay" style={{ transform: `scaleX(${routeProgress / 100})` }} /></motion.div>}</AnimatePresence>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero-card premium-card overflow-hidden rounded-[1.6rem] p-4 sm:rounded-[2rem] sm:p-8 lg:p-10">
      <div className="hero-image" aria-hidden="true" />
      <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,0.52fr)] lg:items-end">
        <div className="max-w-3xl">
          <div className="hero-motif" aria-hidden="true"><span /><span /><span /></div>
          <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-line bg-card/88 px-3 py-1.5 text-xs font-bold text-slate shadow-hair"><Sparkles className="h-3.5 w-3.5 shrink-0 text-clay" /><span className="truncate">npm stable v{SDK_VERSION} · field-tested docs</span></div>
          <h1 className="max-w-3xl text-3xl font-extrabold tracking-[-0.045em] text-ink sm:text-5xl lg:text-6xl">Dari API key ke panel yang bisa diuji.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-base">Manual operasional untuk SDK TypeScript, CLI, provisioning, file manager, retry safety, safe mode, integrasi bot, dan deployment backend Pterodactyl.</p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <button onClick={() => navigateTo("/docs/install")} className="focus-ring inline-flex items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-bold text-white shadow-soft transition hover:translate-y-[-1px]">Buka quick start <ArrowRight className="h-4 w-4" /></button>
            <a href={NPM_PACKAGE_URL} target="_blank" rel="noreferrer" className="focus-ring inline-flex items-center justify-center gap-2 rounded-2xl border border-line bg-card px-4 py-3 text-sm font-bold text-ink shadow-hair transition hover:border-clay/40">Lihat package npm <ExternalLink className="h-4 w-4" /></a>
          </div>
        </div>
        <div className="hidden overflow-hidden rounded-[1.35rem] border border-line/80 bg-card/88 p-2 shadow-soft lg:block">
          <img src="/manus-storage/pterodactyl-gateway-docs-system_25489541.jpg" alt="Diagram abstrak hubungan API, CLI, dan server" className="aspect-[4/3] w-full rounded-[1rem] object-cover opacity-90" onError={(event) => { event.currentTarget.src = "/icon.svg"; }} />
          <div className="flex items-center justify-between gap-3 px-2 pb-1 pt-3 text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted"><span>system map</span><span className="text-sage">verified</span></div>
        </div>
      </div>
    </section>
  );
}

function QuickStats() {
  const items = [
    { icon: Code2, label: "Docs", value: "operational map", tone: "clay", action: () => navigateTo("/docs/overview") },
    { icon: Command, label: "Install", value: "npm v1.4.2", tone: "ink", action: () => navigateTo("/docs/install") },
    { icon: Bot, label: "Assistant", value: "docs-aware", tone: "sage", action: () => window.dispatchEvent(new Event("open-ai")) },
    { icon: Shield, label: "Guard", value: "safe by default", tone: "slate", action: () => navigateTo("/docs/security") }
  ];
  return <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{items.map((item) => <button key={item.label} onClick={item.action} className={`stat-card stat-${item.tone} min-w-0 p-3 text-left transition hover:-translate-y-0.5 sm:p-4`}><item.icon className="mb-3 h-4 w-4" /><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted sm:text-[11px]">{item.label}</p><p className="mt-1 truncate text-xs font-extrabold text-ink sm:text-sm">{item.value}</p></button>)}</div>;
}

type SidebarProps = { query: string; setQuery: (value: string) => void; activePath: string; filteredDocs: DocSection[]; onNavigate?: (path: string) => void };

function visibleDocs(docsList: DocSection[]) {
  return docsList.filter((doc) => doc.group !== "Legal");
}

function Sidebar(props: SidebarProps) {
  const list = visibleDocs(props.filteredDocs);
  return (
    <div className="sidebar-shell sticky top-24 max-h-[calc(100vh-7rem)] overflow-hidden rounded-[1.5rem] border border-line bg-card/88 p-3 shadow-soft backdrop-blur-xl">
      <SearchBox query={props.query} setQuery={props.setQuery} />
      <div className="sidebar-scroll mt-3 max-h-[calc(100vh-13rem)] space-y-4 overflow-y-auto overscroll-contain pr-1 scrollbar-thin">
        {navGroups.filter((group) => group !== "Legal").map((group) => <div key={group}><p className="px-2 pb-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-muted">{group}</p><div className="space-y-1">{list.filter((doc) => doc.group === group).map((doc) => <DocNavButton key={doc.path} doc={doc} active={doc.path === props.activePath} onNavigate={props.onNavigate} />)}</div></div>)}
      </div>
    </div>
  );
}

function SearchBox({ query, setQuery }: { query: string; setQuery: (value: string) => void }) {
  return <label className="relative block min-w-0"><span className="sr-only">Cari dokumentasi</span><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><input aria-label="Cari dokumentasi" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari: retry, telegram, install..." className="focus-ring h-11 w-full min-w-0 rounded-2xl border border-line bg-card/70 pl-9 pr-3 text-sm font-semibold text-ink outline-none transition placeholder:text-muted/70" /></label>;
}

function DocNavButton({ doc, active, onNavigate }: { doc: DocSection; active: boolean; onNavigate?: (path: string) => void }) {
  return <button onClick={() => (onNavigate ? onNavigate(doc.path) : navigateTo(doc.path))} className={`focus-ring w-full min-w-0 rounded-2xl px-3 py-2.5 text-left transition ${active ? "bg-ink text-white shadow-soft" : "text-muted hover:bg-paper hover:text-ink"}`}><span className="flex min-w-0 items-center justify-between gap-2 text-xs font-extrabold"><span className="min-w-0 truncate">{doc.title}</span><ChevronRight className="h-3.5 w-3.5 shrink-0" /></span><span className={`mt-1 line-clamp-2 block text-[11px] leading-5 ${active ? "text-white/72" : "text-muted"}`}>{doc.summary}</span></button>;
}

function DocsPage({ doc, filteredDocs }: { doc: DocSection; filteredDocs: DocSection[] }) {
  return (
    <section className="min-w-0 space-y-4 overflow-hidden">
      <AnimatePresence mode="wait"><motion.article key={doc.path} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }} className="doc-card premium-card min-w-0 overflow-hidden rounded-[1.6rem] p-4 sm:rounded-[2rem] sm:p-7" data-group={doc.group}>
        <div className="mb-4 flex min-w-0 flex-wrap items-center gap-2"><span className="rounded-full border border-line bg-paper px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted">{doc.group}</span><span className="max-w-full truncate rounded-full bg-sage/10 px-2.5 py-1 text-[11px] font-bold text-sage">{doc.path}</span>{doc.tags.slice(0, 3).map((tag) => <span key={tag} className="max-w-full truncate rounded-full bg-clay/10 px-2.5 py-1 text-[11px] font-bold text-clay">{tag}</span>)}</div>
        <h1 className="break-words text-2xl font-extrabold tracking-[-0.035em] sm:text-4xl">{doc.title}</h1>
        <p className="mt-3 text-sm font-semibold leading-7 text-muted sm:text-base">{doc.summary}</p>
        <div className="mt-4 rounded-2xl border border-line bg-card/70 p-4 text-sm font-semibold leading-7 text-slate"><Zap className="mb-2 h-4 w-4 text-clay" /> {doc.beginner}</div>
        <div className="prose-doc mt-5 space-y-4 text-sm sm:text-base">{doc.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        <TutorialSteps steps={doc.steps} />
        <TerminalSimulation steps={doc.simulation} />
        {doc.code && <CopyableBlock code={doc.code} label="main example" />}
        <Examples examples={doc.examples} />
      </motion.article></AnimatePresence>
      <NextDocs current={doc} filteredDocs={visibleDocs(filteredDocs)} />
    </section>
  );
}

function TutorialSteps({ steps }: { steps: DocSection["steps"] }) {
  return <div className="mt-6 grid gap-2"><h2 className="text-lg font-extrabold tracking-[-0.02em]">Langkah tutorial</h2>{steps.map((step, index) => <motion.div key={step.title} initial={{ opacity: 0, x: -6 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "0px 0px -10% 0px" }} transition={{ delay: index * 0.035, duration: 0.18, ease: [0.23, 1, 0.32, 1] }} className="min-w-0 overflow-hidden rounded-2xl border border-line bg-card p-4 shadow-hair"><div className="flex min-w-0 gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-ink text-xs font-extrabold text-white">{index + 1}</span><div className="min-w-0 flex-1"><h3 className="break-words text-sm font-extrabold">{step.title}</h3><p className="mt-1 text-sm leading-6 text-muted">{step.detail}</p>{step.command && <CopyableBlock code={step.command} compact label="command" />}</div></div></motion.div>)}</div>;
}

function TerminalSimulation({ steps }: { steps: SimulationStep[] }) {
  const [active, setActive] = useState(0);
  const [typed, setTyped] = useState("");
  const [showOutput, setShowOutput] = useState(false);
  const step = steps[active] ?? steps[0];
  const realOutput = (command: string) => {
    const cmd = command.toLowerCase();
    if (cmd.includes("self-check") || cmd.includes("version")) return `ptero-gateway self-check
@akaanakbaik/pterodactyl-gateway@${SDK_VERSION}
Self-check: OK
Mode: installed
✓ package.json: /usr/lib/node_modules/@akaanakbaik/pterodactyl-gateway/package.json
✓ package-lock.json: not included in installed npm package; source-only check skipped
✓ name: @akaanakbaik/pterodactyl-gateway
✓ version: ${SDK_VERSION}
✓ lock version: skipped
✓ root lock version: skipped
✓ bin ptero-gateway: dist/cli-entry.js
✓ bin ptg: dist/cli-entry.js
✓ bin ptero-wizard: dist/wizard-cli.js
✓ prepublishOnly: npm run verify
✓ node >=18: v22.22.2`;
    if (cmd.includes("npm i") || cmd.includes("npm install")) return "added 1 package in 1s\nfound 0 vulnerabilities";
    return step?.result ?? "Command completed successfully.";
  };
  useEffect(() => {
    if (!step) return;
    setTyped(""); setShowOutput(false);
    let i = 0;
    const iv = window.setInterval(() => {
      i += 1; setTyped(step.terminal.slice(0, i));
      if (i >= step.terminal.length) { window.clearInterval(iv); window.setTimeout(() => setShowOutput(true), 520); }
    }, 42);
    return () => window.clearInterval(iv);
  }, [active, step]);
  if (!step) return null;
  return <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-line bg-[#0f1117] shadow-soft"><div className="flex items-center justify-between border-b border-white/10 px-3 py-2.5"><div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-red-400/80" /><span className="h-2.5 w-2.5 rounded-full bg-yellow-300/80" /><span className="h-2.5 w-2.5 rounded-full bg-green-400/80" /><span className="ml-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/45">live debug output</span></div><button onClick={() => navigator.clipboard.writeText(step.terminal)} className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-2.5 py-1 text-[11px] font-bold text-white/80 transition hover:bg-white/14"><Copy className="h-3.5 w-3.5" /> Copy cmd</button></div><div className="p-4"><div className="mb-3 flex flex-wrap gap-1.5">{steps.map((item, index) => <button key={item.label} onClick={() => setActive(index)} className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition ${index === active ? "bg-clay text-white" : "bg-white/8 text-white/55 hover:bg-white/12"}`}>{index + 1}. {item.label}</button>)}</div><div className="rounded-2xl border border-white/15 bg-[#070b14] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"><pre className="max-w-full overflow-x-auto whitespace-pre-wrap break-words text-[12px] leading-6 text-[#e7ebf7] scrollbar-thin"><code><span className="text-emerald-300">root@9080d1eda66d18</span><span className="text-white/45">:~# </span>{typed}<span className="terminal-cursor">▍</span>{showOutput ? `
${realOutput(step.terminal)}` : ""}</code></pre><div className="my-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="terminal-progress h-full rounded-full bg-clay" /></div></div></div></div>;
}

function Examples({ examples }: { examples: DocSection["examples"] }) {
  return <div className="mt-6 grid gap-3"><h2 className="text-lg font-extrabold tracking-[-0.02em]">Contoh penggunaan</h2>{examples.map((example) => <CopyableBlock key={example.title} code={example.code} label={example.title} />)}</div>;
}

function NextDocs({ current, filteredDocs }: { current: DocSection; filteredDocs: DocSection[] }) {
  const related = filteredDocs.filter((doc) => doc.path !== current.path).slice(0, 6);
  return <div className="grid min-w-0 gap-2 md:grid-cols-2">{related.map((doc) => <button key={doc.path} onClick={() => navigateTo(doc.path)} className="glass-line focus-ring min-w-0 rounded-2xl p-4 text-left transition hover:border-clay/40 hover:bg-card"><p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted">{doc.group}</p><h3 className="mt-2 break-words text-sm font-extrabold text-ink">{doc.title}</h3><p className="mt-2 line-clamp-2 text-xs leading-5 text-muted">{doc.summary}</p></button>)}</div>;
}

function CopyableBlock({ code, label = "code", compact = false }: { code: string; label?: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false);
  async function copy() { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1400); }
  return <div className={`${compact ? "mt-3" : "mt-4"} min-w-0 overflow-hidden rounded-2xl border border-line bg-[#0d1421] shadow-soft`}><div className="flex min-w-0 items-center justify-between gap-2 border-b border-white/10 px-3 py-2"><span className="min-w-0 truncate text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">{label}</span><button onClick={copy} className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/8 px-2.5 py-1 text-[11px] font-bold text-white/80 transition hover:bg-white/14">{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? "Copied" : "Copy"}</button></div><pre className={`${compact ? "max-h-48" : "max-h-[420px]"} max-w-full overflow-auto whitespace-pre-wrap break-words p-4 text-[12px] leading-6 text-[#dde7ff] scrollbar-thin`}><code>{code}</code></pre></div>;
}

function renderInline(value: string) {
  return value.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean).map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) return <code key={`${part}-${index}`} className="assistant-inline-code">{part.slice(1, -1)}</code>;
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    return <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>;
  });
}

function MarkdownText({ value }: { value: string }) {
  return <div className="assistant-markdown">{value.split("\n").map((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={`space-${index}`} className="h-1.5" />;
    if (trimmed.startsWith("### ")) return <h4 key={index}>{renderInline(trimmed.slice(4))}</h4>;
    if (trimmed.startsWith("## ")) return <h3 key={index}>{renderInline(trimmed.slice(3))}</h3>;
    if (trimmed.startsWith("# ")) return <h3 key={index}>{renderInline(trimmed.slice(2))}</h3>;
    if (/^[-*]\s+/.test(trimmed)) return <div key={index} className="assistant-list-row"><span className="assistant-list-mark">•</span><span>{renderInline(trimmed.replace(/^[-*]\s+/, ""))}</span></div>;
    if (/^\d+\.\s+/.test(trimmed)) return <div key={index} className="assistant-list-row"><span className="assistant-list-mark">{trimmed.match(/^\d+/)?.[0]}</span><span>{renderInline(trimmed.replace(/^\d+\.\s+/, ""))}</span></div>;
    return <p key={index}>{renderInline(trimmed)}</p>;
  })}</div>;
}

function RichMessage({ content }: { content: string }) {
  return <div className="space-y-2">{parseRichContent(content).map((part, index) => part.type === "code" ? <CopyableBlock key={index} code={part.value} label={part.title} compact /> : <MarkdownText key={index} value={part.value} />)}</div>;
}

async function readAiResponse(response: Response): Promise<{ answer?: string }> {
  const raw = await response.text();
  if (!raw.trim()) return {};
  try {
    return JSON.parse(raw) as { answer?: string };
  } catch {
    return { answer: response.ok ? "AI mengembalikan respons yang tidak dapat dibaca." : "AI sedang tidak tersedia. Gunakan search lokal atau baca halaman troubleshooting." };
  }
}

function FloatingAssistant({ activeDoc }: { activeDoc: DocSection }) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([defaultAssistant]);
  useEffect(() => { const handler = () => setOpen(true); window.addEventListener("open-ai", handler); return () => window.removeEventListener("open-ai", handler); }, []);
  async function ask(customQuestion?: string) {
    const text = (customQuestion ?? question).trim();
    if (!text || loading) return;
    setOpen(true); setQuestion(""); setMessages((prev) => [...prev, { role: "user", content: text }]); setLoading(true);
    try {
      const response = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: text, context: knowledgeBase.slice(0, 60000) }) });
      const data = await readAiResponse(response);
      if (!response.ok) throw new Error(data.answer ?? "AI sedang tidak tersedia.");
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer?.trim() || "AI belum mengembalikan jawaban." }]);
    } catch (error) { setMessages((prev) => [...prev, { role: "assistant", content: error instanceof Error && error.message ? error.message : "AI sedang tidak tersedia. Gunakan search lokal atau baca halaman troubleshooting." }]); }
    finally { setLoading(false); }
  }
  const suggestions = [`Ringkas ${activeDoc.title}`, "Contoh integrasi Telegram", "Kenapa DOCKER_IMAGE_NOT_FOUND?", "Cara deploy di Vercel"];
  return <div className="fixed bottom-3 left-3 right-3 z-50 flex flex-col items-end sm:bottom-5 sm:left-auto sm:right-5"><AnimatePresence>{open && <motion.div initial={{ opacity: 0, y: 10, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.985 }} transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }} className="mb-3 w-full max-w-[360px] overflow-hidden rounded-[1.6rem] border border-line bg-card/95 p-3 shadow-soft backdrop-blur-xl sm:p-4"><div className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-muted">AI docs assistant</p><h2 className="truncate text-sm font-extrabold">Tanya Pterodactyl Gateway</h2></div><div className="flex shrink-0 gap-1.5"><button title="Clear chat" onClick={() => setMessages([defaultAssistant])} className="grid h-8 w-8 place-items-center rounded-xl border border-line bg-paper text-muted hover:text-ink"><Trash2 className="h-4 w-4" /></button><button onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-xl border border-line bg-paper"><X className="h-4 w-4" /></button></div></div><div className="mt-3 h-[272px] space-y-2 overflow-y-auto overscroll-contain pr-1 scrollbar-thin" aria-live="polite" aria-busy={loading}>{messages.map((message, index) => <div key={`${message.role}-${index}`} className={`chat-bubble ${message.role === "user" ? "chat-bubble-user ml-8" : "chat-bubble-assistant mr-0 sm:mr-6"}`}><span className="chat-bubble-label">{message.role === "user" ? "Anda" : "AI docs assistant"}</span><RichMessage content={message.content} /></div>)}{loading && <div className="chat-bubble chat-bubble-assistant mr-6"><span className="chat-bubble-label">AI docs assistant</span><div className="chat-loading"><span /> <span /> <span /></div></div>}</div><div className="chat-composer mt-3"><span className="chat-composer-mark" aria-hidden="true">›</span><input aria-label="Tulis pertanyaan ke AI docs assistant" value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => event.key === "Enter" && ask()} placeholder="Tanya docs..." className="focus-ring min-w-0 flex-1 bg-transparent px-1 py-2.5 text-sm font-semibold outline-none placeholder:text-muted/70" /><button onClick={() => ask()} disabled={loading} className="focus-ring shrink-0 rounded-xl bg-ink px-3 py-2 text-sm font-bold text-white disabled:opacity-50">Ask</button></div><div className="mt-2 flex flex-wrap gap-1.5">{suggestions.map((item) => <button key={item} onClick={() => ask(item)} className="rounded-full border border-line bg-paper px-2.5 py-1 text-[11px] font-bold text-muted transition hover:border-clay/40 hover:text-ink">{item}</button>)}</div></motion.div>}</AnimatePresence><button onClick={() => setOpen((value) => !value)} aria-label="Buka AI docs assistant" className="focus-ring flex h-13 w-13 items-center justify-center rounded-2xl bg-ink p-4 text-white shadow-soft transition hover:translate-y-[-2px] sm:h-14 sm:w-14"><Bot className="h-6 w-6" /></button></div>;
}

function MobileMenu({ open, onClose, ...props }: SidebarProps & { open: boolean; onClose: () => void }) {
  return <AnimatePresence>{open && <motion.div className="fixed inset-0 z-50 bg-ink/30 p-3 backdrop-blur-sm lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.div initial={{ x: -24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -24, opacity: 0 }} className="h-full max-w-[min(24rem,calc(100vw-1.5rem))] overflow-hidden rounded-[1.5rem] bg-paper p-3 shadow-soft"><div className="mb-3 flex items-center justify-between"><span className="text-sm font-extrabold">Docs menu</span><button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-card"><X className="h-4 w-4" /></button></div><Sidebar {...props} activePath={props.activePath} setQuery={props.setQuery} /></motion.div></motion.div>}</AnimatePresence>;
}

function Footer() {
  return <footer className="glass-line mb-20 mt-4 rounded-[1.5rem] p-4 text-center shadow-hair sm:mb-4"><p className="text-sm font-extrabold text-ink">Maintained by Akadev</p><p className="mt-1 flex items-center justify-center gap-1 text-xs font-semibold text-muted">Operational docs for production systems <Heart className="h-3.5 w-3.5 fill-clay text-clay" /></p><div className="mt-3 flex flex-wrap justify-center gap-2"><button onClick={() => navigateTo("/privacy")} className="rounded-full border border-line bg-card px-3 py-2 text-xs font-bold text-muted transition hover:border-clay/40 hover:text-ink">Privacy</button><button onClick={() => navigateTo("/terms")} className="rounded-full border border-line bg-card px-3 py-2 text-xs font-bold text-muted transition hover:border-clay/40 hover:text-ink">Terms</button><a href={NPM_PACKAGE_URL} target="_blank" rel="noreferrer" className="rounded-full border border-line bg-ink px-3 py-2 text-xs font-bold text-white transition hover:translate-y-[-1px]">npm package</a></div></footer>;
}

createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
