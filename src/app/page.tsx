import React from "react";

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
      <header className="sticky top-0 z-10 border-b border-white/30 bg-elevie-ink px-4 py-4 text-elevie-sand">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl">
              Elevie Travel Suite
            </h1>
            <p className="text-sm text-white/70">
              Mobile-first internal quoting platform
            </p>
          </div>
          <button className="rounded-xl bg-white/10 px-4 py-2 text-sm">
            Nueva cotización
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[1.1fr_1.4fr_0.9fr]">
        
        <div className="space-y-6">
          <SectionCard title="Datos generales">
            <div className="grid gap-3">
              <input
                className="rounded-xl border border-elevie-mist px-4 py-3"
                placeholder="Nombre del viaje"
              />
              <input
                className="rounded-xl border border-elevie-mist px-4 py-3"
                placeholder="Destino principal"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="rounded-xl border border-elevie-mist px-4 py-3"
                  placeholder="Salida"
                />
                <input
                  className="rounded-xl border border-elevie-mist px-4 py-3"
                  placeholder="Regreso"
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Versiones">
            <div className="space-y-3 text-sm">
              <div className="rounded-xl bg-elevie-mist p-4">
                V1 · Draft inicial
              </div>
              <div className="rounded-xl bg-elevie-mist p-4">
                V2 · Pendiente de exportación
              </div>
            </div>
          </SectionCard>
        </div>

        <div>
          <SectionCard title="Itinerario">
            <p className="text-sm text-slate-500">
              Editor flexible por categoría, pensado para iPhone y desktop.
            </p>
          </SectionCard>
        </div>

        <div className="hidden md:block"></div>

      </div>

    </main>
  );
}
