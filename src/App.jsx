// src/App.jsx
import React from "react";
import SyllabusPage from "./SyllabusPageHardcoded.jsx";
import Lectures from "./LecturesPage.jsx"; // ⬅️ separate Lectures page
import "./index.css";

/* =========================
   0) CONFIG (Schedule sheet)
   ========================= */
const API_KEY  = "AIzaSyCjjW3RjE6y026TTk3qLXDEs-i6RWor30g"; // Sheets API key
const SHEET_ID = "16Q3GRHir6zs3Vc1M30F_2cpTzp48muh2bCTlmlHdnco"; // schedule sheet
const TAB_NAME = "Sheet1";

/* =========================
   THEME HOOK
   ========================= */
function useTheme() {
  const [theme, setTheme] = React.useState(
    () =>
      localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
  );

  React.useEffect(() => {
    localStorage.setItem("theme", theme);
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  return { theme, toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")) };
}

/* =========================
   1) FETCH + CACHE (Schedule)
   ========================= */
const CACHE_TTL_MS = 0; // always fetch fresh on page load

function cacheKey(sheetId, tabName, range = "A:Z") {
  return `tinyml:sheets:${sheetId}:${tabName}:${range}`;
}

async function fetchFromSheetsAPI({ apiKey, sheetId, tabName, range = "A:Z" }) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?includeGridData=true&ranges=${encodeURIComponent(
    `${tabName}!${range}`
  )}&key=${apiKey}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Sheets API ${res.status}`);
  const data = await res.json();

  const grid = data?.sheets?.[0]?.data?.[0]?.rowData || [];
  let headers = [];
  const rows = [];

  for (const row of grid) {
    const cells = row?.values || [];
    const vals = cells.map((c) => ({
      text: c?.formattedValue ?? "",
      link: c?.hyperlink ?? null,
      runs: c?.textFormatRuns ?? null,
    }));

    const empty = vals.every((v) => !v.text && !v.link && !(v.runs?.length));
    if (empty) continue;

    if (headers.length === 0) {
      headers = vals.map((v) => (v.text || "").trim());
      continue;
    }

    const obj = {};
    for (let i = 0; i < headers.length; i++) {
      const h = headers[i] || `Col${i + 1}`;
      const v = vals[i] || { text: "", link: null, runs: null };

      if (v.runs && v.runs.length) {
        const full = v.text || "";
        let html = "";
        for (let idx = 0; idx < v.runs.length; idx++) {
          const start = v.runs[idx].startIndex ?? 0;
          const end   = v.runs[idx + 1]?.startIndex ?? full.length;
          const slice = full.slice(start, end);
          const href  = v.runs[idx].format?.link?.uri;
          html += href
            ? `<a href="${href}" target="_blank" rel="noreferrer" class="underline decoration-slate-400/50 underline-offset-2 hover:text-slate-900 dark:decoration-white/40 dark:hover:text-white">${slice}</a>`
            : slice;
        }
        obj[h] = html;
      } else if (v.link) {
        obj[h] = `<a href="${v.link}" target="_blank" rel="noreferrer" class="underline decoration-slate-400/50 underline-offset-2 hover:text-slate-900 dark:decoration-white/40 dark:hover:text-white">${v.text || v.link}</a>`;
      } else {
        obj[h] = (v.text || "").replace(/\n/g, "<br/>");
      }
    }
    rows.push(obj);
  }

  return { headers, rows };
}

async function cachedSheet({ apiKey, sheetId, tabName, range = "A:Z", force = false }) {
  const key = cacheKey(sheetId, tabName, range);
  const now = Date.now();

  const raw = localStorage.getItem(key);
  if (!force && raw) {
    try {
      const { ts, payload } = JSON.parse(raw);
      if (now - ts < CACHE_TTL_MS && payload?.rows?.length) {
        fetchFromSheetsAPI({ apiKey, sheetId, tabName, range })
          .then((fresh) => localStorage.setItem(key, JSON.stringify({ ts: Date.now(), payload: fresh })))
          .catch(() => {});
        return { ...payload, fromCache: true, lastUpdated: ts };
      }
    } catch {}
  }

  const payload = await fetchFromSheetsAPI({ apiKey, sheetId, tabName, range });
  localStorage.setItem(key, JSON.stringify({ ts: now, payload }));
  return { ...payload, fromCache: false, lastUpdated: now };
}

function useSheet({ apiKey, sheetId, tabName }) {
  const [state, setState] = React.useState({
    headers: [],
    rows: [],
    loading: true,
    error: "",
    lastUpdated: null,
    fromCache: false,
  });

  React.useEffect(() => {
    let on = true;
    (async () => {
      try {
        const { headers, rows, fromCache, lastUpdated } = await cachedSheet({
          apiKey, sheetId, tabName, force: false,
        });
        if (on) setState({ headers, rows, loading: false, error: "", lastUpdated, fromCache });
      } catch (e) {
        if (on) setState((s) => ({ ...s, loading: false, error: String(e) }));
      }
    })();
    return () => { on = false; };
  }, [apiKey, sheetId, tabName]);

  return state;
}

/* =========================
   2) RENDER HELPERS
   ========================= */
const H   = ({ html }) => <span dangerouslySetInnerHTML={{ __html: html || "" }} />;
const get = (row, key) => row?.[key] || "";

function stripHtml(html = "") {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

function stripWeeks(text = "") {
  return text.replace(/\s*\(\s*~?[^)]*\bweeks?\b[^)]*\)\s*/gi, "").trim();
}

function htmlToLinkItems(html) {
  if (!html) return [];
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const a = Array.from(doc.querySelectorAll("a"));
    if (a.length) {
      return a.map((el) => ({
        label: (el.textContent || el.href || "").trim(),
        href: el.getAttribute("href") || el.href,
      }));
    }
  } catch {}
  return String(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((label) => ({ label, href: undefined }));
}

function CollapsibleLinks({ title, html }) {
  if (!html) return null;
  const items = htmlToLinkItems(html);
  if (!items.length) return null;

  return (
    <details className="rounded-xl border border-black/10 bg-black/5 open:bg-black/7 dark:border-white/10 dark:bg-white/5">
      <summary className="list-none cursor-pointer select-none px-3 py-2 text-sm text-slate-800 hover:text-slate-900 dark:text-white/85 dark:hover:text-white flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wide">{title}</span>
        <span className="text-[11px] text-slate-500 dark:text-white/50">{items.length}</span>
      </summary>
      <ul className="px-4 pb-3 pt-1 space-y-2 text-[15px] leading-6">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-2 block h-[6px] w-[6px] rounded-full bg-slate-300 dark:bg-white/30 shrink-0" />
            {it.href ? (
              <a
                className="underline decoration-slate-400/50 underline-offset-2 hover:text-slate-900 dark:decoration-white/40 dark:hover:text-white"
                href={it.href}
                target="_blank"
                rel="noreferrer"
              >
                {it.label}
              </a>
            ) : (
              <span className="text-slate-800 dark:text-white/90">{it.label}</span>
            )}
          </li>
        ))}
      </ul>
    </details>
  );
}

/** Two-pass module fill with "Special Topics" cutoff */
function withDisplayModule(rows) {
  const partAtRow   = new Array(rows.length).fill("");
  const blockByPart = {};
  let currentPart   = "";

  for (let i = 0; i < rows.length; i++) {
    const rawModule = stripHtml(get(rows[i], "Module"));
    if (rawModule) {
      if (/^part\s+/i.test(rawModule)) {
        currentPart = rawModule.trim().replace(/\s+/g, " ");
      } else {
        const block = stripWeeks(rawModule);
        if (currentPart && block && !blockByPart[currentPart]) {
          blockByPart[currentPart] = block;
        }
      }
    }
    partAtRow[i] = currentPart;
  }

  let afterSpecialTopics = false;

  return rows.map((r, i) => {
    const lectureText = stripHtml(get(r, "Lecture"));
    if (/^\s*Special\s+Topics\b/i.test(lectureText)) afterSpecialTopics = true;

    const part  = afterSpecialTopics ? "" : partAtRow[i];
    const block = afterSpecialTopics ? "" : (part ? (blockByPart[part] || "") : "");
    const combined = part || block ? [part, block].filter(Boolean).join(": ") : "";

    return { ...r, _moduleCombined: combined };
  });
}

/* =========================
   3) SCHEDULE CARDS
   ========================= */
function ScheduleCards({ apiKey, sheetId, tabName }) {
  const { rows, loading, error, lastUpdated, fromCache } = useSheet({
    apiKey, sheetId, tabName,
  });
  const displayRows = withDisplayModule(rows);

  return (
    <div>
      <div className="mb-4 text-xs text-slate-600 dark:text-white/60">
        {lastUpdated
          ? `Last loaded: ${new Date(lastUpdated).toLocaleString()} ${fromCache ? "(cached)" : "(live)"}`
          : "Loading…"}
      </div>

      {loading && !displayRows.length && (
        <div className="text-slate-600 dark:text-white/70">Loading schedule…</div>
      )}
      {error && <div className="text-rose-600 dark:text-rose-300">Error: {error}</div>}
      {!loading && !displayRows.length && !error && (
        <div className="text-slate-600 dark:text-white/70">No items yet.</div>
      )}

      {!error && displayRows.length > 0 && (
        <div className="grid gap-6">
          {displayRows.map((r, i) => {
            const date       = stripHtml(get(r, "Date"));
            const lecture    = get(r, "Lecture");
            const topics     = get(r, "Topics");
            const slides     = get(r, "Slides & Videos");
            const tutorial   = get(r, "Tutorial");
            const readings   = get(r, "Readings");
            const assignment = get(r, "Assignment");
            const quizzes    = get(r, "Quizzes");
            const moduleCombined = r._moduleCombined;

            if (!date && !lecture && !topics && !slides) return null;

            return (
              <article
                key={i}
                className="rounded-2xl border border-black/10 bg-black/5 p-6 text-[15px] leading-6 shadow-sm shadow-black/5 dark:border-white/10 dark:bg-white/[0.06]"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {lecture && (
                      <div className="font-semibold tracking-tight text-slate-900 dark:text-white">
                        <H html={lecture} />
                      </div>
                    )}
                    {moduleCombined && (
                      <span className="rounded-full border border-black/10 bg-black/5 px-2.5 py-0.5 text-[11px] text-slate-700 dark:border-white/15 dark:bg-white/10 dark:text-white/75">
                        {moduleCombined}
                      </span>
                    )}
                  </div>
                  {date && <div className="font-medium text-slate-800 dark:text-white/80">{date}</div>}
                </div>

                <div className="mt-5 grid gap-6 lg:grid-cols-2">
                  <div>
                    {topics && (
                      <div>
                        <div className="text-[11px] uppercase tracking-wide text-slate-600 dark:text-white/55">Topics</div>
                        <div className="mt-2 text-slate-900 dark:text-white/90"><H html={topics} /></div>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-4">
                    <CollapsibleLinks title="Slides & Videos" html={slides} />
                    <CollapsibleLinks title="Tutorial" html={tutorial} />
                    <CollapsibleLinks title="Readings" html={readings} />
                    {(assignment || quizzes) && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        {assignment && (
                          <div>
                            <div className="text-[11px] uppercase tracking-wide text-slate-600 dark:text-white/55">Assignment</div>
                            <ul className="mt-2 space-y-2 text-[15px] leading-6">
                              {htmlToLinkItems(assignment).map((it, j) => (
                                <li key={j} className="flex gap-2">
                                  <span className="mt-2 block h-[6px] w-[6px] rounded-full bg-slate-300 dark:bg-white/30 shrink-0" />
                                  {it.href ? (
                                    <a className="underline decoration-slate-400/50 underline-offset-2 hover:text-slate-900 dark:decoration-white/40 dark:hover:text-white" href={it.href} target="_blank" rel="noreferrer">
                                      {it.label}
                                    </a>
                                  ) : (
                                    <span className="text-slate-900 dark:text-white/90">{it.label}</span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {quizzes && (
                          <div>
                            <div className="text-[11px] uppercase tracking-wide text-slate-600 dark:text-white/55">Quizzes</div>
                            <ul className="mt-2 space-y-2 text-[15px] leading-6">
                              {htmlToLinkItems(quizzes).map((it, j) => (
                                <li key={j} className="flex gap-2">
                                  <span className="mt-2 block h-[6px] w-[6px] rounded-full bg-slate-300 dark:bg-white/30 shrink-0" />
                                  {it.href ? (
                                    <a className="underline decoration-slate-400/50 underline-offset-2 hover:text-slate-900 dark:decoration-white/40 dark:hover:text-white" href={it.href} target="_blank" rel="noreferrer">
                                      {it.label}
                                    </a>
                                  ) : (
                                    <span className="text-slate-900 dark:text-white/90">{it.label}</span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =========================
   4) PAGE CHROME
   ========================= */
function Section({ title, eyebrow, children }) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12">
      <div className="mb-6">
        {eyebrow && (
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-3 py-1 text-xs text-slate-700 dark:border-white/15 dark:bg-white/5 dark:text-white/80">
            {eyebrow}
          </div>
        )}
        {title && <h2 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{title}</h2>}
      </div>
      {children}
    </section>
  );
}

function ThemeFAB({ theme, onToggle }) {
  const label = theme === "dark" ? "Light" : "Dark";
  return (
    <button
      onClick={onToggle}
      aria-label={`Switch to ${label} mode`}
      className="
        fixed z-[9999]
        px-3 py-2 rounded-full text-sm
        border bg-white text-slate-800
        shadow-lg shadow-black/20
        dark:bg-slate-800 dark:text-white dark:border-white/15
        right-[max(env(safe-area-inset-right),1rem)]
        bottom-[max(env(safe-area-inset-bottom),1rem)]
        border-black/10 dark:border-white/15
      "
    >
      {label}
    </button>
  );
}

/* =========================
   5) MAIN APP
   ========================= */
export default function App() {
  const [page, setPage] = React.useState("schedule"); // start on Schedule like your original
  const { theme, toggle } = useTheme();

  const NavBtn = ({ id, label }) => (
    <button
      onClick={() => setPage(id)}
      className={`rounded-xl px-3 py-2 text-sm transition border ${
        page === id
          ? "border-black/20 bg-black/10 text-slate-900 dark:border-white/40 dark:bg-white/15 dark:text-white"
          : "border-black/10 bg-black/5 text-slate-700 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:text-white"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-black/10 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-emerald-500/15 ring-1 ring-emerald-400/40" />
            <span className="font-semibold">TinyML @ Penn</span>
          </div>
          <nav className="flex items-center gap-2">
            <NavBtn id="home" label="Home" />
            <NavBtn id="schedule" label="Schedule" />
            <NavBtn id="staff" label="Staff" />
            <NavBtn id="syllabus" label="Syllabus" />
            <NavBtn id="lectures" label="Lectures" /> {/* new separate page */}
          </nav>
        </div>
      </header>

      {/* Pages */}
      {page === "home" && (
        <main className="grid place-items-center px-4 py-24">
          <div className="text-center max-w-2xl">
            <h1 className="text-5xl font-bold text-emerald-600 dark:text-emerald-400">
              Tiny Machine Learning
            </h1>
            <p className="mt-4 text-slate-700 dark:text-white/70">
              Build embedded ML systems on microcontrollers—from sensing to models to deployment.
            </p>
          </div>
        </main>
      )}

      {page === "schedule" && (
        <Section eyebrow="Fall 2025" title="Course Schedule">
          <ScheduleCards apiKey={API_KEY} sheetId={SHEET_ID} tabName={TAB_NAME} />
        </Section>
      )}

      {page === "staff" && (
        <Section eyebrow="Course Team" title="Staff">
          <div className="text-slate-700 dark:text-white/70">Add staff info here.</div>
        </Section>
      )}

      {page === "syllabus" && (
        <Section eyebrow="Policies & Plan" title="Syllabus">
          <SyllabusPage />
        </Section>
      )}

      {page === "lectures" && <Lectures />}

      {/* Footer */}
      <footer className="mx-auto max-w-6xl px-4 pb-12 text-slate-600 dark:text-white/50">
        <div className="flex items-center justify-between">
          <p className="text-xs">© {new Date().getFullYear()} TinyML @ Penn</p>
          <div className="flex gap-4 text-xs">
            <a href="#" className="hover:text-slate-900 dark:hover:text-white">GitHub</a>
            <a href="#" className="hover:text-slate-900 dark:hover=text-white">Canvas</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white">Contact</a>
          </div>
        </div>
      </footer>

      <ThemeFAB theme={theme} onToggle={toggle} />
    </div>
  );
}
