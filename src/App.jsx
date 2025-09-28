import React from "react";

/* =========================
   0) CONFIG
   ========================= */
const API_KEY  = "AIzaSyCjjW3RjE6y026TTk3qLXDEs-i6RWor30g"; // your API key
const SHEET_ID = "16Q3GRHir6zs3Vc1M30F_2cpTzp48muh2bCTlmlHdnco"; // schedule sheet
const TAB_NAME = "Sheet1";

// Published Google Doc URL for Syllabus (NEW)
const DOC_PUB_URL =
  "https://docs.google.com/document/d/e/2PACX-1vRF_9-plJVYDaTzHVOqImhfxmHMtECvWzy1h0JYrNAnI5_ur3mLk5bzV4AiDonOY5Yiffa1rkkC9YMF/pub";

// 5-min cache buster so users see recent edits as soon as Google refreshes its snapshot
const DOC_SRC = `${DOC_PUB_URL}?v=${Math.floor(Date.now() / (5 * 60 * 1000))}`;

// =========================
//  Docs (Read the Docs or GH Pages)
// =========================
const DOCS_URL = "https://tinyml-readthedocs.readthedocs.io/en/latest/index.html";

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
          const end = v.runs[idx + 1]?.startIndex ?? full.length;
          const slice = full.slice(start, end);
          const href = v.runs[idx].format?.link?.uri;
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
          apiKey,
          sheetId,
          tabName,
          force: false,
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
const H = ({ html }) => <span dangerouslySetInnerHTML={{ __html: html || "" }} />;
const get = (row, key) => row?.[key] || "";

function stripHtml(html = "") {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

// remove any duration like "(~3 weeks)"
function stripWeeks(text = "") {
  return text.replace(/\s*\(\s*~?[^)]*\bweeks?\b[^)]*\)\s*/gi, "").trim();
}

// parse anchors from html, fallback to comma/newline split
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
  const partAtRow = new Array(rows.length).fill("");
  const blockByPart = {};
  let currentPart = "";

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

    const part = afterSpecialTopics ? "" : partAtRow[i];
    const block = afterSpecialTopics ? "" : part ? blockByPart[part] || "" : "";
    const combined = part || block ? [part, block].filter(Boolean).join(": ") : "";

    return { ...r, _moduleCombined: combined };
  });
}

/* =========================
   3) SCHEDULE CARDS
   ========================= */
function ScheduleCards({ apiKey, sheetId, tabName }) {
  const { rows, loading, error, lastUpdated, fromCache } = useSheet({
    apiKey,
    sheetId,
    tabName,
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
            const date = stripHtml(get(r, "Date"));
            const lecture = get(r, "Lecture");
            const topics = get(r, "Topics");
            const slides = get(r, "Slides & Videos");
            const tutorial = get(r, "Tutorial");
            const readings = get(r, "Readings");
            const assignment = get(r, "Assignment");
            const quizzes = get(r, "Quizzes");
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
   4) SYLLABUS (Google Doc)
   ========================= */

/** Fetch published Google Doc HTML */
function usePublishedDoc(pubUrl) {
  const [html, setHtml] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!pubUrl) return;
    setLoading(true);
    fetch(pubUrl, { credentials: "omit", cache: "no-store", mode: "cors" })
      .then((r) => {
        if (!r.ok) throw new Error(`Fetch ${r.status}`);
        return r.text();
      })
      .then((raw) => {
        const cleaned = sanitizeAndDecorateGoogleDocHTML(raw);
        setHtml(cleaned);
        setLoading(false);
      })
      .catch((e) => {
        setError(String(e));
        setLoading(false);
      });
  }, [pubUrl]);

  return { html, loading, error };
}

