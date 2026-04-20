import React from "react";
import Link from "next/link";

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-elevie-gold">
        {title}
      </p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-elevie-sand pb-24">
      
      {/* HEADER */}
      <header className="sticky top-0 z-10 border-b border-white/30 bg-elevie-ink px-4 py-4 text-elevie-sand">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          
          <div>
            <h1 className="text-2xl md:text-3xl">
              Elevie Travel Suite
            </h1>
            <p className="text-sm text-white/70">
              Internal quoting platform
            </p>
          </div>

          {/* 🔥 BOTONES NUEVOS */}
          <div className="flex gap-3">
            <Link
              href="/quotes"
              className="rounded-xl bg-white/10 px-4 py-2 text-sm hover:bg-white/20 transition"
            >
              Quotes
            </Link>

            <Link
              href="/quotes/new"
              className="rounded-xl bg-white/10 px-4 py-2 text-sm hover:bg-white/20 transition"
            >
              New Quote
            </Link>
          </div>

        </div>
      </header>

      {/* CONTENIDO */}
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[1.1fr_1.4fr_0.9fr]">

        {/* IZQUIERDA */}
        <div className="space-y-6">
          <SectionCard title="Dashboard">
            <p className="text-sm text-slate-500">
              Manage all quotes, create new ones, and track progress.
            </p>
          </SectionCard>

          <SectionCard title="Quick Actions">
            <div className="flex flex-col gap-3">
              <Link
                href="/quotes"
                className="rounded-xl bg-elevie-mist p-4 text-sm hover:bg-gray-200"
              >
                View all quotes
              </Link>

              <Link
                href="/quotes/new"
                className="rounded-xl bg-elevie-mist p-4 text-sm hover:bg-gray-200"
              >
                Create new quote
              </Link>
            </div>
          </SectionCard>
        </div>

        {/* CENTRO */}
        <div>
          <SectionCard title="Elevie">
            <p className="text-sm text-slate-500">
              This is your internal system to create and manage luxury travel quotes.
            </p>
          </SectionCard>
        </div>

        {/* DERECHA */}
        <div className="hidden md:block">
          <SectionCard title="Status">
            <p className="text-sm text-slate-500">
              Drafts, sent quotes, and confirmed trips will appear here.
            </p>
          </SectionCard>
        </div>

      </div>

    </main>
  );
}
