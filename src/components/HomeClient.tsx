"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useRef } from "react";

const ThreeBackground = dynamic(() => import("./ThreeBackground"), {
  ssr: false,
});

const accentStyles: Record<string, string> = {
  rose: "hover:border-rose-500/70 hover:ring-rose-500/30 hover:shadow-[0_24px_60px_rgba(244,63,94,0.25)] before:bg-[radial-gradient(circle_at_top,rgba(244,63,94,0.3),transparent_60%)]",
  cyan: "hover:border-cyan-400/70 hover:ring-cyan-400/30 hover:shadow-[0_24px_60px_rgba(56,189,248,0.22)] before:bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.28),transparent_60%)]",
  emerald: "hover:border-emerald-400/70 hover:ring-emerald-400/30 hover:shadow-[0_24px_60px_rgba(16,185,129,0.22)] before:bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.28),transparent_60%)]",
  slate: "hover:border-slate-400/60 hover:ring-slate-400/25 hover:shadow-[0_24px_60px_rgba(148,163,184,0.18)] before:bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.25),transparent_60%)]",
};

function FeatureCard({
  children,
  accent = "rose",
}: {
  children: React.ReactNode;
  accent?: "rose" | "cyan" | "emerald" | "slate";
}) {
  const accentClassName = accentStyles[accent] ?? accentStyles.rose;
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/40 px-5 py-5 text-sm text-slate-200 transition duration-300 ease-out hover:-translate-y-2 hover:scale-[1.02] hover:bg-slate-900/70 hover:ring-1 before:pointer-events-none before:absolute before:inset-0 before:opacity-0 before:transition before:duration-300 hover:before:opacity-100 ${accentClassName}`}
    >
      {children}
    </div>
  );
}

export default function HomeClient() {
  const accentCycle = ["rose", "cyan", "emerald", "slate"] as const;
  const accentForIndex = (index: number) =>
    accentCycle[index % accentCycle.length];
  const rootRef = useRef<HTMLDivElement | null>(null);

  return (
    <main
      ref={rootRef}
      className="relative min-h-screen overflow-hidden bg-[#0a0a0a] text-slate-100"
    >
      <ThreeBackground />

      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.08),transparent_55%),radial-gradient(circle_at_20%_20%,rgba(244,63,94,0.12),transparent_45%),radial-gradient(circle_at_85%_70%,rgba(16,185,129,0.1),transparent_45%)]" />
      <div className="pointer-events-none absolute left-1/2 top-6 h-24 w-[70%] -translate-x-1/2 rounded-full bg-slate-900/40 blur-3xl" />
      <div className="pointer-events-none absolute left-[-14%] top-[14%] h-72 w-72 rounded-full bg-rose-500/12 blur-[95px]" />
      <div className="pointer-events-none absolute right-[-16%] top-[40%] h-80 w-80 rounded-full bg-cyan-400/12 blur-[120px]" />
      <div className="pointer-events-none absolute left-[20%] top-[68%] h-64 w-64 rounded-full bg-emerald-400/10 blur-[110px]" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-28 px-6 pb-32 pt-24">
        {/* ---------------- HERO ---------------- */}
        <section className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col gap-7">
            <div className="inline-flex items-center gap-3 self-start rounded-full border border-slate-800 bg-slate-900/60 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.32em] text-slate-300">
              <span className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.7)]" />
              Ticket Cancellation
            </div>

            <div className="inline-flex items-center gap-2 self-start rounded-full border border-slate-800 bg-slate-900/70 px-4 py-2 text-xs uppercase tracking-[0.28em] text-slate-300">
              <span className="font-semibold text-white">R.I.P</span>
              <span className="h-1 w-1 rounded-full bg-rose-400" />
              <span>Refund in process</span>
            </div>

            <div className="space-y-6">
              <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                A calm, designed experience for passengers and support teams.
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-slate-300">
                Passengers manage tickets and refunds. Admins verify, approve,
                and close the loop — without confusion.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-5">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl border border-rose-500/40 bg-rose-500/40 px-8 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-white transition hover:border-rose-500 hover:bg-rose-500/20"
              >
                Sign in to continue
              </Link>
              <a
                href="#flow"
                className="text-xs uppercase tracking-[0.26em] text-slate-400 transition hover:text-white"
              >
                See the refund flow
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/80 via-slate-950/60 to-slate-900/30 p-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                Ticket Journey
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white">
                A clear sequence for every rider
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                From booking to refund updates, every step stays easy to follow.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              {[
                "Ticket view",
                "Cancellation request",
                "Eligibility review",
                "Refund confirmation",
              ].map((label, index) => (
                <FeatureCard key={label} accent={accentForIndex(index)}>
                  {label}
                </FeatureCard>
              ))}
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-800 to-transparent" />

        {/* ---------------- PASSENGER / ADMIN ---------------- */}
        <section className="grid gap-10 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
              For Passengers
            </p>
            <h3 className="mt-3 text-xl font-semibold text-white">
              Your ticket, always within reach
            </h3>
            <p className="mt-2 text-sm text-slate-300">
              View your trip, request a cancellation, and stay informed as
              refunds progress.
            </p>

            <div className="mt-7 space-y-4">
              {[
                "Ticket timeline with seat and route details",
                "One-tap cancellation request",
                "Refund status updates when processed",
              ].map((item, index) => (
                <FeatureCard key={item} accent={accentForIndex(index)}>
                  {item}
                </FeatureCard>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
              For Admins
            </p>
            <h3 className="mt-3 text-xl font-semibold text-white">
              Operational control without chaos
            </h3>
            <p className="mt-2 text-sm text-slate-300">
              Review requests, verify tickets, and record every decision with a
              clean audit trail.
            </p>

            <div className="mt-7 space-y-4">
              {[
                "Refund approval queue with priority flags",
                "Eligibility checks and route validation",
                "Passenger messaging history",
              ].map((item, index) => (
                <FeatureCard key={item} accent={accentForIndex(index)}>
                  {item}
                </FeatureCard>
              ))}
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-800 to-transparent" />

        {/* ---------------- FLOW ---------------- */}
        <section id="flow" className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
              Admin Workflow
            </p>
            <h3 className="mt-3 text-xl font-semibold text-white">
              How admins keep it moving
            </h3>
            <p className="mt-2 text-sm text-slate-300">
              Each step is designed to reduce confusion and keep decisions
              transparent.
            </p>

            <div className="mt-7 space-y-4">
              {[
                {
                  title: "Verify ticket",
                  detail: "Confirm route and passenger details.",
                },
                {
                  title: "Approve refund",
                  detail: "Apply policy and log the decision.",
                },
                {
                  title: "Notify rider",
                  detail: "Send a clear update and close the loop.",
                },
              ].map((row, index) => (
                <FeatureCard key={row.title} accent={accentForIndex(index)}>
                  <div className="flex items-start gap-4">
                    <div className="mt-1 h-7 w-7 rounded-full border border-rose-500/40 bg-rose-500/10 text-center text-xs font-semibold leading-7 text-rose-200">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {row.title}
                      </p>
                      <p className="mt-1 text-sm text-slate-300">
                        {row.detail}
                      </p>
                    </div>
                  </div>
                </FeatureCard>
              ))}
            </div>
          </div>

          {/* Refund Flow Timeline */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
              Refund Flow
            </p>
            <p className="mt-2 text-sm text-slate-300">
              A simple sequence riders can follow from cancellation to
              confirmation.
            </p>

            <div className="relative mt-7 space-y-6 border-l border-slate-800 pl-6">
              {[
                "Ticket cancellation",
                "Refund initiated",
                "Admin decision",
                "Rider confirmation",
              ].map((title, index) => (
                <div key={title} className="relative">
                  <span className="absolute -left-7.5 top-6 h-3 w-3 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]" />
                  <FeatureCard accent={accentForIndex(index)}>
                    {title}
                  </FeatureCard>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-800 to-transparent" />

        {/* ---------------- NOTIFICATIONS ---------------- */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
            Notifications
          </p>

          <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <h3 className="text-xl font-semibold text-white">
                Email updates, without the noise
              </h3>
              <p className="mt-2 text-sm text-slate-300">
                Riders receive clear, concise updates so they know what happens
                next.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                "Booking confirmation",
                "Ticket cancellation",
                "Refund initiated",
                "Refund approved or declined",
                "Refund completed",
              ].map((item, index) => (
                <FeatureCard key={item} accent={accentForIndex(index)}>
                  {item}
                </FeatureCard>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
