// src/Lectures.jsx
import React from "react";

/** =========================
 *  Small helpers
 *  ========================= */
const makeLecture = (module, n, title, blurb = "") => ({
  id: `m${module}-lec${n}`,
  title,
  url: `https://tinyml-readthedocs.readthedocs.io/en/latest/module${module}/Lecture${n}.html`,
  blurb,
});

const LECTURES = [
  makeLecture(1, 1, "Lecture 1 — Intro to TinyML", "Course overview, motivation, and examples at the edge."),
  makeLecture(1, 2, "Lecture 2 — Machine Learning Building Blocks", "Loss, gradient descent, and basic networks."),
  makeLecture(1, 3, "Lecture 3 — Convolutional Neural Networks", "Feature extraction and deeper architectures."),
  makeLecture(2, 1, "Lecture 4 — Keyword Spotting", "Audio preprocessing and tiny speech models."),
  makeLecture(2, 2, "Lecture 5 — Visual Wake Words", "Computer vision models on microcontrollers."),
  makeLecture(2, 3, "Lecture 6 — Anomaly Detection", "Signal processing and pattern deviation."),
  makeLecture(3, 1, "Lecture 7 — Deploying TinyML", "TensorFlow Lite Micro and MCU deployment."),
  makeLecture(3, 2, "Lecture 8 — Quantization and Optimization", "Memory footprint and performance trade-offs."),
  makeLecture(3, 3, "Lecture 9 — Project Integration", "End-to-end robot control application."),
];

/** =========================
 *  RTD fetch + sanitize
 *  ========================= */
function useRtdPage(url) {
  const [html, setHtml] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!url) return;
    let on = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const bust = `?v=${Math.floor(Date.now() / (5 * 60 * 1000))}`;
        const resp = await fetch(url + bust, { credentials: "omit", cache: "no-store", mode: "cors" });
        if (!resp.ok) throw new Error(`Fetch ${resp.status}`);
        const raw = await resp.text();
        if (!on) return;
        setHtml(sanitizeRtdHTML(raw));
      } catch (e) {
        if (!on) return;
        setError(String(e));
      } finally {
        if (on) setLoading(false);
      }
    })();
    return () => { on = false; };
  }, [url]);

  return { html, loading, error };
}

function sanitizeRtdHTML(rawHtml) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, "text/html");

  let main =
    doc.querySelector('div[role="main"] .document') ||
    doc.querySelector('div[role="main"]') ||
    doc.querySelector(".document") ||
    doc.body;

  // Strip RTD chrome + scripts/styles
  main.querySelectorAll("nav, header, footer, .sphinxsidebar, .wy-nav-side, .toc, .related").forEach(n => n.remove());
  main.querySelectorAll("a.headerlink, a[title^='Permalink']").forEach(n => n.remove());
  main.querySelectorAll("script, style").forEach(n => n.remove());

  // Allowlist + tidy
  const ALLOW = new Set([
    "section","article","p","br","strong","b","em","u","s","span",
    "h1","h2","h3","h4","h5","h6","ul","ol","li","a","img","blockquote",
    "hr","table","thead","tbody","tr","th","td","pre","code","figure","figcaption","div","iframe"
  ]);
  const ALLOW_ATTR = new Set([
    "href","src","alt","title","colspan","rowspan","allow","allowfullscreen","frameborder","loading","referrerpolicy","width","height"
  ]);

  const walker = doc.createTreeWalker(main, NodeFilter.SHOW_ELEMENT);
  const toRemove = [];
  while (walker.nextNode()) {
    const el = walker.currentNode;
    if (!ALLOW.has(el.tagName.toLowerCase())) { toRemove.push(el); continue; }
    [...el.attributes].forEach(attr => {
      if (!ALLOW_ATTR.has(attr.name.toLowerCase())) el.removeAttribute(attr.name);
    });
  }
  toRemove.forEach(n => n.replaceWith(...n.childNodes));

  // Headings
  main.querySelectorAll("h1").forEach(h => (h.className = "text-3xl font-semibold mt-6 mb-3 text-slate-900 dark:text-white"));
  main.querySelectorAll("h2").forEach(h => (h.className = "text-2xl font-semibold mt-6 mb-3 text-slate-900 dark:text-white"));
  main.querySelectorAll("h3").forEach(h => (h.className = "text-xl font-bold mt-5 mb-2.5 text-slate-900 dark:text-white"));
  main.querySelectorAll("h4,h5,h6").forEach(h => (h.className = "text-lg font-semibold mt-4 mb-2 text-slate-900 dark:text-white"));

  // Body text
  main.querySelectorAll("p,li,figcaption").forEach(p => {
    p.classList.add("text-[15px]","leading-7","text-slate-800","dark:text-white/90");
    if (p.tagName.toLowerCase() === "p") p.classList.add("my-3");
  });

  // Lists
  main.querySelectorAll("ul").forEach(ul => (ul.className = "list-disc pl-6 my-3 space-y-1"));
  main.querySelectorAll("ol").forEach(ol => (ol.className = "list-decimal pl-6 my-3 space-y-1"));

  // Links & media
  main.querySelectorAll("a[href]").forEach(a => {
    a.target = "_blank";
    a.rel = "noreferrer";
    a.className = "underline decoration-slate-400/50 underline-offset-2 hover:text-slate-900 dark:decoration-white/40 dark:hover:text-white";
  });
  main.querySelectorAll("img[src]").forEach(img => {
    img.className = "max-w-full h-auto rounded-xl border border-black/10 dark:border-white/10 my-3";
  });

  // Responsive YouTube iframes
  main.querySelectorAll("iframe[src*='youtube.com'], iframe[src*='youtu.be']").forEach(ifr => {
    const wrap = doc.createElement("div");
    wrap.className = "relative w-full overflow-hidden rounded-xl border border-black/10 dark:border-white/10 my-4";
    wrap.style.paddingTop = "56.25%";
    ifr.className = "absolute left-0 top-0 h-full w-full";
    ifr.setAttribute("allowfullscreen", "");
    ifr.setAttribute("loading", "lazy");
    ifr.removeAttribute("width");
    ifr.removeAttribute("height");
    ifr.parentNode?.insertBefore(wrap, ifr);
    wrap.appendChild(ifr);
  });

  // Code blocks
  main.querySelectorAll("code").forEach(c => {
    c.classList.add("px-1.5","py-0.5","rounded","bg-black/5","dark:bg-white/10");
  });
  main.querySelectorAll("pre").forEach(pre => {
    pre.className = "my-4 p-3 rounded-xl overflow-auto bg-black/5 dark:bg-white/10";
  });

  // Tables
  main.querySelectorAll("table").forEach(table => {
    table.className = "w-full text-sm border-collapse";
    table.querySelectorAll("th").forEach(th =>
      th.classList.add("text-left","font-semibold","px-3","py-2","bg-black/5","dark:bg-white/10","text-slate-800","dark:text-white")
    );
    table.querySelectorAll("td").forEach(td =>
      td.classList.add("px-3","py-2","align-top","text-slate-800","dark:text-white/90","border-t","border-black/10","dark:border-white/10")
    );
    const wrap = doc.createElement("div");
    wrap.className = "overflow-x-auto rounded-xl border border-black/10 dark:border-white/10 my-4";
    table.parentNode?.insertBefore(wrap, table);
    wrap.appendChild(table);
  });

  const container = doc.createElement("div");
  container.append(...main.childNodes);
  return container.innerHTML;
}

