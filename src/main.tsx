import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Bot, Check, ChevronRight, Code2, Command, Copy, ExternalLink, Github, Menu, Search, Shield, Sparkles, Terminal, X, Zap } from "lucide-react";
import { docs, docsByPath, knowledgeBase, navGroups, type DocSection } from "./data/docs";
import "./styles.css";

type ChatMessage = { role: "user" | "assistant"; content: string };

type RouteState = { path: string; doc: DocSection };

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s-]/gi, " ").replace(/\s+/g, " ").trim();
}

function resolveRoute(): RouteState {
  const path = window.location.pathname === "/" ? "/docs/overview" : window.location.pathname;
  const doc = docsByPath.get(path) ?? docsByPath.get("/docs/overview") ?? docs[0];
  return { path: doc.path, doc };
}

function scoreDoc(doc: DocSection, query: string) {
  const q = normalize(query);
  if (!q) return 1;
  const haystack = normalize([
    doc.path,
    doc.title,
    doc.summary,
    doc.beginner,
    ...doc.body,
    doc.code ?? "",
    doc.tags.join(" "),
    doc.group,
    ...doc.steps.map((step) => `${step.title} ${step.detail} ${step.command ?? ""}`),
    ...doc.examples.map((example) => `${example.title} ${example.code}`)
  ].join(" "));
  const terms = q.split(" ").filter(Boolean);
  let score = 0;
  for (const term of terms) {
    if (normalize(doc.title).includes(term)) score += 10;
    if (normalize(doc.path).includes(term)) score += 7;
    if (doc.tags.some((tag) => normalize(tag).includes(term))) score += 6;
    if (normalize(doc.summary).includes(term)) score += 4;
    if (haystack.includes(term)) score += 1;
  }
  return score;
}

function navigateTo(path: string) {
  const doc = docsByPath.get(path);
  if (!doc) return;
  window.history.pushState({}, "", doc.path);
  window.dispatchEvent(new PopStateEvent("popstate"));
  setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 30);
}

