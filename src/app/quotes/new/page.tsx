"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function NewQuotePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [departure, setDeparture] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [paxCount, setPaxCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { data, error } = await supabase
      .from('quotes')
      .insert({
        title,
        destination_main: destination,
        departure_date: departure ? new Date(departure).toISOString() : null,
        return_date: returnDate ? new Date(returnDate).toISOString() : null,
        pax_count: paxCount,
        status: 'draft',
      })
      .select()
      .single();

    if (error) {
      setErrorMsg(`Error al crear la cotización: ${error.message}`);
      setLoading(false);
    } else if (data) {
      router.push(`/quotes/${data.id}`);
    }
  };

  return (
    <main className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Nueva cotización</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Nombre de la cotización</span>
          <input
            type="text"
            className="mt-1 w-full border rounded p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Destino principal</span>
          <input
            type="text"
            className="mt-1 w-full border rounded p-2"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Salida</span>
          <input
            type="date"
            className="mt-1 w-full border rounded p-2"
            value={departure}
            onChange={(e) => setDeparture(e.target.value)}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Regreso</span>
          <input
            type="date"
            className="mt-1 w-full border rounded p-2"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Número de pasajeros</span>
          <input
            type="number"
            min="1"
            className="mt-1 w-full border rounded p-2"
            value={paxCount}
            onChange={(e) => setPaxCount(Number(e.target.value))}
          />
        </label>

        {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white rounded px-4 py-2"
        >
          {loading ? 'Guardando...' : 'Crear cotización'}
        </button>
      </form>
    </main>
  );
}
