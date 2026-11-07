import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Toaster, toast } from "sonner";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BookOpen, Check, ChevronLeft, ChevronRight, CircleAlert, Command, Copy, ExternalLink, Github, Menu, MessageSquare, Moon, Package, Play, RotateCcw, Search, ShieldCheck, SkipForward, Sun, Terminal, X } from "lucide-react";
import { NPM_PACKAGE_URL, PACKAGE_NAME, SDK_REPOSITORY_URL, SDK_VERSION, docs, docsByPath, knowledgeBase, navGroups, type DocSection, type SimulationStep } from "./data/docs";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./components/ui/dialog";
import { Progress } from "./components/ui/progress";
import { Skeleton } from "./components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./components/ui/tooltip";
import "sonner/dist/styles.css";
import "./styles.css";

type ChatMessage = { role: "user" | "assistant"; content: string; kind?: "answer" | "error" };
type RouteState = { path: string; doc: DocSection };
type RichPart = { type: "text"; value: string } | { type: "code"; value: string; title: string };
type Theme = "light" | "dark";
type CopyState = "idle" | "ok" | "error";

const THEME_KEY = "ptg-theme-v1";
const CHAT_KEY = "ptg-ai-chat-v2";
const defaultAssistant: ChatMessage = { role: "assistant", content: `Halo. Aku asisten dokumentasi ${PACKAGE_NAME} v${SDK_VERSION}. Tanya soal instalasi, CLI, SDK, retry, safe mode, file, backup, bot, website API, atau error panel.` };
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

function getInitialTheme(): Theme {
  try {
    const stored = window.localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    undefined;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#111310" : "#F3F1E8");
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch {
      undefined;
    }
  }, [theme]);

  return { theme, toggleTheme: () => setTheme((current) => current === "dark" ? "light" : "dark") };
}

type InternalLinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick"> & { path: string; onNavigate: (path: string) => void };

function InternalLink({ path, onNavigate, children, ...props }: InternalLinkProps) {
  return <a href={path} onClick={(event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onNavigate(path);
  }} {...props}>{children}</a>;
}

function App() {
  const [route, setRoute] = useState<RouteState>(() => resolveRoute());
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handler = () => setRoute(resolveRoute());
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  useEffect(() => {
    document.title = `${route.doc.title} · Pterodactyl Gateway Docs`;
    setScrollProgress(0);
    window.scrollTo(0, 0);
  }, [route.path, route.doc.title]);

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [route.path]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setMenuOpen(false);
        setPaletteOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function goTo(path: string) {
    setMenuOpen(false);
    setPaletteOpen(false);
    if (path === route.path) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setRouteLoading(true);
    navigateTo(path);
    window.setTimeout(() => setRouteLoading(false), 480);
  }

  function openPalette() {
    setMenuOpen(false);
    setPaletteOpen(true);
  }

  return (
    <TooltipProvider delayDuration={420}>
    <div className="site-shell">
      <a className="skip-link" href="#main-content">Lewati ke konten</a>
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        onSearch={openPalette}
        onMenu={() => setMenuOpen(true)}
        onNavigate={goTo}
        routeLoading={routeLoading}
      />
      <div className="spec-strip" aria-label="Spesifikasi rilis">
        <div className="spec-strip-inner">
          <span><strong>SDK</strong> v{SDK_VERSION}</span>
          <span><strong>Runtime</strong> Node 18 / 20 / 22</span>
          <span><strong>Panel</strong> v1 + v2 beta</span>
          <span className="spec-strip-end">Dokumentasi resmi / MIT</span>
        </div>
      </div>
      <div className="read-progress" aria-hidden="true"><span style={{ transform: `scaleX(${scrollProgress})` }} /></div>
      <main id="main-content" className="page-grid">
        <aside className="rail-left" aria-label="Navigasi dokumentasi">
          <Sidebar activePath={route.path} onNavigate={goTo} onSearch={openPalette} />
        </aside>
        <div className="reading-column">
          {route.doc.id === "overview" && <Landing onNavigate={goTo} />}
          <DocArticle doc={route.doc} onNavigate={goTo} isOverview={route.doc.id === "overview"} />
          <Footer onNavigate={goTo} />
        </div>
        <aside className="rail-right" aria-label="Konteks halaman">
          <DocRail doc={route.doc} />
        </aside>
      </main>
      <Assistant activeDoc={route.doc} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onNavigate={goTo} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} activePath={route.path} onNavigate={goTo} onSearch={openPalette} onAssistant={() => { setMenuOpen(false); window.dispatchEvent(new Event("open-ai")); }} />
      <Toaster theme={theme} position="top-right" offset={{ top: 76, right: 16 }} closeButton={false} toastOptions={{ className: "docs-toast", duration: 2400 }} />
    </div>
    </TooltipProvider>
  );
}

