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
  unit_cost: number | null;
  tax_amount: number | null;
  markup_enabled: boolean | null;
  markup_percent: number | null;
  apply_cc_fee: boolean | null;
  details: any;
}

export default function QuoteDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");

      const { data: quoteData, error: quoteError } = await supabase
        .from("quotes")
        .select("*")
        .eq("id", id)
        .single();

      const { data: itemsData, error: itemsError } = await supabase
        .from("quote_items")
        .select("*")
        .eq("quote_id", id)
        .order("created_at", { ascending: true });

      if (quoteError) {
        setError("Error loading quote");
        setLoading(false);
        return;
      }

      if (itemsError) {
        setError("Error loading services");
        setLoading(false);
        return;
      }

      setQuote(quoteData);
      setItems(itemsData || []);
      setLoading(false);
    }

    if (id) fetchData();
  }, [id]);

  async function handleDelete() {
    const confirmDelete = confirm("Delete this quote?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("quotes").delete().eq("id", id);

    if (error) {
      alert("Could not delete quote");
      return;
    }

    router.push("/quotes");
    router.refresh();
  }

  function formatMoney(currency: string, amount: number) {
    return `${currency} ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  }

  if (loading) {
    return <div style={{ padding: "32px" }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ padding: "32px", color: "red" }}>{error}</div>;
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px" }}>
      
      {/* BACK */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => router.push("/quotes")}
          style={{
            background: "none",
            border: "none",
            color: "#2f4756",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          ← Back to Quotes
        </button>
      </div>

      {/* HEADER */}
      <h1 style={{ fontSize: "32px", color: "#2f4756", marginBottom: "10px" }}>
        {quote?.title}
      </h1>

      <div style={{ color: "#6b7c87" }}>
        Destination: {quote?.destination_main}
      </div>

      {/* ACTION BUTTONS */}
      <div style={{ marginTop: "24px", display: "flex", gap: "10px" }}>
        <Link href={`/quotes/${id}/edit`} style={btnBlack}>
          Edit
        </Link>

        <Link href={`/quotes/${id}/services/new`} style={btnBlue}>
          Add Service
        </Link>

        <button onClick={handleDelete} style={btnRed}>
          Delete
        </button>
      </div>

      {/* SERVICES */}
      <div style={{ marginTop: "40px" }}>
        <h2 style={{ color: "#2f4756" }}>Services</h2>

        {items.length === 0 && (
          <div style={{ marginTop: "10px", color: "#888" }}>
            No services yet
          </div>
        )}

        {items.map((item) => {
          const total =
            (item.unit_cost || 0) + (item.tax_amount || 0);

          return (
            <div key={item.id} style={card}>
              <div style={{ fontWeight: "bold", color: "#2f4756" }}>
                {item.service_type.toUpperCase()} — {item.service_name}
              </div>

              <div style={{ marginTop: "6px" }}>
                {formatMoney(item.currency, total)}
              </div>

              {item.markup_enabled && (
                <div style={smallText}>
                  Markup: {item.markup_percent}%
                </div>
              )}

              {!item.apply_cc_fee && (
                <div style={smallText}>
                  No CC fee
                </div>
              )}

              {/* EDIT SERVICE */}
              <div style={{ marginTop: "10px" }}>
                <Link
                  href={`/quotes/${id}/services/${item.id}/edit`}
                  style={{
                    fontSize: "13px",
                    color: "#1f5eff",
                    textDecoration: "none",
                  }}
                >
                  Edit Service
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* STYLES */

const btnBlack = {
  padding: "10px 16px",
  background: "#000",
  color: "#fff",
  borderRadius: "8px",
  textDecoration: "none",
};

const btnBlue = {
  padding: "10px 16px",
  background: "#1f5eff",
  color: "#fff",
  borderRadius: "8px",
  textDecoration: "none",
};

const btnRed = {
  padding: "10px 16px",
  background: "#d92d20",
  color: "#fff",
  borderRadius: "8px",
  border: "none",
};

const card = {
  border: "1px solid #eee",
  borderRadius: "12px",
  padding: "16px",
  marginTop: "12px",
  background: "white",
};

const smallText = {
  fontSize: "13px",
  marginTop: "4px",
  color: "#6b7c87",
};
