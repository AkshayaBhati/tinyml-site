// src/StaffPage.jsx
import React from "react";

// Optional photos (remove the imports or set photo: null if you don’t have these files)
import rahulPhoto   from "./assets/staff/rahul.jpg";
import mohitPhoto   from "./assets/staff/mohit.jpg";
import hansikaPhoto from "./assets/staff/hansika.jpg";
import akshayaPhoto from "./assets/staff/akshaya.jpg";

/* ========== DATA ========== */
const FACULTY = [
  {
    name: "Rahul Mangharam",
    role: "Instructor",
    email: "rahulm@seas.upenn.edu",
    office: "Levine 279 (xLAB)",
    hours: "Drop-in Hour: Wed 12–1 pm",
    photo: rahulPhoto || null,
    website: "",
    calendly: "",
  },
];

// ⬇️ Akshaya first as requested
const TAs = [
  {
    name: "Akshaya Nidhi Bhati",
    role: "Teaching Assistant",
    email: "akshayabhati.upenn@gmail.com",
    hours: "Office Hours: Mon 2–3 pm",
    photo: akshayaPhoto || null,
  },
  {
    name: "Mohit Shah",
    role: "Teaching Assistant",
    email: "moshah@seas.upenn.edu",
    hours: "Recitation: Thu 5:00–6:00 pm",
    photo: mohitPhoto || null,
  },
  {
    name: "Hansika Dorai",
    role: "Teaching Assistant",
    email: "hadorai@seas.upenn.edu",
    hours: "Recitation: Tue 3:45–4:45 pm",
    photo: hansikaPhoto || null,
  },
];

/* ========== UI ========== */
function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-black/10 bg-black/5 px-2.5 py-0.5 text-xs text-slate-700 dark:border-white/15 dark:bg-white/10 dark:text-white/80">
      {children}
    </span>
  );
}

function StaffCard({ person }) {
  const { name, role, email, office, hours, photo, website, calendly } = person;

  return (
    <article className="h-full rounded-2xl border border-black/10 bg-black/5 p-6 text-center shadow-sm shadow-black/5 transition hover:shadow-md dark:border-white/10 dark:bg-white/5">
      {/* Photo */}
      <div className="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full border border-black/10 bg-gradient-to-br from-emerald-200 to-sky-200 dark:from-emerald-900/40 dark:to-sky-900/40 dark:border-white/10">
        {photo ? (
          <img
            src={photo}
            alt={`${name} headshot`}
            className="h-full w-full object-cover"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        ) : null}
      </div>

      {/* Name + role */}
      <h3 className="text-lg font-semibold leading-tight text-slate-900 dark:text-white">{name}</h3>
      <div className="mt-1">
        <Pill>{role}</Pill>
      </div>

      {/* Contact / details */}
      <div className="mt-4 space-y-1 text-[14px] leading-6 text-slate-800 dark:text-white/90">
        {email && (
          <div>
            <span className="text-slate-500 dark:text-white/60 mr-1">Email:</span>
            <a
              href={`mailto:${email}`}
              className="underline decoration-slate-400/50 underline-offset-2 hover:text-slate-900 dark:decoration-white/40 dark:hover:text-white break-all"
            >
              {email}
            </a>
          </div>
        )}
        {office && (
          <div>
            <span className="text-slate-500 dark:text-white/60 mr-1">Office:</span>
            <span>{office}</span>
          </div>
        )}
        {hours && (
          <div>
            <span className="text-slate-500 dark:text-white/60 mr-1">Hours:</span>
            <span>{hours}</span>
          </div>
        )}
      </div>

      {/* Optional links */}
      {(website || calendly) && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-black/10 bg-white/80 px-3 py-1.5 text-xs text-slate-800 hover:bg-white dark:border-white/15 dark:bg-white/10 dark:text-white/85"
            >
              Website
            </a>
          )}
          {calendly && (
            <a
              href={calendly}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-black/10 bg-white/80 px-3 py-1.5 text-xs text-slate-800 hover:bg-white dark:border-white/15 dark:bg-white/10 dark:text-white/85"
            >
              Book time
            </a>
          )}
        </div>
      )}
    </article>
  );
}

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

/* ========== PAGE ========== */
export default function StaffPage() {
  return (
    <>
      {/* Instructor as a single large card row */}
      <Section eyebrow="Course Team" title="Instructor">
        <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FACULTY.map((p) => (
            <StaffCard key={p.email || p.name} person={p} />
          ))}
        </div>
      </Section>

      {/* TA grid — Akshaya */}
      <Section eyebrow="Teaching Fellows" title="Teaching Assistants">
        <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TAs.map((p) => (
            <StaffCard key={p.email || p.name} person={p} />
          ))}
        </div>
      </Section>

      {/* Footer note */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-16">
        <div className="rounded-2xl border border-black/10 bg-black/5 p-5 text-[15px] leading-7 text-slate-800 shadow-sm shadow-black/5 dark:border-white/10 dark:bg-white/5 dark:text-white/85">
          <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">Contact & Logistics</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>General questions: please post on the course Ed Discussion forum so others can benefit.</li>
            <li>Private matters (extensions, grading): email the instructor or post privately on Ed Discussion.</li>
          </ul>
        </div>
      </section>
    </>
  );
}