/** Sanitizer + Tailwind restyler for Google Doc HTML */
function sanitizeAndDecorateGoogleDocHTML(rawHtml) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, "text/html");
  const body = doc.body;

  // Remove script/style
  body.querySelectorAll("script, style").forEach((n) => n.remove());

  // BEFORE stripping styles, convert inline font-weight to <strong>
  body.querySelectorAll("[style*='font-weight']").forEach((el) => {
    const style = (el.getAttribute("style") || "").toLowerCase();
    if (!/font-weight\s*:\s*(bold|[6-9]00)/.test(style)) return;
    if (el.closest("strong, b")) return; // already bold
    const strong = doc.createElement("strong");
    while (el.firstChild) strong.appendChild(el.firstChild);
    el.appendChild(strong);
  });

  // Allowlist tags & attributes
  const ALLOW = new Set([
    "p","br","strong","b","em","u","s","span","h1","h2","h3","h4","h5","h6",
    "ul","ol","li","a","img","blockquote","hr","table","thead","tbody",
    "tr","th","td","pre","code","figure","figcaption","div",
  ]);
  const ALLOW_ATTR = new Set(["href", "src", "alt", "title", "colspan", "rowspan"]);

  const walker = doc.createTreeWalker(body, NodeFilter.SHOW_ELEMENT);
  const toRemove = [];
  while (walker.nextNode()) {
    const el = walker.currentNode;
    if (!ALLOW.has(el.tagName.toLowerCase())) { toRemove.push(el); continue; }
    [...el.attributes].forEach((attr) => {
      if (!ALLOW_ATTR.has(attr.name.toLowerCase())) el.removeAttribute(attr.name);
    });
  }
  toRemove.forEach((n) => n.replaceWith(...n.childNodes));

  // Promote numbered-looking paragraphs to <h3>
  body.querySelectorAll("p").forEach((p) => {
    const text = (p.textContent || "").trim();
    const looksLikeNumberedHead =
      /^([A-Za-z]\.)?\d+(\.\d+)*\.\s+/.test(text) ||
      /^A\.\d+(\.\d+)*\s+/.test(text);
    if (!looksLikeNumberedHead) return;
    const h = doc.createElement("h3");
    h.innerHTML = p.innerHTML;
    p.replaceWith(h);
  });

  // Theme-friendly classes
  body.querySelectorAll("h1").forEach((h) => (h.className = "text-3xl font-semibold mt-6 mb-3 text-slate-900 dark:text-white"));
  body.querySelectorAll("h2").forEach((h) => (h.className = "text-2xl font-semibold mt-6 mb-3 text-slate-900 dark:text-white"));
  body.querySelectorAll("h3").forEach((h) => (h.className = "text-xl font-bold mt-5 mb-2.5 text-slate-900 dark:text-white"));
  body.querySelectorAll("h4,h5,h6").forEach((h) => (h.className = "text-lg font-semibold mt-4 mb-2 text-slate-900 dark:text-white"));

  body.querySelectorAll("p,li,figcaption").forEach((p) => {
    p.classList.add("text-[15px]", "leading-7", "text-slate-800", "dark:text-white/90");
    if (p.tagName.toLowerCase() === "p") p.classList.add("my-3");
  });

  body.querySelectorAll("ul").forEach((ul) => (ul.className = "list-disc pl-6 my-3 space-y-1"));
  body.querySelectorAll("ol").forEach((ol) => (ol.className = "list-decimal pl-6 my-3 space-y-1"));

  body.querySelectorAll("a[href]").forEach((a) => {
    a.target = "_blank";
    a.rel = "noreferrer";
    a.className =
      "underline decoration-slate-400/50 underline-offset-2 hover:text-slate-900 dark:decoration-white/40 dark:hover:text-white";
  });

  body.querySelectorAll("img[src]").forEach((img) => {
    img.className = "max-w-full h-auto rounded-xl border border-black/10 dark:border-white/10 my-3";
  });

  body.querySelectorAll("blockquote").forEach(
    (bq) =>
      (bq.className =
        "border-l-4 pl-4 my-4 text-slate-700 dark:text-white/80 border-slate-300 dark:border-white/20")
  );

  body.querySelectorAll("code").forEach((c) => {
    c.classList.add("px-1.5", "py-0.5", "rounded", "bg-black/5", "dark:bg-white/10");
  });
  body.querySelectorAll("pre").forEach((pre) => {
    pre.className = "my-4 p-3 rounded-xl overflow-auto bg-black/5 dark:bg-white/10";
  });

  // Tables with scroll wrapper
  body.querySelectorAll("table").forEach((table) => {
    table.className = "w-full text-sm border-collapse";
    table.querySelectorAll("th").forEach((th) =>
      th.classList.add(
        "text-left","font-semibold","px-3","py-2","bg-black/5","dark:bg-white/10","text-slate-800","dark:text-white"
      )
    );
    table.querySelectorAll("td").forEach((td) =>
      td.classList.add(
        "px-3","py-2","align-top","text-slate-800","dark:text-white/90","border-t","border-black/10","dark:border-white/10"
      )
    );
    const wrap = doc.createElement("div");
    wrap.className = "overflow-x-auto rounded-xl border border-black/10 dark:border-white/10 my-4";
    table.parentNode?.insertBefore(wrap, table);
    wrap.appendChild(table);
  });

  const container = doc.createElement("div");
  container.append(...body.childNodes);
  return container.innerHTML;
}