function Header({ theme, toggleTheme, onSearch, onMenu, onNavigate, routeLoading }: { theme: Theme; toggleTheme: () => void; onSearch: () => void; onMenu: () => void; onNavigate: (path: string) => void; routeLoading: boolean }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <InternalLink path="/docs/overview" onNavigate={onNavigate} className="brand" aria-label="Pterodactyl Gateway Docs, kembali ke pengenalan">
          <img src="/icon.svg" alt="" width="30" height="30" />
          <span className="brand-copy">
            <span className="brand-name">Pterodactyl Gateway</span>
            <span className="brand-meta">Docs v{SDK_VERSION}</span>
          </span>
        </InternalLink>
        <nav className="header-nav" aria-label="Navigasi utama">
          <InternalLink path="/docs/install" onNavigate={onNavigate}>Mulai</InternalLink>
          <InternalLink path="/docs/sdk" onNavigate={onNavigate}>SDK</InternalLink>
          <InternalLink path="/docs/cli-create-server" onNavigate={onNavigate}>CLI</InternalLink>
          <InternalLink path="/docs/integrations/telegram-bot" onNavigate={onNavigate}>Integrasi</InternalLink>
        </nav>
        <div className="header-actions">
          <button type="button" className="search-trigger" onClick={onSearch} aria-label="Cari dokumentasi">
            <Search className="icon" aria-hidden="true" />
            <span>Cari</span>
            <kbd>Ctrl K</kbd>
          </button>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="icon-button theme-button" onClick={toggleTheme} aria-label={`Ganti ke mode ${theme === "dark" ? "terang" : "gelap"}`}>
                {theme === "dark" ? <Sun className="icon" aria-hidden="true" /> : <Moon className="icon" aria-hidden="true" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Mode {theme === "dark" ? "terang" : "gelap"}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <a className="icon-button github-button" href={SDK_REPOSITORY_URL} target="_blank" rel="noreferrer" aria-label="Buka repositori GitHub">
                <Github className="icon" aria-hidden="true" />
                <span>GitHub</span>
              </a>
            </TooltipTrigger>
            <TooltipContent side="bottom">Repositori SDK</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="icon-button menu-button" onClick={onMenu} aria-label="Buka menu dokumentasi">
                <Menu className="icon" aria-hidden="true" />
                <span className="menu-label">Menu</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Menu dokumentasi</TooltipContent>
          </Tooltip>
        </div>
      </div>
      <AnimatePresence>{routeLoading && <motion.div className="route-line" initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} />}</AnimatePresence>
    </header>
  );
}

function Landing({ onNavigate }: { onNavigate: (path: string) => void }) {
  const groups = navGroups.filter((group) => group !== "Legal");
  return (
    <div className="landing">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="kicker"><span>01</span> Manual operasional</p>
          <h1 id="hero-title">Panel Pterodactyl, satu jalur yang bisa diaudit.</h1>
          <p className="hero-lede">SDK TypeScript, CLI, dan pola provisioning untuk Pterodactyl v1 dan v2. Mulai dari key yang benar, uji dengan dry-run, lalu jalankan operasi yang tercatat.</p>
          <div className="hero-actions">
            <Button asChild variant="primary"><InternalLink path="/docs/install" onNavigate={onNavigate}><BookOpen className="icon" aria-hidden="true" /> Mulai dari instalasi</InternalLink></Button>
            <Button asChild variant="secondary"><InternalLink path="/docs/panel-compat" onNavigate={onNavigate}>Baca jalur v1 dan v2</InternalLink></Button>
          </div>
        </div>
        <aside className="ledger" aria-label="Ringkasan rilis">
          <div className="ledger-head"><span>Rilis saat ini</span><Badge variant="signal" className="ledger-status">npm latest</Badge></div>
          <div className="ledger-version">v{SDK_VERSION}</div>
          <dl className="ledger-facts">
            <div><dt>Paket</dt><dd>{PACKAGE_NAME}</dd></div>
            <div><dt>Runtime</dt><dd>Node &gt;=18</dd></div>
            <div><dt>Panel</dt><dd>v1 + v2 beta</dd></div>
            <div><dt>Lisensi</dt><dd>MIT</dd></div>
          </dl>
          <a className="ledger-link" href={NPM_PACKAGE_URL} target="_blank" rel="noreferrer">Lihat package di npm <ExternalLink className="icon" aria-hidden="true" /></a>
        </aside>
      </section>

      <section className="section" aria-labelledby="paths-title">
        <SectionHead index="02" title="Pilih pekerjaan, bukan menu." id="paths-title" lede="Tiga jalur yang paling sering dipakai. Setiap jalur berakhir di halaman yang bisa langsung diikuti." />
        <div className="path-list">
          <InternalLink path="/docs/sdk" onNavigate={onNavigate} className="path-row">
            <span className="path-index">01</span>
            <span className="path-copy"><span className="path-title">Bangun backend dan bot</span><span className="path-desc">Buat instance gateway, preview payload, lalu kontrol server lewat handle Client API.</span></span>
            <Badge variant="outline" className="path-tag">SDK</Badge>
          </InternalLink>
          <InternalLink path="/docs/cli-create-server" onNavigate={onNavigate} className="path-row">
            <span className="path-index">02</span>
            <span className="path-copy"><span className="path-title">Operasikan panel dari terminal</span><span className="path-desc">Cek ID, jalankan dry-run, buat resource, probe, dan bersihkan dari satu alur CLI.</span></span>
            <Badge variant="outline" className="path-tag">CLI</Badge>
          </InternalLink>
          <InternalLink path="/docs/integrations/telegram-bot" onNavigate={onNavigate} className="path-row">
            <span className="path-index">03</span>
            <span className="path-copy"><span className="path-title">Hubungkan bot dan website</span><span className="path-desc">Pisahkan credential backend, batasi aksi user, dan kirim status server yang bisa dibaca.</span></span>
            <Badge variant="outline" className="path-tag">Integrasi</Badge>
          </InternalLink>
        </div>
      </section>

      <section className="section" aria-labelledby="index-title">
        <SectionHead index="03" title="Indeks dokumentasi." id="index-title" lede="Semua halaman yang tersedia, dikelompokkan sesuai pekerjaan." />
        <div className="index-grid">
          {groups.map((group, index) => <div className="index-group" key={group}>
            <h3><span>{String(index + 1).padStart(2, "0")}</span>{group}</h3>
            <ul>
              {docs.filter((doc) => doc.group === group).map((doc) => <li key={doc.path}><InternalLink path={doc.path} onNavigate={onNavigate}><span>{doc.title}</span><span>{doc.tags[0]}</span></InternalLink></li>)}
            </ul>
          </div>)}
        </div>
      </section>

      <section className="discipline" aria-labelledby="discipline-title">
        <div>
          <p className="kicker"><span>04</span> Yang dijaga</p>
          <h2 id="discipline-title">Operasi yang tidak menebak.</h2>
          <p className="section-lede">Perilaku berikut adalah bagian dari kontrak package, bukan tambahan dekoratif.</p>
        </div>
        <ul>
          <li><ShieldCheck className="icon" aria-hidden="true" /><span><strong>Safe mode aktif secara default</strong>Operasi destruktif membutuhkan konfirmasi yang terlihat.</span></li>
          <li><Terminal className="icon" aria-hidden="true" /><span><strong>POST tidak diulang otomatis</strong>Retry mutation hanya lewat opt-in yang eksplisit.</span></li>
          <li><Package className="icon" aria-hidden="true" /><span><strong>Satu API untuk v1 dan v2</strong>Deteksi panel memilih endpoint dan payload yang sesuai.</span></li>
        </ul>
      </section>
    </div>
  );
}