function App() {
  const [route, setRoute] = useState<RouteState>(() => resolveRoute());
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 900], [0, -80]);
  const y2 = useTransform(scrollY, [0, 900], [0, 64]);

  useEffect(() => {
    const handler = () => setRoute(resolveRoute());
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  useEffect(() => {
    document.title = `${route.doc.title} · Pterodactyl Gateway Docs`;
  }, [route.doc.title]);

  const filteredDocs = useMemo(() => {
    return docs
      .map((doc) => ({ doc, score: scoreDoc(doc, query) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.doc);
  }, [query]);

  function handleSearch(value: string) {
    setQuery(value);
    const best = docs
      .map((doc) => ({ doc, score: scoreDoc(doc, value) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)[0]?.doc;
    if (value.trim() && best && best.path !== route.path) navigateTo(best.path);
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-paper text-ink">
      <motion.div style={{ y: y1 }} className="pointer-events-none fixed left-[-6rem] top-20 h-64 w-64 rounded-full bg-clay/10 blur-3xl" />
      <motion.div style={{ y: y2 }} className="pointer-events-none fixed right-[-7rem] top-40 h-72 w-72 rounded-full bg-sage/10 blur-3xl" />
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main className="relative mx-auto grid max-w-7xl grid-cols-1 gap-4 px-3 pb-28 pt-20 sm:px-5 lg:grid-cols-[290px_minmax(0,1fr)] lg:gap-5 lg:px-6 lg:pt-24">
        <aside className="hidden lg:block">
          <Sidebar query={query} setQuery={handleSearch} activePath={route.path} filteredDocs={filteredDocs} />
        </aside>
        <section className="min-w-0 space-y-4">
          {route.path === "/docs/overview" && <Hero onStart={() => navigateTo("/docs/install")} />}
          <MobileSearch query={query} setQuery={handleSearch} />
          <QuickStats />
          <DocsPage doc={route.doc} filteredDocs={filteredDocs} />
        </section>
      </main>
      <FloatingAssistant activeDoc={route.doc} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} query={query} setQuery={handleSearch} activePath={route.path} filteredDocs={filteredDocs} />
    </div>
  );
}

function Header({ menuOpen, setMenuOpen }: { menuOpen: boolean; setMenuOpen: (value: boolean) => void }) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-line/80 bg-paper/82 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-5 lg:px-6">
        <button className="flex items-center gap-2 text-left" onClick={() => navigateTo("/docs/overview")} aria-label="Akadev Pterodactyl Gateway Docs">
          <span className="grid h-8 w-8 place-items-center rounded-xl border border-line bg-card shadow-hair">
            <Terminal className="h-4 w-4 text-clay" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-extrabold tracking-tight sm:text-base">Pterodactyl Gateway</span>
            <span className="hidden text-[11px] font-medium text-muted sm:block">Stable npm docs · v1.0.1</span>
          </span>
        </button>
        <nav className="hidden items-center gap-2 md:flex">
          <button className="rounded-full px-3 py-2 text-xs font-semibold text-muted transition hover:bg-card hover:text-ink" onClick={() => navigateTo("/docs/install")}>Install</button>
          <button className="rounded-full px-3 py-2 text-xs font-semibold text-muted transition hover:bg-card hover:text-ink" onClick={() => navigateTo("/docs/integrations/telegram-bot")}>Integrasi</button>
          <button className="rounded-full px-3 py-2 text-xs font-semibold text-muted transition hover:bg-card hover:text-ink" onClick={() => navigateTo("/privacy")}>Privasi</button>
          <a className="rounded-full px-3 py-2 text-xs font-semibold text-muted transition hover:bg-card hover:text-ink" href="https://www.npmjs.com/package/@akaanakbaik/pterodactyl-gateway" target="_blank" rel="noreferrer">npm</a>
          <a className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-2 text-xs font-bold shadow-hair transition hover:border-clay/40" href="https://github.com/akaanakbaik/pterodactyl-gateway" target="_blank" rel="noreferrer">
            <Github className="h-3.5 w-3.5" /> GitHub
          </a>
        </nav>
        <button className="focus-ring grid h-9 w-9 place-items-center rounded-xl border border-line bg-card md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open menu">
          {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}

function Hero({ onStart }: { onStart: () => void }) {
  return (
    <section className="premium-card soft-grid overflow-hidden rounded-[2rem] p-5 sm:p-8 lg:p-10">
      <div className="max-w-3xl">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-card/80 px-3 py-1.5 text-xs font-bold text-slate shadow-hair">
          <Sparkles className="h-3.5 w-3.5 text-clay" /> npm stable first · SEO ready docs
        </div>
        <h1 className="max-w-3xl text-3xl font-extrabold tracking-[-0.045em] text-ink sm:text-5xl lg:text-6xl">
          Dokumentasi web resmi untuk Akadev Pterodactyl Gateway.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-base">
          Tutorial dibuat per halaman agar pemula bisa fokus: install, config, CLI, SDK, Telegram bot, WhatsApp bot, Discord bot, website API, security, troubleshooting, privacy, dan terms.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button onClick={onStart} className="focus-ring inline-flex items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-bold text-white shadow-soft transition hover:translate-y-[-1px]">
            Mulai tutorial <ArrowRight className="h-4 w-4" />
          </button>
          <a href="https://www.npmjs.com/package/@akaanakbaik/pterodactyl-gateway" target="_blank" rel="noreferrer" className="focus-ring inline-flex items-center justify-center gap-2 rounded-2xl border border-line bg-card px-4 py-3 text-sm font-bold text-ink shadow-hair transition hover:border-clay/40">
            Install dari npm <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

function QuickStats() {
  const items = [
    { icon: Code2, label: "Docs", value: "per path" },
    { icon: Command, label: "Install", value: "npm stable" },
    { icon: Bot, label: "AI", value: "floating popup" },
    { icon: Shield, label: "Guard", value: "safe default" }
  ];
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map((item) => (
        <button key={item.label} onClick={() => item.label === "Install" ? navigateTo("/docs/install") : item.label === "AI" ? window.dispatchEvent(new Event("open-ai")) : navigateTo("/docs/overview")} className="glass-line rounded-2xl p-3 text-left shadow-hair transition hover:border-clay/40 hover:bg-card sm:p-4">
          <item.icon className="mb-3 h-4 w-4 text-clay" />
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">{item.label}</p>
          <p className="mt-1 text-xs font-extrabold text-ink sm:text-sm">{item.value}</p>
        </button>
      ))}
    </div>
  );
}

type SidebarProps = {
  query: string;
  setQuery: (value: string) => void;
  activePath: string;
  filteredDocs: DocSection[];
};

function Sidebar(props: SidebarProps) {
  return (
    <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-hidden rounded-[1.5rem] border border-line bg-card/78 p-3 shadow-soft backdrop-blur-xl">
      <SearchBox query={props.query} setQuery={props.setQuery} />
      <div className="mt-3 max-h-[calc(100vh-13rem)] space-y-4 overflow-y-auto pr-1 scrollbar-thin">
        {navGroups.map((group) => (
          <div key={group}>
            <p className="px-2 pb-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-muted">{group}</p>
            <div className="space-y-1">
              {props.filteredDocs.filter((doc) => doc.group === group).map((doc) => <DocNavButton key={doc.path} doc={doc} active={doc.path === props.activePath} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SearchBox({ query, setQuery }: { query: string; setQuery: (value: string) => void }) {
  return (
    <label className="relative block">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari: telegram, install, domain, docker..." className="focus-ring h-11 w-full rounded-2xl border border-line bg-paper/80 pl-9 pr-3 text-sm font-semibold outline-none transition placeholder:text-muted/70" />
    </label>
  );
}

function MobileSearch({ query, setQuery }: { query: string; setQuery: (value: string) => void }) {
  return <div className="lg:hidden"><SearchBox query={query} setQuery={setQuery} /></div>;
}

function DocNavButton({ doc, active }: { doc: DocSection; active: boolean }) {
  return (
    <button onClick={() => navigateTo(doc.path)} className={`focus-ring w-full rounded-2xl px-3 py-2.5 text-left transition ${active ? "bg-ink text-white shadow-soft" : "text-muted hover:bg-paper hover:text-ink"}`}>
      <span className="flex items-center justify-between gap-2 text-xs font-extrabold"><span>{doc.title}</span><ChevronRight className="h-3.5 w-3.5 shrink-0" /></span>
      <span className={`mt-1 line-clamp-2 block text-[11px] leading-5 ${active ? "text-white/72" : "text-muted"}`}>{doc.summary}</span>
    </button>
  );
}

function DocsPage({ doc, filteredDocs }: { doc: DocSection; filteredDocs: DocSection[] }) {
  return (
    <section className="space-y-4">
      <AnimatePresence mode="wait">
        <motion.article key={doc.path} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }} className="premium-card rounded-[2rem] p-5 sm:p-7">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-line bg-paper px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted">{doc.group}</span>
            <span className="rounded-full bg-sage/10 px-2.5 py-1 text-[11px] font-bold text-sage">{doc.path}</span>
            {doc.tags.slice(0, 4).map((tag) => <span key={tag} className="rounded-full bg-clay/10 px-2.5 py-1 text-[11px] font-bold text-clay">{tag}</span>)}
          </div>
          <h1 className="text-2xl font-extrabold tracking-[-0.035em] sm:text-4xl">{doc.title}</h1>
          <p className="mt-3 text-sm font-semibold leading-7 text-muted sm:text-base">{doc.summary}</p>
          <div className="mt-4 rounded-2xl border border-line bg-paper p-4 text-sm font-semibold leading-7 text-slate">
            <Zap className="mb-2 h-4 w-4 text-clay" /> {doc.beginner}
          </div>
          <div className="prose-doc mt-5 space-y-4 text-sm sm:text-base">
            {doc.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <TutorialSteps steps={doc.steps} />
          <Simulation steps={doc.simulation} />
          {doc.code && <CodeBlock code={doc.code} label="main example" />}
          <Examples examples={doc.examples} />
        </motion.article>
      </AnimatePresence>
      <NextDocs current={doc} filteredDocs={filteredDocs} />
    </section>
  );
}

function TutorialSteps({ steps }: { steps: DocSection["steps"] }) {
  return (
    <div className="mt-6 grid gap-2">
      <h2 className="text-lg font-extrabold tracking-[-0.02em]">Langkah tutorial</h2>
      {steps.map((step, index) => (
        <motion.div key={step.title} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }} className="rounded-2xl border border-line bg-card p-4 shadow-hair">
          <div className="flex gap-3">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-ink text-xs font-extrabold text-white">{index + 1}</span>
            <div className="min-w-0">
              <h3 className="text-sm font-extrabold">{step.title}</h3>
              <p className="mt-1 text-sm leading-6 text-muted">{step.detail}</p>
              {step.command && <CodeBlock code={step.command} compact label="command" />}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function Simulation({ steps }: { steps: DocSection["simulation"] }) {
  return (
    <div className="mt-6 rounded-[1.5rem] border border-line bg-[#151412] p-3 shadow-soft sm:p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/45">smooth simulation</p>
          <h2 className="text-sm font-extrabold text-white">Alur penggunaan sampai selesai</h2>
        </div>
        <span className="rounded-full bg-white/8 px-2 py-1 text-[10px] font-bold text-white/60">real flow</span>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {steps.map((step, index) => (
          <motion.div key={step.label} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.12 }} className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
            <div className="mb-2 flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-clay text-[10px] font-black text-white">{index + 1}</span>
              <span className="text-xs font-extrabold text-white">{step.label}</span>
            </div>
            <pre className="overflow-hidden text-[11px] leading-5 text-[#f2eadf]"><code>$ {step.terminal}</code></pre>
            <p className="mt-2 rounded-xl bg-white/7 px-3 py-2 text-[11px] font-semibold leading-5 text-white/70">{step.result}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Examples({ examples }: { examples: DocSection["examples"] }) {
  return (
    <div className="mt-6 grid gap-3">
      <h2 className="text-lg font-extrabold tracking-[-0.02em]">Contoh penggunaan</h2>
      {examples.map((example) => <CodeBlock key={example.title} code={example.code} label={example.title} />)}
    </div>
  );
}

function NextDocs({ current, filteredDocs }: { current: DocSection; filteredDocs: DocSection[] }) {
  const related = filteredDocs.filter((doc) => doc.path !== current.path).slice(0, 6);
  return (
    <div className="grid gap-2 md:grid-cols-2">
      {related.map((doc) => (
        <button key={doc.path} onClick={() => navigateTo(doc.path)} className="glass-line focus-ring rounded-2xl p-4 text-left transition hover:border-clay/40 hover:bg-card">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted">{doc.group}</p>
          <h3 className="mt-2 text-sm font-extrabold text-ink">{doc.title}</h3>
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted">{doc.summary}</p>
        </button>
      ))}
    </div>
  );
}

function CodeBlock({ code, label = "example", compact = false }: { code: string; label?: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }
  return (
    <div className={`${compact ? "mt-3" : "mt-4"} overflow-hidden rounded-2xl border border-line bg-[#151412] shadow-soft`}>
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
        <span className="truncate text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">{label}</span>
        <button onClick={copy} className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-2.5 py-1 text-[11px] font-bold text-white/80 transition hover:bg-white/14">
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className={`${compact ? "max-h-48" : "max-h-[420px]"} overflow-auto p-4 text-[12px] leading-6 text-[#f2eadf] scrollbar-thin`}><code>{code}</code></pre>
    </div>
  );
}

function FloatingAssistant({ activeDoc }: { activeDoc: DocSection }) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Halo! Aku AI docs assistant. Tanya install, CLI, SDK, bot Telegram/WA/Discord, website API, error, atau security guard." }
  ]);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-ai", handler);
    return () => window.removeEventListener("open-ai", handler);
  }, []);

  async function ask(customQuestion?: string) {
    const text = (customQuestion ?? question).trim();
    if (!text || loading) return;
    setOpen(true);
    setQuestion("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, context: knowledgeBase })
      });
      const data: { answer?: string } = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer ?? "AI belum mengembalikan jawaban." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "AI sedang tidak tersedia. Gunakan search lokal atau baca halaman troubleshooting." }]);
    } finally {
      setLoading(false);
    }
  }

  const suggestions = [`Ringkas ${activeDoc.title}`, "Contoh integrasi Telegram", "Kenapa DOCKER_IMAGE_NOT_FOUND?", "Cara deploy di Vercel"];

  return (
    <div className="fixed bottom-4 right-3 z-50 sm:bottom-5 sm:right-5">
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 18, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.96 }} className="mb-3 w-[calc(100vw-1.5rem)] max-w-[390px] rounded-[1.6rem] border border-line bg-card/95 p-3 shadow-soft backdrop-blur-xl sm:p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-muted">AI docs assistant</p>
                <h2 className="text-sm font-extrabold">Tanya Pterodactyl Gateway</h2>
              </div>
              <button onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-xl border border-line bg-paper"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-3 max-h-[320px] space-y-2 overflow-y-auto pr-1 scrollbar-thin">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`rounded-2xl px-3 py-2.5 text-xs leading-6 ${message.role === "user" ? "ml-8 bg-ink text-white" : "mr-6 bg-paper text-muted"}`}>{message.content}</div>
              ))}
              {loading && <div className="mr-6 rounded-2xl bg-paper px-3 py-2.5 text-xs font-semibold text-muted">AI sedang membaca docs...</div>}
            </div>
            <div className="mt-3 flex gap-2">
              <input value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => event.key === "Enter" && ask()} placeholder="Tanya docs..." className="focus-ring min-w-0 flex-1 rounded-2xl border border-line bg-paper px-3 py-2.5 text-sm font-semibold outline-none placeholder:text-muted/70" />
              <button onClick={() => ask()} disabled={loading} className="focus-ring rounded-2xl bg-ink px-3 py-2.5 text-sm font-bold text-white disabled:opacity-50">Ask</button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {suggestions.map((item) => <button key={item} onClick={() => ask(item)} className="rounded-full border border-line bg-paper px-2.5 py-1 text-[11px] font-bold text-muted transition hover:border-clay/40 hover:text-ink">{item}</button>)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button onClick={() => setOpen((value) => !value)} className="focus-ring ml-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-ink text-white shadow-soft transition hover:translate-y-[-2px]">
        <Bot className="h-6 w-6" />
      </button>
    </div>
  );
}

function MobileMenu({ open, onClose, ...props }: SidebarProps & { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 bg-ink/30 p-3 backdrop-blur-sm lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div initial={{ x: -24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -24, opacity: 0 }} className="h-full max-w-sm rounded-[1.5rem] bg-paper p-3 shadow-soft">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-extrabold">Docs menu</span>
              <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-card"><X className="h-4 w-4" /></button>
            </div>
            <Sidebar {...props} activePath={props.activePath} setQuery={props.setQuery} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
