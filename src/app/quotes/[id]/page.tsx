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

interface QuoteItem {
  id: string;
  service_type: string;
  service_name: string;
  currency: string;
  unit_cost: number;
  tax_amount: number;
  markup_enabled: boolean;
  markup_percent: number;
  apply_cc_fee: boolean;
  details: any;
}

export default function QuoteDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const { data: quoteData } = await supabase
        .from("quotes")
        .select("*")
        .eq("id", id)
        .single();

      const { data: itemsData } = await supabase
        .from("quote_items")
        .select("*")
        .eq("quote_id", id)
        .order("created_at", { ascending: true });

      setQuote(quoteData);
      setItems(itemsData || []);
      setLoading(false);
    }

    if (id) fetchData();
  }, [id]);

  async function handleDelete() {
    const confirmDelete = confirm("Delete this quote?");
    if (!confirmDelete) return;

    await supabase.from("quotes").delete().eq("id", id);

    router.push("/quotes");
    router.refresh();
  }

  if (loading) {
    return <div style={{ padding: "24px" }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px" }}>
      <h1 style={{ fontSize: "28px" }}>{quote?.title}</h1>

      <div style={{ marginTop: "10px" }}>
        <strong>Destination:</strong> {quote?.destination_main}
      </div>

      <div style={{ marginTop: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <Link href={`/quotes/${id}/edit`} style={btnDark}>Edit</Link>
        <Link href={`/quotes/${id}/services/new`} style={btnPrimary}>Add Service</Link>
        <button onClick={handleDelete} style={btnDanger}>Delete</button>
      </div>

      {/* SERVICES */}
      <div style={{ marginTop: "40px" }}>
        <h2>Services</h2>

        {items.length === 0 && (
          <div style={{ marginTop: "10px", color: "#777" }}>
            No services yet
          </div>
        )}

        {items.map((item) => {
          const total = item.unit_cost + item.tax_amount;

          return (
            <div key={item.id} style={card}>
              <div style={{ fontWeight: "bold" }}>
                {item.service_type.toUpperCase()} — {item.service_name}
              </div>

              <div style={{ marginTop: "6px" }}>
                {item.currency} {total.toLocaleString()}
              </div>

              {item.markup_enabled && (
                <div style={{ marginTop: "4px", fontSize: "13px" }}>
                  Markup: {item.markup_percent}%
                </div>
              )}

              {!item.apply_cc_fee && (
                <div style={{ marginTop: "4px", fontSize: "13px" }}>
                  No CC fee
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* STYLES */

const btnDark = {
  padding: "10px 16px",
  background: "#000",
  color: "#fff",
  borderRadius: "8px",
  textDecoration: "none",
};

const btnPrimary = {
  padding: "10px 16px",
  background: "#1f5eff",
  color: "#fff",
  borderRadius: "8px",
  textDecoration: "none",
};

const btnDanger = {
  padding: "10px 16px",
  background: "red",
  color: "#fff",
  borderRadius: "8px",
  border: "none",
};

const card = {
  border: "1px solid #eee",
  borderRadius: "10px",
  padding: "16px",
  marginTop: "12px",
};