function SectionHead({ index, title, id, lede }: { index: string; title: string; id: string; lede: string }) {
  return <header className="section-head"><span className="section-index">{index}</span><div><h2 id={id}>{title}</h2><p className="section-lede">{lede}</p></div></header>;
}

function Sidebar({ activePath, onNavigate, onSearch }: { activePath: string; onNavigate: (path: string) => void; onSearch: () => void }) {
  const groups = navGroups.filter((group) => group !== "Legal");
  return (
    <nav className="rail-nav" aria-label="Daftar halaman">
      <button type="button" className="rail-search" onClick={onSearch}>
        <Search className="icon" aria-hidden="true" />
        <span>Cari dokumentasi</span>
        <kbd>Ctrl K</kbd>
      </button>
      {groups.map((group, groupIndex) => <div className="nav-group" key={group}>
        <p className="nav-group-label"><span>{String(groupIndex + 1).padStart(2, "0")}</span>{group}</p>
        <ul>
          {docs.filter((doc) => doc.group === group).map((doc) => <li key={doc.path}>
            <InternalLink path={doc.path} onNavigate={onNavigate} className="nav-link" aria-current={doc.path === activePath ? "page" : undefined}>{doc.title}</InternalLink>
          </li>)}
        </ul>
      </div>)}
      <div className="rail-foot">
        <a href={NPM_PACKAGE_URL} target="_blank" rel="noreferrer">npm <ExternalLink className="icon" aria-hidden="true" /></a>
        <a href={SDK_REPOSITORY_URL} target="_blank" rel="noreferrer">GitHub <ExternalLink className="icon" aria-hidden="true" /></a>
      </div>
    </nav>
  );
}

function DocRail({ doc }: { doc: DocSection }) {
  const items = useMemo(() => {
    const result = [{ id: "ringkasan", label: "Ringkasan" }];
    if (doc.steps.length) result.push({ id: "langkah", label: "Langkah" });
    if (doc.simulation.length) result.push({ id: "command", label: "Alur command" });
    if (doc.code) result.push({ id: "contoh", label: "Contoh utama" });
    if (doc.examples.length) result.push({ id: "referensi", label: "Referensi lain" });
    return result;
  }, [doc]);
  const [activeId, setActiveId] = useState(items[0]?.id ?? "ringkasan");

  useEffect(() => {
    setActiveId(items[0]?.id ?? "ringkasan");
    const elements = items.map((item) => document.getElementById(item.id)).filter((element): element is HTMLElement => Boolean(element));
    if (elements.length === 0) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (visible) setActiveId(visible.target.id);
    }, { rootMargin: "-18% 0px -68% 0px", threshold: 0 });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [items]);

  return <div className="doc-rail-content">
    <nav className="toc" aria-label="Di halaman ini">
      <p className="toc-title">Di halaman ini</p>
      {items.map((item, index) => <a key={item.id} href={`#${item.id}`} className={activeId === item.id ? "is-active" : undefined}><span>{String(index + 1).padStart(2, "0")}</span>{item.label}</a>)}
    </nav>
    {doc.id !== "overview" && <div className="release-card">
      <p className="release-label">Rilis</p>
      <p className="release-version">v{SDK_VERSION}</p>
      <p className="release-note">Node &gt;=18. Pterodactyl v1 dan v2 beta.</p>
      <a href={`${NPM_PACKAGE_URL}/v/${SDK_VERSION}`} target="_blank" rel="noreferrer">Lihat versi ini <ExternalLink className="icon" aria-hidden="true" /></a>
    </div>}
  </div>;
}