/** Syllabus page */
function SyllabusPage() {
  const { html, loading, error } = usePublishedDoc(DOC_SRC);

  if (loading) return <div className="text-slate-600 dark:text-white/70">Loading syllabus…</div>;

  // Fallback to iframe when CORS blocks fetch (still uses cache-buster)
  if (error) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <iframe
          src={`${DOC_PUB_URL}?embedded=true&v=${Math.floor(Date.now() / (5 * 60 * 1000))}`}
          style={{ width: "100%", height: "80vh", border: 0 }}
          title="Syllabus"
          loading="lazy"
        />
      </div>
    );
  }

  return <div className="mx-auto w-full max-w-4xl" dangerouslySetInnerHTML={{ __html: html }} />;
}

/* =========================
   4.5) DOCS PAGE (Read the Docs / GH Pages)
   ========================= */
function DocsPage() {
  // Cache-buster so users see the latest build snapshot when your host/CDN allows it
  const src = `${DOCS_URL}?v=${Math.floor(Date.now() / (5 * 60 * 1000))}`;

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-slate-600 dark:text-white/60">
          Embedded docs from <code>{new URL(DOCS_URL).hostname}</code>
        </div>
        <a
          href={DOCS_URL}
          target="_blank"
          rel="noreferrer"
          className="text-sm underline decoration-slate-400/50 underline-offset-2 hover:text-slate-900 dark:decoration-white/40 dark:hover:text-white"
        >
          Open in new tab ↗
        </a>
      </div>

      <div className="rounded-xl border border-black/10 dark:border-white/10 overflow-hidden">
        <iframe
          title="Course Docs"
          src={src}
          loading="lazy"
          style={{ width: "100%", height: "80vh", border: 0 }}
        />
      </div>
    </div>
  );
}

/* =========================
   5) PAGE CHROME + THEME FAB
   ========================= */
function Section({ title, eyebrow, children }) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-3 py-1 text-xs text-slate-700 dark:border-white/15 dark:bg-white/5 dark:text-white/80">
          {eyebrow}
        </div>
        <h2 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{title}</h2>
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
   6) MAIN APP
   ========================= */
export default function App() {
  const [page, setPage] = React.useState("schedule");
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
            <NavBtn id="docs" label="Docs" />
          </nav>
        </div>
      </header>

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

      {page === "docs" && (
        <Section eyebrow="Reference" title="Documentation">
          <DocsPage />
        </Section>
      )}

      <footer className="mx-auto max-w-6xl px-4 pb-12 text-slate-600 dark:text-white/50">
        <div className="flex items-center justify-between">
          <p className="text-xs">© {new Date().getFullYear()} TinyML @ Penn</p>
          <div className="flex gap-4 text-xs">
            <a href="#" className="hover:text-slate-900 dark:hover:text-white">GitHub</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white">Canvas</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white">Contact</a>
          </div>
        </div>
      </footer>

      {/* Floating theme toggle (iPhone-safe) */}
      <ThemeFAB theme={theme} onToggle={toggle} />
    </div>
  );
}