/** =========================
 *  UI Bits
 *  ========================= */
function LectureCard({ title, blurb, onOpen }) {
  return (
    <button
      onClick={onOpen}
      className="text-left rounded-2xl border border-black/10 bg-black/5 p-4 shadow-sm shadow-black/5
                 hover:bg-black/10 transition dark:border-white/10 dark:bg-white/[0.06] dark:hover:bg-white/[0.12]"
    >
      <div className="text-lg font-semibold text-slate-900 dark:text-white">{title}</div>
      {blurb && <p className="mt-1 text-sm text-slate-700 dark:text-white/70">{blurb}</p>}
    </button>
  );
}

function LectureViewer({ url, onClose }) {
  const { html, loading, error } = useRtdPage(url);

  return (
    <div className="mt-8 rounded-2xl border border-black/10 dark:border-white/10 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-black/5 dark:bg-white/10">
        <div className="text-sm text-slate-700 dark:text-white/75">Viewer</div>
        <div className="flex gap-2">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-sm underline decoration-slate-400/50 underline-offset-2 hover:text-slate-900 dark:decoration-white/40 dark:hover:text-white"
          >
            Open full page
          </a>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm border border-black/10 bg-white hover:bg-black/5
                       dark:bg-slate-800 dark:text-white dark:border-white/15 dark:hover:bg-white/10"
          >
            Close
          </button>
        </div>
      </div>

      {loading && <div className="p-6 text-slate-700 dark:text-white/75">Loading lecture…</div>}

      {error && (
        <div className="p-6 text-slate-700 dark:text-white/75">
          Couldn’t inline the page (CORS). Showing the full page below:
          <div className="mt-4 h-[70vh]">
            <iframe title="Lecture" src={url} className="w-full h-full border-0" />
          </div>
        </div>
      )}

      {!loading && !error && (
        <article
          className="prose prose-slate max-w-none dark:prose-invert p-6"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </div>
  );
}

/** =========================
 *  Main Lectures Page
 *  ========================= */
export default function Lectures() {
  const [openId, setOpenId] = React.useState(LECTURES[0].id); // open Lecture 1 by default
  const current = LECTURES.find(l => l.id === openId);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-3 py-1 text-xs text-slate-700 dark:border-white/15 dark:bg-white/5 dark:text-white/80">
          Module Index
        </div>
        <h2 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">Lectures</h2>
      </div>

      {/* Cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LECTURES.map(lec => (
          <LectureCard
            key={lec.id}
            title={lec.title}
            blurb={lec.blurb}
            onOpen={() => setOpenId(lec.id)}
          />
        ))}
      </div>

      {/* Viewer */}
      {current?.url && <LectureViewer url={current.url} onClose={() => setOpenId("")} />}
    </div>
  );
}