function DocArticle({ doc, onNavigate, isOverview }: { doc: DocSection; onNavigate: (path: string) => void; isOverview: boolean }) {
  const Heading = isOverview ? "h2" : "h1";
  const index = docs.findIndex((item) => item.path === doc.path);
  const previous = index > 0 ? docs[index - 1] : undefined;
  const next = index >= 0 && index < docs.length - 1 ? docs[index + 1] : undefined;
  return <motion.article key={doc.path} className="article" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}>
      <nav className="breadcrumbs" aria-label="Breadcrumb"><InternalLink path="/docs/overview" onNavigate={onNavigate}>Docs</InternalLink><span aria-hidden="true">/</span><span>{doc.group}</span><span aria-hidden="true">/</span><span aria-current="page">{doc.title}</span></nav>
      <header className="doc-header">
        <Heading className="doc-title">{doc.title}</Heading>
        <p className="doc-summary">{doc.summary}</p>
        <div className="doc-meta"><span>{doc.group}</span><span>{doc.path}</span><span>{doc.tags.slice(0, 2).join(" / ")}</span></div>
        <div className="doc-tags" aria-label="Tag halaman">{doc.tags.map((tag) => <Badge variant="muted" className="doc-tag" key={tag}>{tag}</Badge>)}</div>
      </header>
      <aside className="beginner-note"><span className="beginner-label">Sebelum mulai</span><p>{doc.beginner}</p></aside>
      <div id="ringkasan" className="doc-body">{doc.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
      {doc.steps.length > 0 && <section className="doc-section" aria-labelledby="langkah">
        <div className="doc-section-head"><span>02</span><h2 id="langkah">Langkah</h2></div>
        <ol className="step-list">{doc.steps.map((step, stepIndex) => <li className="step" key={step.title}>
          <span className="step-number">{String(stepIndex + 1).padStart(2, "0")}</span>
          <div className="step-copy"><h3>{step.title}</h3><p>{step.detail}</p>{step.command && <CopyableBlock code={step.command} label="command" compact />}</div>
        </li>)}</ol>
      </section>}
      {doc.simulation.length > 0 && <section className="doc-section" aria-labelledby="command">
        <div className="doc-section-head"><span>03</span><h2 id="command">Alur command</h2></div>
        <CommandSequence steps={doc.simulation} />
      </section>}
      {doc.code && <section className="doc-section" aria-labelledby="contoh">
        <div className="doc-section-head"><span>04</span><h2 id="contoh">Contoh utama</h2></div>
        <CopyableBlock code={doc.code} label="main example" />
      </section>}
      {doc.examples.length > 0 && <section className="doc-section" aria-labelledby="referensi">
        <div className="doc-section-head"><span>05</span><h2 id="referensi">Referensi lain</h2></div>
        <div className="example-stack">{doc.examples.map((example) => <CopyableBlock key={example.title} code={example.code} label={example.title} />)}</div>
      </section>}
      <nav className="doc-pager" aria-label="Halaman sebelumnya dan berikutnya">
        {previous ? <InternalLink path={previous.path} onNavigate={onNavigate} className="pager-link"><span><ChevronLeft className="icon" aria-hidden="true" /> Sebelumnya</span><strong>{previous.title}</strong></InternalLink> : <span className="pager-spacer" />}
        {next ? <InternalLink path={next.path} onNavigate={onNavigate} className="pager-link pager-next"><span>Berikutnya <ChevronRight className="icon" aria-hidden="true" /></span><strong>{next.title}</strong></InternalLink> : <span className="pager-spacer" />}
      </nav>
    </motion.article>;
}

type RunPhase = "idle" | "typing" | "running" | "output" | "done";

function lineTone(line: string) {
  if (/^(✓|ok\b|self-check: ok|selesai)/i.test(line) || /\bok\b/i.test(line)) return "is-ok";
  if (/error|gagal|invalid|not found|ditolak/i.test(line)) return "is-warn";
  if (/^(mode|apiVersion|current|payload|node|server|profile|tag|egg)/i.test(line)) return "is-key";
  return "";
}

