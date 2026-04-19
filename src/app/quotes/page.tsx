"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

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
        .from('quotes')
        .select('id, title, status, quote_number')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error al cargar cotizaciones:', error.message);
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
    <main className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Cotizaciones</h1>
      <Link
        href="/quotes/new"
        className="bg-indigo-600 text-white px-4 py-2 rounded"
      >
        Nueva cotización
      </Link>
      <ul className="mt-4 space-y-2">
        {quotes.length === 0 && (
          <li className="text-gray-500">No hay cotizaciones todavía.</li>
        )}
        {quotes.map((quote) => (
          <li key={quote.id} className="border-b pb-2">
            <Link href={`/quotes/${quote.id}`} className="text-blue-700">
              {quote.title ?? `Cotización ${quote.quote_number}`}
            </Link>
            <span className="ml-2 text-sm text-gray-500">{quote.status}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
