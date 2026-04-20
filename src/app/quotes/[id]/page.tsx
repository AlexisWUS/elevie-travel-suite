"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

interface Quote {
  id: string;
  title: string | null;
  status: string;
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
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchQuote() {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("quotes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setError("Error loading quote");
        setLoading(false);
        return;
      }

      setQuote(data);
      setLoading(false);
    }

    if (id) fetchQuote();
  }, [id]);

  async function handleDelete() {
    const confirmDelete = confirm("Are you sure you want to delete this quote?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("quotes")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Error deleting quote");
      return;
    }

    router.push("/quotes");
    router.refresh();
  }

  if (loading) {
    return <div style={{ padding: "24px" }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ padding: "24px" }}>{error}</div>;
  }

  if (!quote) {
    return <div style={{ padding: "24px" }}>Quote not found</div>;
  }

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "24px" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "20px" }}>
        {quote.title || "Untitled Quote"}
      </h1>

      <div style={{ marginBottom: "12px" }}>
        <strong>Status:</strong> {quote.status}
      </div>

      <div style={{ marginBottom: "12px" }}>
        <strong>Destination:</strong> {quote.destination_main || "-"}
      </div>

      <div style={{ marginBottom: "12px" }}>
        <strong>Departure:</strong> {quote.departure_date || "-"}
      </div>

      <div style={{ marginBottom: "12px" }}>
        <strong>Return:</strong> {quote.return_date || "-"}
      </div>

      <div style={{ marginBottom: "12px" }}>
        <strong>Pax:</strong> {quote.pax_count || "-"}
      </div>

      <div style={{ display: "flex", gap: "12px", marginTop: "24px", flexWrap: "wrap" }}>
        <Link
          href={`/quotes/${id}/edit`}
          style={{
            padding: "12px 18px",
            borderRadius: "8px",
            background: "black",
            color: "white",
            textDecoration: "none",
          }}
        >
          Edit Quote
        </Link>

        <Link
          href={`/quotes/${id}/services/new`}
          style={{
            padding: "12px 18px",
            borderRadius: "8px",
            background: "#1f5eff",
            color: "white",
            textDecoration: "none",
          }}
        >
          Add Service
        </Link>

        <button
          onClick={handleDelete}
          style={{
            padding: "12px 18px",
            borderRadius: "8px",
            border: "none",
            background: "red",
            color: "white",
            cursor: "pointer",
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