function CommandSequence({ steps }: { steps: SimulationStep[] }) {
  const [active, setActive] = useState(0);
  const [runKey, setRunKey] = useState(0);
  const [typed, setTyped] = useState("");
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [phase, setPhase] = useState<RunPhase>("idle");
  const [armed, setArmed] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<() => void>(() => undefined);
  const reducedMotion = useReducedMotion();
  const step = steps[active] ?? steps[0];

  useEffect(() => setActive(0), [steps]);

  useEffect(() => {
    const node = rootRef.current;
    if (!node || armed) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setArmed(true);
        observer.disconnect();
      }
    }, { rootMargin: "0px 0px -18% 0px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [armed]);

  useEffect(() => {
    if (!step || !armed) return;
    const output = step.result.split("\n");
    const command = step.terminal;
    const timers: number[] = [];
    let cancelled = false;
    const cancel = () => {
      cancelled = true;
      timers.forEach((timer) => window.clearTimeout(timer));
    };
    cancelRef.current = cancel;
    const later = (callback: () => void, delay: number) => {
      timers.push(window.setTimeout(() => {
        if (!cancelled) callback();
      }, delay));
    };

    setTyped("");
    setVisibleLines([]);
    setPhase("idle");

    if (reducedMotion) {
      setTyped(command);
      setVisibleLines(output);
      setPhase("done");
      return cancel;
    }

    const revealLine = (index: number) => {
      if (index >= output.length) {
        setPhase("done");
        return;
      }
      setPhase("output");
      setVisibleLines(output.slice(0, index + 1));
      later(() => revealLine(index + 1), output[index].trim() ? 170 : 260);
    };

    const typeCharacter = (index: number) => {
      if (index >= command.length) {
        setPhase("running");
        later(() => revealLine(0), 720);
        return;
      }
      setPhase("typing");
      setTyped(command.slice(0, index + 1));
      const character = command[index];
      let delay = 46 + Math.random() * 26;
      if (character === " ") delay += 16;
      if ("/-._=".includes(character)) delay += 12;
      if (";|".includes(character)) delay += 90;
      if (character === "\n") delay += 220;
      later(() => typeCharacter(index + 1), delay);
    };

    later(() => typeCharacter(0), 560);
    return cancel;
  }, [step, armed, runKey, reducedMotion]);

  if (!step) return null;

  const output = step.result.split("\n");
  const commandProgress = commandLength(step.terminal) ? typed.length / commandLength(step.terminal) : 0;
  const outputProgress = output.length ? visibleLines.length / output.length : 0;
  const progress = phase === "done" ? 100 : Math.min(99, Math.round(commandProgress * 58 + outputProgress * 42));
  const status = phase === "idle" ? "menunggu" : phase === "typing" ? "mengetik" : phase === "running" ? "menjalankan" : phase === "output" ? "menulis output" : "selesai";

  function skip() {
    cancelRef.current();
    setTyped(step.terminal);
    setVisibleLines(output);
    setPhase("done");
  }

  return <div className="runner" ref={rootRef}>
    <div className="runner-head">
      <div className="runner-title"><Terminal className="icon" aria-hidden="true" /><span>Simulasi terminal</span><Badge variant="outline" className="runner-badge">bukan respons panel</Badge></div>
      <span className="runner-status" data-phase={phase}><span aria-hidden="true" /> {status}</span>
    </div>
    <Progress value={progress} className="runner-progress" aria-label="Progres simulasi command" />
    <Tabs value={String(active)} onValueChange={(value) => { setActive(Number(value)); setRunKey((key) => key + 1); }}>
      <TabsList className="runner-tabs" aria-label="Pilih skenario command">
        {steps.map((item, index) => <TabsTrigger key={item.label} value={String(index)} className="runner-tab">{String(index + 1).padStart(2, "0")} {item.label}</TabsTrigger>)}
      </TabsList>
      <TabsContent value={String(active)} className="runner-body">
        <div className="runner-command">
          <span className="runner-prompt" aria-hidden="true"><span>~</span>/project $</span>
          <code className="runner-typed">{typed}<span className={`runner-cursor ${phase === "done" ? "is-idle" : ""}`} aria-hidden="true" /></code>
          <CopyButton value={step.terminal} label="Salin command" />
        </div>
        <div className="runner-output">
          <div className="runner-output-head"><span>output</span>{phase === "running" || phase === "output" ? <span className="runner-live"><i aria-hidden="true" />live</span> : null}</div>
          <pre aria-label={`Hasil simulasi ${step.label}`}>{visibleLines.map((line, index) => <span key={`${line}-${index}`} className={`runner-line ${lineTone(line)}`}>{line || " "}</span>)}{phase === "idle" || phase === "typing" ? <span className="runner-wait">menunggu command dikirim...</span> : null}</pre>
        </div>
        <div className="runner-foot">
          <span className="runner-count">{step.label} / {String(active + 1).padStart(2, "0")} dari {String(steps.length).padStart(2, "0")}</span>
          <div className="runner-actions">
            {phase !== "done" && <Button type="button" variant="ghost" size="sm" onClick={skip}><SkipForward className="icon" aria-hidden="true" /> Lewati</Button>}
            <Button type="button" variant="ghost" size="sm" onClick={() => setRunKey((key) => key + 1)}><Play className="icon" aria-hidden="true" /> {phase === "done" ? "Ulangi" : "Jalankan"}</Button>
          </div>
        </div>
        <span className="sr-only" aria-live="polite">Simulasi {step.label}: {status}</span>
      </TabsContent>
    </Tabs>
  </div>;
}

function commandLength(value: string) {
  return Math.max(1, value.length);
}

function CopyableBlock({ code, label = "code", compact = false }: { code: string; label?: string; compact?: boolean }) {
  return <div className={`code-block ${compact ? "is-compact" : ""}`}>
    <div className="code-head"><span className="code-label">{label}</span><CopyButton value={code} label="Salin kode" /></div>
    <pre tabIndex={0} aria-label={`Contoh ${label}`}><code>{code}</code></pre>
  </div>;
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [state, setState] = useState<CopyState>("idle");
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setState("ok");
      toast.success("Disalin ke clipboard");
    } catch {
      setState("error");
      toast.error("Clipboard diblokir. Pilih teks lalu salin manual.");
    }
    window.setTimeout(() => setState("idle"), 1600);
  }
  return <button type="button" className="copy-button" onClick={() => void copy()} aria-label={label}>{state === "ok" ? <Check className="icon" aria-hidden="true" /> : <Copy className="icon" aria-hidden="true" />}<span>{state === "ok" ? "Tersalin" : state === "error" ? "Gagal" : "Salin"}</span></button>;
}

