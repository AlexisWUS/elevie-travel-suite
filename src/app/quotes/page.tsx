"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

interface Quote {
  id: string;
  title: string | null;
  status: string;
  quote_number: string;
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuotes() {
      const { data, error } = await supabase
        .from("quotes")
        .select("id, title, status, quote_number")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error al cargar cotizaciones:", error.message);
        setQuotes([]);
      } else {
        setQuotes(data || []);
      }
      setLoading(false);
    }

    fetchQuotes();
  }, []);

  if (loading) {
    return <p className="p-4">Cargando cotizaciones...</p>;
  }

  return (
    <main className="p-4 max-w-2xl mx-auto space-y-4">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quotes</h1>

        <div className="flex gap-2">
          <Link
            href="/"
            className="bg-gray-200 text-black px-3 py-2 rounded text-sm"
          >
            Home
          </Link>

          <Link
            href="/quotes/new"
            className="bg-indigo-600 text-white px-4 py-2 rounded text-sm"
          >
            New Quote
          </Link>
        </div>
      </div>

      {/* LISTA */}
      <ul className="space-y-2">
        {quotes.length === 0 && (
          <li className="text-gray-500">No hay cotizaciones todavía.</li>
        )}

        {quotes.map((quote) => (
          <li
            key={quote.id}
            className="border rounded p-3 hover:bg-gray-50"
          >
            <Link href={`/quotes/${quote.id}`} className="block">
              <p className="font-medium text-blue-700">
                {quote.title ?? `Cotización ${quote.quote_number}`}
              </p>
              <p className="text-sm text-gray-500">{quote.status}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
