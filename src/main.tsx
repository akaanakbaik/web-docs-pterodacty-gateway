import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Bot, Check, Code2, Command, Copy, ExternalLink, FileText, Github, Menu, Search, Shield, Sparkles, Terminal, X } from "lucide-react";
import { docs, knowledgeBase, type DocSection } from "./data/docs";
import "./styles.css";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const groups = Array.from(new Set(docs.map((doc) => doc.group)));

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s-]/gi, " ").replace(/\s+/g, " ").trim();
}

function scoreDoc(doc: DocSection, query: string) {
  const q = normalize(query);
  if (!q) return 1;
  const haystack = normalize([doc.title, doc.summary, ...doc.body, doc.code ?? "", doc.tags.join(" "), doc.group].join(" "));
  const terms = q.split(" ").filter(Boolean);
  let score = 0;
  for (const term of terms) {
    if (normalize(doc.title).includes(term)) score += 8;
    if (doc.tags.some((tag) => normalize(tag).includes(term))) score += 5;
    if (normalize(doc.summary).includes(term)) score += 4;
    if (haystack.includes(term)) score += 1;
  }
  return score;
}

function App() {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(docs[0]?.id ?? "overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 900], [0, -80]);
  const y2 = useTransform(scrollY, [0, 900], [0, 64]);

  const filteredDocs = useMemo(() => {
    return docs
      .map((doc) => ({ doc, score: scoreDoc(doc, query) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.doc);
  }, [query]);

  const activeDoc = docs.find((doc) => doc.id === activeId) ?? docs[0];

  return (
    <div className="min-h-screen overflow-x-hidden bg-paper text-ink">
      <motion.div style={{ y: y1 }} className="pointer-events-none fixed left-[-6rem] top-20 h-64 w-64 rounded-full bg-clay/10 blur-3xl" />
      <motion.div style={{ y: y2 }} className="pointer-events-none fixed right-[-7rem] top-40 h-72 w-72 rounded-full bg-sage/10 blur-3xl" />
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main className="relative mx-auto grid max-w-7xl grid-cols-1 gap-4 px-3 pb-14 pt-20 sm:px-5 lg:grid-cols-[280px_minmax(0,1fr)_360px] lg:gap-5 lg:px-6 lg:pt-24">
        <aside className="hidden lg:block">
          <Sidebar query={query} setQuery={setQuery} activeId={activeId} setActiveId={setActiveId} filteredDocs={filteredDocs} />
        </aside>
        <section className="min-w-0 space-y-4">
          <Hero onStart={() => document.getElementById("docs")?.scrollIntoView({ behavior: "smooth" })} />
          <MobileSearch query={query} setQuery={setQuery} />
          <QuickStats />
          <DocsPanel activeDoc={activeDoc} filteredDocs={filteredDocs} setActiveId={setActiveId} />
        </section>
        <aside className="min-w-0">
          <AssistantPanel activeDoc={activeDoc} />
        </aside>
      </main>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} query={query} setQuery={setQuery} activeId={activeId} setActiveId={setActiveId} filteredDocs={filteredDocs} />
    </div>
  );
}

function Header({ menuOpen, setMenuOpen }: { menuOpen: boolean; setMenuOpen: (value: boolean) => void }) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-line/80 bg-paper/82 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-5 lg:px-6">
        <a className="flex items-center gap-2" href="#top" aria-label="Akadev Pterodactyl Gateway Docs">
          <span className="grid h-8 w-8 place-items-center rounded-xl border border-line bg-card shadow-hair">
            <Terminal className="h-4 w-4 text-clay" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-extrabold tracking-tight sm:text-base">Pterodactyl Gateway</span>
            <span className="hidden text-[11px] font-medium text-muted sm:block">SDK · CLI · Bot integrations</span>
          </span>
        </a>
        <nav className="hidden items-center gap-2 md:flex">
          <a className="rounded-full px-3 py-2 text-xs font-semibold text-muted transition hover:bg-card hover:text-ink" href="#docs">Docs</a>
          <a className="rounded-full px-3 py-2 text-xs font-semibold text-muted transition hover:bg-card hover:text-ink" href="#assistant">AI Assistant</a>
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
    <section id="top" className="premium-card soft-grid overflow-hidden rounded-[2rem] p-5 sm:p-8 lg:p-10">
      <div className="max-w-3xl">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-card/80 px-3 py-1.5 text-xs font-bold text-slate shadow-hair">
          <Sparkles className="h-3.5 w-3.5 text-clay" /> v1.0.1 stable docs
        </div>
        <h1 className="max-w-3xl text-3xl font-extrabold tracking-[-0.045em] text-ink sm:text-5xl lg:text-6xl">
          Dokumentasi premium untuk Akadev Pterodactyl Gateway.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-base">
          Pelajari SDK TypeScript, CLI, wizard, config profile, integration helper, bot WhatsApp, Telegram, Discord, website, API backend, security guard, dan troubleshooting dalam satu tempat yang cepat dicari.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button onClick={onStart} className="focus-ring inline-flex items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-bold text-white shadow-soft transition hover:translate-y-[-1px]">
            Mulai baca docs <ArrowRight className="h-4 w-4" />
          </button>
          <a href="#assistant" className="focus-ring inline-flex items-center justify-center gap-2 rounded-2xl border border-line bg-card px-4 py-3 text-sm font-bold text-ink shadow-hair transition hover:border-clay/40">
            Tanya AI docs <Bot className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

function QuickStats() {
  const items = [
    { icon: Code2, label: "SDK", value: "TypeScript ESM" },
    { icon: Command, label: "CLI", value: "ptero-gateway" },
    { icon: Bot, label: "Integrasi", value: "WA · TG · Discord" },
    { icon: Shield, label: "Guard", value: "safe by default" }
  ];
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="glass-line rounded-2xl p-3 shadow-hair sm:p-4">
          <item.icon className="mb-3 h-4 w-4 text-clay" />
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">{item.label}</p>
          <p className="mt-1 text-xs font-extrabold text-ink sm:text-sm">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function Sidebar(props: SidebarProps) {
  return (
    <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-hidden rounded-[1.5rem] border border-line bg-card/78 p-3 shadow-soft backdrop-blur-xl">
      <SearchBox query={props.query} setQuery={props.setQuery} />
      <div className="mt-3 max-h-[calc(100vh-13rem)] space-y-4 overflow-y-auto pr-1 scrollbar-thin">
        {groups.map((group) => (
          <div key={group}>
            <p className="px-2 pb-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-muted">{group}</p>
            <div className="space-y-1">
              {props.filteredDocs.filter((doc) => doc.group === group).map((doc) => (
                <DocNavButton key={doc.id} doc={doc} active={doc.id === props.activeId} onClick={() => props.setActiveId(doc.id)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type SidebarProps = {
  query: string;
  setQuery: (value: string) => void;
  activeId: string;
  setActiveId: (id: string) => void;
  filteredDocs: DocSection[];
};

function SearchBox({ query, setQuery }: { query: string; setQuery: (value: string) => void }) {
  return (
    <label className="relative block">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search docs..." className="focus-ring h-11 w-full rounded-2xl border border-line bg-paper/80 pl-9 pr-3 text-sm font-semibold outline-none transition placeholder:text-muted/70" />
    </label>
  );
}

function MobileSearch({ query, setQuery }: { query: string; setQuery: (value: string) => void }) {
  return <div className="lg:hidden"><SearchBox query={query} setQuery={setQuery} /></div>;
}

function DocNavButton({ doc, active, onClick }: { doc: DocSection; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`focus-ring w-full rounded-2xl px-3 py-2.5 text-left transition ${active ? "bg-ink text-white shadow-soft" : "text-muted hover:bg-paper hover:text-ink"}`}>
      <span className="block text-xs font-extrabold">{doc.title}</span>
      <span className={`mt-1 line-clamp-2 block text-[11px] leading-5 ${active ? "text-white/72" : "text-muted"}`}>{doc.summary}</span>
    </button>
  );
}

function DocsPanel({ activeDoc, filteredDocs, setActiveId }: { activeDoc: DocSection; filteredDocs: DocSection[]; setActiveId: (id: string) => void }) {
  return (
    <section id="docs" className="space-y-4">
      <AnimatePresence mode="wait">
        <motion.article key={activeDoc.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }} className="premium-card rounded-[2rem] p-5 sm:p-7">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-line bg-paper px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted">{activeDoc.group}</span>
            {activeDoc.tags.slice(0, 4).map((tag) => <span key={tag} className="rounded-full bg-clay/10 px-2.5 py-1 text-[11px] font-bold text-clay">{tag}</span>)}
          </div>
          <h2 className="text-2xl font-extrabold tracking-[-0.035em] sm:text-4xl">{activeDoc.title}</h2>
          <p className="mt-3 text-sm font-semibold leading-7 text-muted sm:text-base">{activeDoc.summary}</p>
          <div className="prose-doc mt-5 space-y-4 text-sm sm:text-base">
            {activeDoc.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          {activeDoc.code && <CodeBlock code={activeDoc.code} />}
        </motion.article>
      </AnimatePresence>
      <div className="grid gap-2 md:grid-cols-2">
        {filteredDocs.filter((doc) => doc.id !== activeDoc.id).slice(0, 6).map((doc) => (
          <button key={doc.id} onClick={() => setActiveId(doc.id)} className="glass-line focus-ring rounded-2xl p-4 text-left transition hover:border-clay/40 hover:bg-card">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted">{doc.group}</p>
            <h3 className="mt-2 text-sm font-extrabold text-ink">{doc.title}</h3>
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted">{doc.summary}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-[#151412] shadow-soft">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">example</span>
        <button onClick={copy} className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-2.5 py-1 text-[11px] font-bold text-white/80 transition hover:bg-white/14">
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="max-h-[420px] overflow-auto p-4 text-[12px] leading-6 text-[#f2eadf] scrollbar-thin"><code>{code}</code></pre>
    </div>
  );
}

function AssistantPanel({ activeDoc }: { activeDoc: DocSection }) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Halo! Tanya apa saja tentang Akadev Pterodactyl Gateway: install, CLI, SDK, bot integration, Vercel, error, atau security guard." }
  ]);

  async function ask(customQuestion?: string) {
    const text = (customQuestion ?? question).trim();
    if (!text || loading) return;
    setQuestion("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, context: knowledgeBase })
      });
      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer ?? "AI belum mengembalikan jawaban." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "AI sedang tidak tersedia. Gunakan search lokal atau baca section troubleshooting." }]);
    } finally {
      setLoading(false);
    }
  }

  const suggestions = [
    `Jelaskan ${activeDoc.title}`,
    "Cara integrasi bot WhatsApp?",
    "Kenapa DOMAIN_REQUIRED muncul?",
    "Contoh create server dry-run"
  ];

  return (
    <section id="assistant" className="sticky top-24 space-y-3">
      <div className="premium-card rounded-[2rem] p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted">AI assistant</p>
            <h2 className="mt-1 text-lg font-extrabold tracking-[-0.02em]">Tanya docs</h2>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-2xl border border-line bg-paper"><Bot className="h-5 w-5 text-clay" /></span>
        </div>
        <div className="mt-4 max-h-[420px] space-y-2 overflow-y-auto pr-1 scrollbar-thin">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`rounded-2xl px-3 py-2.5 text-xs leading-6 ${message.role === "user" ? "ml-6 bg-ink text-white" : "mr-4 bg-paper text-muted"}`}>{message.content}</div>
          ))}
          {loading && <div className="mr-4 rounded-2xl bg-paper px-3 py-2.5 text-xs font-semibold text-muted">AI sedang membaca docs...</div>}
        </div>
        <div className="mt-4 flex gap-2">
          <input value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => event.key === "Enter" && ask()} placeholder="Tanya tentang gateway..." className="focus-ring min-w-0 flex-1 rounded-2xl border border-line bg-paper px-3 py-2.5 text-sm font-semibold outline-none placeholder:text-muted/70" />
          <button onClick={() => ask()} disabled={loading} className="focus-ring rounded-2xl bg-ink px-3 py-2.5 text-sm font-bold text-white disabled:opacity-50">Ask</button>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {suggestions.map((item) => <button key={item} onClick={() => ask(item)} className="rounded-full border border-line bg-card px-2.5 py-1 text-[11px] font-bold text-muted transition hover:border-clay/40 hover:text-ink">{item}</button>)}
        </div>
      </div>
      <a href="https://github.com/akaanakbaik/pterodactyl-gateway" target="_blank" rel="noreferrer" className="glass-line flex items-center justify-between rounded-2xl p-4 text-sm font-bold transition hover:border-clay/40">
        Source package <ExternalLink className="h-4 w-4" />
      </a>
    </section>
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
            <Sidebar {...props} setActiveId={(id) => { props.setActiveId(id); onClose(); }} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