function Footer({ onNavigate }: { onNavigate: (path: string) => void }) {
  return <footer className="site-footer">
    <div><strong>Pterodactyl Gateway Docs</strong><p>Dokumentasi package {PACKAGE_NAME} v{SDK_VERSION}. Contoh memakai placeholder, bukan credential panel.</p></div>
    <nav aria-label="Tautan footer"><a href={NPM_PACKAGE_URL} target="_blank" rel="noreferrer">npm</a><a href={SDK_REPOSITORY_URL} target="_blank" rel="noreferrer">GitHub</a><InternalLink path="/privacy" onNavigate={onNavigate}>Privacy</InternalLink><InternalLink path="/terms" onNavigate={onNavigate}>Terms</InternalLink></nav>
    <p className="footer-version">v{SDK_VERSION} / MIT</p>
  </footer>;
}

function CommandPalette({ open, onClose, onNavigate }: { open: boolean; onClose: () => void; onNavigate: (path: string) => void }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const results = useMemo(() => docs.map((doc) => ({ doc, score: scoreDoc(doc, query) })).filter((entry) => entry.score > 0).sort((a, b) => b.score - a.score).map((entry) => entry.doc).slice(0, 10), [query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
    }
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  function select(path: string) {
    onNavigate(path);
    onClose();
  }

  return <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
    <DialogContent className="palette-panel" onOpenAutoFocus={(event) => { event.preventDefault(); window.setTimeout(() => document.getElementById("palette-input")?.focus(), 30); }}>
      <DialogTitle className="sr-only">Cari dokumentasi</DialogTitle>
      <DialogDescription className="sr-only">Cari halaman dokumentasi berdasarkan judul, tag, command, atau ringkasan.</DialogDescription>
      <div className="palette-input-row"><Search className="icon" aria-hidden="true" /><label className="sr-only" htmlFor="palette-input">Cari dokumentasi</label><input id="palette-input" className="palette-input" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          setActive((value) => Math.min(value + 1, results.length - 1));
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          setActive((value) => Math.max(value - 1, 0));
        } else if (event.key === "Enter" && results[active]) {
          event.preventDefault();
          select(results[active].path);
        }
      }} placeholder="Cari: install, retry, backup, telegram..." autoComplete="off" spellCheck={false} /></div>
      <div className="palette-results" role="listbox" aria-labelledby="palette-title">
        <p className="palette-group" id="palette-title">{query ? "Hasil pencarian" : "Mulai dari sini"}</p>
        {results.length === 0 ? <div className="palette-empty"><p>Tidak ada halaman yang cocok.</p><span>Coba kata lain seperti install, retry, file, atau backup.</span></div> : results.map((doc, index) => <a key={doc.path} href={doc.path} role="option" aria-selected={index === active} className="palette-option" onMouseEnter={() => setActive(index)} onClick={(event) => {
          if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          select(doc.path);
        }}>
          <span className="palette-index">{String(index + 1).padStart(2, "0")}</span>
          <span className="palette-copy"><strong>{doc.title}</strong><span>{doc.group} / {doc.summary}</span></span>
          <span className="palette-path">{doc.path}</span>
        </a>)}
      </div>
      <div className="palette-footer"><span><kbd>Enter</kbd> buka</span><span><kbd>Esc</kbd> tutup</span><span>{results.length} halaman</span></div>
    </DialogContent>
  </Dialog>;
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

function renderInline(value: string) {
  return value.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean).map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) return <code key={`${part}-${index}`} className="inline-code">{part.slice(1, -1)}</code>;
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    return <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>;
  });
}

