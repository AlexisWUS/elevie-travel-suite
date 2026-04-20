"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

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
  const router = useRouter();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

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

  const handleDelete = async () => {
    if (!quote) return;

    const confirmed = window.confirm(
      "¿Seguro que quieres borrar esta cotización?"
    );

    if (!confirmed) return;

    setDeleting(true);

    const { error } = await supabase
      .from("quotes")
      .delete()
      .eq("id", quote.id);

    if (error) {
      alert(`Error al borrar la cotización: ${error.message}`);
      setDeleting(false);
      return;
    }

    router.push("/quotes");
  };

  if (loading) {
    return <p className="p-4">Cargando cotización...</p>;
  }

  if (!quote) {
    return (
      <main className="p-4 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Quote no encontrada</h1>
        <Link href="/quotes" className="text-blue-700">
          Volver al listado
        </Link>
      </main>
    );
  }

  return (
    <main className="p-4 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <Link
          href="/quotes"
          className="bg-gray-200 text-black px-3 py-2 rounded text-sm"
        >
          Back to Quotes
        </Link>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="bg-red-600 text-white px-4 py-2 rounded text-sm"
        >
          {deleting ? "Deleting..." : "Delete Quote"}
        </button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">
          {quote.title ?? `Quote ${quote.quote_number}`}
        </h1>
      </div>

      <div className="space-y-2 text-lg">
        <p>
          <strong>Estado:</strong> {quote.status}
        </p>
        <p>
          <strong>Destino:</strong> {quote.destination_main ?? "Sin destino"}
        </p>
        <p>
          <strong>Salida:</strong> {quote.departure_date ?? "Sin fecha"}
        </p>
        <p>
          <strong>Regreso:</strong> {quote.return_date ?? "Sin fecha"}
        </p>
        <p>
          <strong>Pasajeros:</strong> {quote.pax_count ?? 0}
        </p>
      </div>
    </main>
  );
}
