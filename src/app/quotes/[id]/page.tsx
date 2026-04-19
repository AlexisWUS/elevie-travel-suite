// src/app/quotes/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Quote {
  id: string;
  title: string | null;
  status: string;
  quote_number: string;
  destination_main: string | null;
  departure_date: string | null;
  return_date: string | null;
  pax_count: number | null;
}

export default function QuoteDetailPage() {
  const { id } = useParams();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuote() {
      const { data, error } = await supabase
        .from("quotes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error al cargar la cotización:", error.message);
        setQuote(null);
      } else {
        setQuote(data);
      }
      setLoading(false);
    }
    fetchQuote();
  }, [id]);

    if (loading) {
      return <p className="p-4">Cargando cotización…</p>;
    }

    if (!quote) {
      return (
        <main className="p-4 max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Cotización no encontrada</h1>
          <Link href="/quotes" className="text-blue-700">
            Volver al listado
          </Link>
        </main>
      );
    }

    return (
      <main className="p-4 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">{quote.title ?? `Cotización ${quote.quote_number}`}</h1>
        <p className="mb-2"><strong>Estado:</strong> {quote.status}</p>
        <p className="mb-2"><strong>Destino:</strong> {quote.destination_main}</p>
        <p className="mb-2"><strong>Salida:</strong> {quote.departure_date ?? 'Sin fecha'}</p>
        <p className="mb-2"><strong>Regreso:</strong> {quote.return_date ?? 'Sin fecha'}</p>
        <p className="mb-2"><strong>Pasajeros:</strong> {quote.pax_count}</p>

        <Link href="/quotes" className="text-blue-700">
          Volver al listado
        </Link>
      </main>
    );
}