function MarkdownText({ value }: { value: string }) {
  return <div className="message-markdown">{value.split("\n").map((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={`space-${index}`} className="message-space" />;
    if (trimmed.startsWith("### ")) return <h4 key={index}>{renderInline(trimmed.slice(4))}</h4>;
    if (trimmed.startsWith("## ")) return <h3 key={index}>{renderInline(trimmed.slice(3))}</h3>;
    if (trimmed.startsWith("# ")) return <h3 key={index}>{renderInline(trimmed.slice(2))}</h3>;
    if (/^[-*]\s+/.test(trimmed)) return <div key={index} className="message-list-row"><span aria-hidden="true">-</span><span>{renderInline(trimmed.replace(/^[-*]\s+/, ""))}</span></div>;
    if (/^\d+\.\s+/.test(trimmed)) return <div key={index} className="message-list-row"><span>{trimmed.match(/^\d+/)?.[0]}</span><span>{renderInline(trimmed.replace(/^\d+\.\s+/, ""))}</span></div>;
    return <p key={index}>{renderInline(trimmed)}</p>;
  })}</div>;
}

function RichMessage({ content }: { content: string }) {
  return <div className="message-rich">{parseRichContent(content).map((part, index) => part.type === "code" ? <CopyableBlock key={index} code={part.value} label={part.title} compact /> : <MarkdownText key={index} value={part.value} />)}</div>;
}

async function readAiResponse(response: Response): Promise<{ answer?: string }> {
  const raw = await response.text();
  if (!raw.trim()) return {};
  try {
    return JSON.parse(raw) as { answer?: string };
  } catch {
    return { answer: response.ok ? "AI mengembalikan respons yang tidak dapat dibaca." : "Asisten belum mendapat jawaban dari server. Coba lagi atau pakai pencarian lokal." };
  }
}

function buildDocContext(doc: DocSection) {
  const sections = [
    `Halaman aktif: ${doc.title} (${doc.path})`,
    `Ringkasan: ${doc.summary}`,
    doc.beginner,
    ...doc.body,
    ...doc.steps.map((step, index) => `${index + 1}. ${step.title}: ${step.detail}${step.command ? ` | ${step.command}` : ""}`),
    ...doc.examples.map((example) => `${example.title}: ${example.code}`),
    doc.code ? `Contoh utama: ${doc.code}` : "",
    `Tag: ${doc.tags.join(", ")}`
  ].filter(Boolean);
  return `${sections.join("\n")}\n\nKonteks umum:\n${knowledgeBase.slice(0, 2500)}`.slice(0, 9000);
}

