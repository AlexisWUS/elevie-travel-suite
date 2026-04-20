"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function EditQuotePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [destinationMain, setDestinationMain] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [paxCount, setPaxCount] = useState("");
  const [status, setStatus] = useState("draft");

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
        setError("No se pudo cargar la cotización.");
        setLoading(false);
        return;
      }

      setTitle(data.title || "");
      setDestinationMain(data.destination_main || "");
      setDepartureDate(data.departure_date || "");
      setReturnDate(data.return_date || "");
      setPaxCount(data.pax_count ? String(data.pax_count) : "");
      setStatus(data.status || "draft");

      setLoading(false);
    }

    if (id) fetchQuote();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const { error } = await supabase
      .from("quotes")
      .update({
        title,
        destination_main: destinationMain,
        departure_date: departureDate || null,
        return_date: returnDate || null,
        pax_count: paxCount ? Number(paxCount) : null,
        status,
      })
      .eq("id", id);

    if (error) {
      setError("No se pudo guardar la cotización.");
      setSaving(false);
      return;
    }

    router.push(`/quotes/${id}`);
    router.refresh();
  }

  if (loading) {
    return <div style={{ padding: "24px" }}>Cargando cotización...</div>;
  }

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "24px" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "24px" }}>Edit Quote</h1>

      {error && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px",
            borderRadius: "8px",
            background: "#fdeaea",
            color: "#8a1f1f",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
        <div>
          <label style={{ display: "block", marginBottom: "6px" }}>Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "6px" }}>
            Main Destination
          </label>
          <input
            value={destinationMain}
            onChange={(e) => setDestinationMain(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "6px" }}>
            Departure Date
          </label>
          <input
            type="date"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "6px" }}>
            Return Date
          </label>
          <input
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "6px" }}>
            Pax Count
          </label>
          <input
            type="number"
            value={paxCount}
            onChange={(e) => setPaxCount(e.target.value)}
            min="1"
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "6px" }}>Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
          >
            <option value="draft">draft</option>
            <option value="sent">sent</option>
            <option value="confirmed">confirmed</option>
            <option value="cancelled">cancelled</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "12px 18px",
              borderRadius: "8px",
              border: "none",
              background: "black",
              color: "white",
              cursor: "pointer",
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={() => router.push(`/quotes/${id}`)}
            style={{
              padding: "12px 18px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              background: "white",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