function Assistant({ activeDoc }: { activeDoc: DocSection }) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const stored = window.sessionStorage.getItem(CHAT_KEY);
      if (!stored) return [defaultAssistant];
      const parsed = JSON.parse(stored) as ChatMessage[];
      return Array.isArray(parsed) && parsed.length > 0 ? parsed.slice(-16) : [defaultAssistant];
    } catch {
      return [defaultAssistant];
    }
  });
  const [lastFailed, setLastFailed] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-ai", handler);
    return () => window.removeEventListener("open-ai", handler);
  }, []);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(CHAT_KEY, JSON.stringify(messages.slice(-16)));
    } catch {
      undefined;
    }
  }, [messages]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 120);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    const node = listRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, loading, open]);

  useEffect(() => {
    if (!loading) {
      setElapsed(0);
      return;
    }
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [loading]);

  async function ask(customQuestion?: string) {
    const text = (customQuestion ?? question).trim();
    if (!text || loading) return;
    setOpen(true);
    setQuestion("");
    setLastFailed("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 45000);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, context: buildDocContext(activeDoc) }),
        signal: controller.signal
      });
      const data = await readAiResponse(response);
      if (!response.ok) throw new Error(data.answer ?? "Asisten belum mendapat jawaban. Coba lagi atau pakai pencarian lokal.");
      const answer = data.answer?.trim();
      if (!answer) throw new Error("AI belum mengembalikan jawaban. Coba lagi.");
      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    } catch (error) {
      setLastFailed(text);
      const message = error instanceof DOMException && error.name === "AbortError"
        ? "Waktu tunggu AI habis. Coba pertanyaan yang lebih singkat atau ulangi."
        : error instanceof TypeError
          ? "Koneksi ke asisten gagal. Periksa jaringan, lalu coba lagi."
          : error instanceof Error && error.message
            ? error.message
            : "Asisten belum mendapat jawaban. Coba lagi atau pakai pencarian lokal.";
      setMessages((prev) => [...prev, { role: "assistant", content: message, kind: "error" }]);
    } finally {
      window.clearTimeout(timer);
      setLoading(false);
    }
  }

  function resetChat() {
    setMessages([defaultAssistant]);
    setLastFailed("");
    setQuestion("");
    try {
      window.sessionStorage.removeItem(CHAT_KEY);
    } catch {
      undefined;
    }
  }

  const suggestions = [`Ringkas ${activeDoc.title}`, "Dukungan Pterodactyl v2", "Kenapa DOCKER_IMAGE_NOT_FOUND?", "Cara aman hapus server"];
  const lastMessage = messages[messages.length - 1];
  const assistantState = loading ? "memproses" : lastMessage?.kind === "error" ? "gagal" : "siap";

  return <>
    <button type="button" className="assistant-launch" onClick={() => setOpen(true)} aria-haspopup="dialog">
      <MessageSquare className="icon" aria-hidden="true" />
      <span>Tanya docs</span>
    </button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="assistant-panel" onOpenAutoFocus={(event) => { event.preventDefault(); window.setTimeout(() => inputRef.current?.focus(), 80); }}>
        <DialogTitle className="sr-only">Tanya dokumentasi</DialogTitle>
        <DialogDescription className="sr-only">Asisten menjawab berdasarkan halaman dokumentasi yang sedang dibuka.</DialogDescription>
        <header className="assistant-head">
          <div><p className="assistant-kicker">Konteks halaman</p><h2 id="assistant-title">Tanya dokumentasi</h2><div className="assistant-meta"><p className="assistant-context">{activeDoc.title}</p><Badge variant="outline" className="assistant-health" data-state={assistantState}>{assistantState}</Badge></div></div>
          <div className="assistant-head-actions">
            <button type="button" className="icon-button" title="Mulai chat baru" aria-label="Mulai chat baru" onClick={resetChat}><RotateCcw className="icon" aria-hidden="true" /></button>
            <button type="button" className="icon-button" title="Tutup asisten" aria-label="Tutup asisten dokumentasi" onClick={() => setOpen(false)}><X className="icon" aria-hidden="true" /></button>
          </div>
        </header>
        <div ref={listRef} className="assistant-messages" aria-live="polite" aria-busy={loading}>
          {messages.map((message, index) => <div key={`${message.role}-${index}`} className={`message ${message.role === "user" ? "message-user" : "message-assistant"} ${message.kind === "error" ? "message-error" : ""}`}>
            <span className="message-label">{message.role === "user" ? "Anda" : "Asisten"}</span>
            {message.kind === "error" ? <div className="message-error-body" role="alert"><CircleAlert className="icon" aria-hidden="true" /><RichMessage content={message.content} /></div> : <RichMessage content={message.content} />}
            {message.kind === "error" && index === messages.length - 1 && lastFailed && !loading && <Button type="button" variant="secondary" size="sm" className="message-retry" onClick={() => void ask(lastFailed)}><RotateCcw className="icon" aria-hidden="true" /> Coba lagi pertanyaan terakhir</Button>}
          </div>)}
          {loading && <div className="message message-assistant"><span className="message-label">Asisten</span><div className="thinking" role="status"><div className="thinking-skeleton" aria-hidden="true"><Skeleton /><Skeleton /><Skeleton /></div><em aria-hidden="true">{elapsed >= 12 ? "Penyedia AI lambat, masih mencoba" : "Menyusun jawaban"}{elapsed >= 3 ? ` · ${elapsed} dtk` : ""}</em><span className="sr-only">Menyusun jawaban</span></div></div>}
        </div>
        {messages.length <= 1 && <div className="suggestion-list">{suggestions.map((item) => <button type="button" key={item} onClick={() => void ask(item)}>{item}</button>)}</div>}
        <form className="assistant-composer" onSubmit={(event) => { event.preventDefault(); void ask(); }}>
          <label className="sr-only" htmlFor="assistant-input">Tulis pertanyaan</label>
          <input ref={inputRef} id="assistant-input" value={question} maxLength={1500} onChange={(event) => setQuestion(event.target.value)} placeholder="Tanya soal dokumentasi..." autoComplete="off" />
          <Button type="submit" variant="primary" size="sm" disabled={loading || !question.trim()}>{loading ? "..." : "Kirim"}</Button>
        </form>
        <p className="assistant-foot">Enter kirim. Esc tutup. Jangan kirim credential asli.</p>
      </DialogContent>
    </Dialog>
  </>;
}

function MobileMenu({ open, onClose, activePath, onNavigate, onSearch, onAssistant }: { open: boolean; onClose: () => void; activePath: string; onNavigate: (path: string) => void; onSearch: () => void; onAssistant: () => void }) {
  return <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
    <DialogContent className="mobile-sheet">
      <DialogTitle className="sr-only">Menu dokumentasi</DialogTitle>
      <DialogDescription className="sr-only">Navigasi halaman, pencarian, dan asisten dokumentasi.</DialogDescription>
      <div className="mobile-sheet-head"><h2 id="mobile-menu-title">Menu dokumentasi</h2><button type="button" className="icon-button" onClick={onClose} aria-label="Tutup menu"><X className="icon" aria-hidden="true" /></button></div>
      <button type="button" className="mobile-assistant" onClick={() => { onClose(); onAssistant(); }}><MessageSquare className="icon" aria-hidden="true" /><span className="mobile-assistant-label">Tanya dokumentasi</span><Badge variant="muted" className="mobile-assistant-tag">AI</Badge></button>
      <Sidebar activePath={activePath} onNavigate={(path) => { onClose(); onNavigate(path); }} onSearch={() => { onClose(); onSearch(); }} />
    </DialogContent>
  </Dialog>;
}

createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
