"use client";

import { useEffect, useMemo, useState } from "react";
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
  quantity?: number | null;
  details: any;
}

interface ServiceTotals {
  base: number;
  taxes: number;
  markup: number;
  ccFee: number;
  total: number;
}

interface QuoteTotals {
  base: number;
  taxes: number;
  markup: number;
  ccFee: number;
  grandTotal: number;
}

const DEFAULT_CC_FEE_PERCENT = 5;

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

  function safeNumber(value: number | null | undefined) {
    if (value === null || value === undefined || Number.isNaN(value)) return 0;
    return Number(value);
  }

  function formatMoney(currency: string, amount: number) {
    return `${currency} ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return "—";

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString();
  }

  function getServiceLabel(serviceType: string) {
    switch (serviceType) {
      case "flight":
        return "FLIGHT";
      case "hotel":
        return "HOTEL";
      case "transfer":
        return "TRANSFER";
      case "tour":
        return "TOUR";
      case "extra":
        return "EXTRA";
      default:
        return serviceType?.toUpperCase() || "SERVICE";
    }
  }

  function getServiceSubtitle(item: QuoteItem) {
    const details = item.details || {};

    if (item.service_type === "hotel") {
      const parts = [
        details.city,
        details.room_type,
        details.meal_plan,
      ].filter(Boolean);

      return parts.length > 0 ? parts.join(" • ") : "Hotel service";
    }

    if (item.service_type === "flight") {
      const parts = [
        details.route,
        details.airline,
        details.cabin_class,
      ].filter(Boolean);

      return parts.length > 0 ? parts.join(" • ") : "Flight service";
    }

    if (item.service_type === "transfer") {
      const parts = [
        details.city,
        details.route,
      ].filter(Boolean);

      return parts.length > 0 ? parts.join(" • ") : "Transfer service";
    }

    if (item.service_type === "tour") {
      const parts = [
        details.city,
        details.duration,
      ].filter(Boolean);

      return parts.length > 0 ? parts.join(" • ") : "Tour service";
    }

    return details.city || details.route || "Service";
  }

  function calculateServiceTotals(item: QuoteItem): ServiceTotals {
    const quantity = Math.max(1, safeNumber(item.quantity));
    const unitCost = safeNumber(item.unit_cost);
    const taxes = safeNumber(item.tax_amount);

    const base = unitCost * quantity;

    const markupPercent = item.markup_enabled
      ? safeNumber(item.markup_percent)
      : 0;

    const markup = base * (markupPercent / 100);

    const subtotalBeforeCc = base + taxes + markup;

    const ccFee = item.apply_cc_fee === false
      ? 0
      : subtotalBeforeCc * (DEFAULT_CC_FEE_PERCENT / 100);

    const total = subtotalBeforeCc + ccFee;

    return {
      base,
      taxes,
      markup,
      ccFee,
      total,
    };
  }

  const quoteTotals: QuoteTotals = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        const totals = calculateServiceTotals(item);

        acc.base += totals.base;
        acc.taxes += totals.taxes;
        acc.markup += totals.markup;
        acc.ccFee += totals.ccFee;
        acc.grandTotal += totals.total;

        return acc;
      },
      {
        base: 0,
        taxes: 0,
        markup: 0,
        ccFee: 0,
        grandTotal: 0,
      }
    );
  }, [items]);

  const primaryCurrency = useMemo(() => {
    const firstCurrency = items.find((item) => item.currency)?.currency;
    return firstCurrency || "EUR";
  }, [items]);

  if (loading) {
    return <div style={{ padding: "32px" }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ padding: "32px", color: "red" }}>{error}</div>;
  }

  return (
    <div style={pageWrap}>
      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => router.push("/quotes")} style={backBtn}>
          ← Back to Quotes
        </button>
      </div>

      <div style={heroCard}>
        <div>
          <div style={eyebrow}>QUOTE DETAIL</div>
          <h1 style={titleStyle}>{quote?.title || "Untitled Quote"}</h1>

          <div style={metaGrid}>
            <div>
              <div style={metaLabel}>Destination</div>
              <div style={metaValue}>{quote?.destination_main || "—"}</div>
            </div>

            <div>
              <div style={metaLabel}>Dates</div>
              <div style={metaValue}>
                {formatDate(quote?.departure_date || null)} to{" "}
                {formatDate(quote?.return_date || null)}
              </div>
            </div>

            <div>
              <div style={metaLabel}>Passengers</div>
              <div style={metaValue}>{quote?.pax_count || "—"}</div>
            </div>

            <div>
              <div style={metaLabel}>Status</div>
              <div style={metaValue}>{quote?.status || "draft"}</div>
            </div>
          </div>
        </div>

        <div style={actionsRow}>
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
      </div>

      <div style={summaryCard}>
        <div style={summaryHeader}>
          <div>
            <div style={eyebrow}>SUMMARY</div>
            <h2 style={sectionTitle}>Quote Totals</h2>
          </div>
          <div style={currencyPill}>{primaryCurrency}</div>
        </div>

        <div style={summaryGrid}>
          <div style={summaryBox}>
            <div style={summaryLabel}>Base</div>
            <div style={summaryValue}>
              {formatMoney(primaryCurrency, quoteTotals.base)}
            </div>
          </div>

          <div style={summaryBox}>
            <div style={summaryLabel}>Taxes</div>
            <div style={summaryValue}>
              {formatMoney(primaryCurrency, quoteTotals.taxes)}
            </div>
          </div>

          <div style={summaryBox}>
            <div style={summaryLabel}>Markup</div>
            <div style={summaryValue}>
              {formatMoney(primaryCurrency, quoteTotals.markup)}
            </div>
          </div>

          <div style={summaryBox}>
            <div style={summaryLabel}>CC Fee</div>
            <div style={summaryValue}>
              {formatMoney(primaryCurrency, quoteTotals.ccFee)}
            </div>
          </div>
        </div>

        <div style={grandTotalRow}>
          <div>
            <div style={grandTotalLabel}>Grand Total</div>
            <div style={grandTotalNote}>Unified total for all services</div>
          </div>

          <div style={grandTotalValue}>
            {formatMoney(primaryCurrency, quoteTotals.grandTotal)}
          </div>
        </div>
      </div>

      <div style={{ marginTop: "40px" }}>
        <div style={servicesHeaderRow}>
          <h2 style={sectionTitle}>Services</h2>
          <div style={servicesCount}>
            {items.length} service{items.length === 1 ? "" : "s"}
          </div>
        </div>

        {items.length === 0 && (
          <div style={emptyState}>No services yet</div>
        )}

        {items.map((item) => {
          const totals = calculateServiceTotals(item);
          const details = item.details || {};

          return (
            <div key={item.id} style={card}>
              <div style={cardTopRow}>
                <div>
                  <div style={serviceTypeTag}>
                    {getServiceLabel(item.service_type)}
                  </div>
                  <div style={serviceName}>{item.service_name}</div>
                  <div style={serviceSubtitle}>{getServiceSubtitle(item)}</div>
                </div>

                <div style={serviceTotalBlock}>
                  <div style={summaryLabel}>Service Total</div>
                  <div style={serviceTotalValue}>
                    {formatMoney(item.currency || primaryCurrency, totals.total)}
                  </div>
                </div>
              </div>

              <div style={serviceMetaGrid}>
                <div style={serviceMetaBox}>
                  <div style={summaryLabel}>Base</div>
                  <div style={serviceMetaValue}>
                    {formatMoney(item.currency || primaryCurrency, totals.base)}
                  </div>
                </div>

                <div style={serviceMetaBox}>
                  <div style={summaryLabel}>Taxes</div>
                  <div style={serviceMetaValue}>
                    {formatMoney(item.currency || primaryCurrency, totals.taxes)}
                  </div>
                </div>

                <div style={serviceMetaBox}>
                  <div style={summaryLabel}>Markup</div>
                  <div style={serviceMetaValue}>
                    {formatMoney(item.currency || primaryCurrency, totals.markup)}
                  </div>
                </div>

                <div style={serviceMetaBox}>
                  <div style={summaryLabel}>CC Fee</div>
                  <div style={serviceMetaValue}>
                    {formatMoney(item.currency || primaryCurrency, totals.ccFee)}
                  </div>
                </div>
              </div>

              <div style={detailRow}>
                <div style={detailPill}>
                  Qty: {Math.max(1, safeNumber(item.quantity))}
                </div>

                {item.markup_enabled ? (
                  <div style={detailPill}>
                    Markup: {safeNumber(item.markup_percent)}%
                  </div>
                ) : (
                  <div style={detailPillMuted}>No markup</div>
                )}

                {item.apply_cc_fee === false ? (
                  <div style={detailPillMuted}>No CC fee</div>
                ) : (
                  <div style={detailPill}>CC fee included</div>
                )}

                {details?.supplier && (
                  <div style={detailPill}>Supplier: {details.supplier}</div>
                )}
              </div>

              <div style={{ marginTop: "14px" }}>
                <Link
                  href={`/quotes/${id}/services/${item.id}/edit`}
                  style={editServiceLink}
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

const pageWrap: React.CSSProperties = {
  maxWidth: "1100px",
  margin: "0 auto",
  padding: "32px",
};

const backBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#2f4756",
  cursor: "pointer",
  fontSize: "14px",
  padding: 0,
};

const heroCard: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e8e4dc",
  borderRadius: "20px",
  padding: "28px",
  display: "flex",
  justifyContent: "space-between",
  gap: "24px",
  alignItems: "flex-start",
  flexWrap: "wrap",
};

const eyebrow: React.CSSProperties = {
  fontSize: "12px",
  letterSpacing: "0.12em",
  color: "#8c7b6b",
  marginBottom: "10px",
};

const titleStyle: React.CSSProperties = {
  fontSize: "40px",
  lineHeight: 1.1,
  color: "#233746",
  margin: 0,
};

const metaGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: "16px",
  marginTop: "22px",
};

const metaLabel: React.CSSProperties = {
  fontSize: "12px",
  color: "#8b97a1",
  marginBottom: "6px",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const metaValue: React.CSSProperties = {
  fontSize: "15px",
  color: "#2f4756",
  fontWeight: 500,
};

const actionsRow: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  alignItems: "center",
  flexWrap: "wrap",
};

const summaryCard: React.CSSProperties = {
  marginTop: "24px",
  background: "#ffffff",
  border: "1px solid #e8e4dc",
  borderRadius: "20px",
  padding: "24px",
};

const summaryHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
  flexWrap: "wrap",
};

const sectionTitle: React.CSSProperties = {
  color: "#233746",
  margin: 0,
  fontSize: "24px",
};

const currencyPill: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: "999px",
  background: "#f5f1eb",
  color: "#6f5f52",
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "0.08em",
};

const summaryGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "14px",
  marginTop: "20px",
};

const summaryBox: React.CSSProperties = {
  background: "#faf8f4",
  border: "1px solid #eee8df",
  borderRadius: "16px",
  padding: "16px",
};

const summaryLabel: React.CSSProperties = {
  fontSize: "12px",
  color: "#8b97a1",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: "8px",
};

const summaryValue: React.CSSProperties = {
  fontSize: "22px",
  color: "#233746",
  fontWeight: 700,
};

const grandTotalRow: React.CSSProperties = {
  marginTop: "20px",
  paddingTop: "20px",
  borderTop: "1px solid #ece6dd",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
  flexWrap: "wrap",
};

const grandTotalLabel: React.CSSProperties = {
  fontSize: "14px",
  color: "#8b97a1",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const grandTotalNote: React.CSSProperties = {
  fontSize: "13px",
  color: "#8b97a1",
  marginTop: "6px",
};

const grandTotalValue: React.CSSProperties = {
  fontSize: "34px",
  color: "#233746",
  fontWeight: 700,
};

const servicesHeaderRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  marginBottom: "14px",
  flexWrap: "wrap",
};

const servicesCount: React.CSSProperties = {
  fontSize: "13px",
  color: "#8b97a1",
};

const emptyState: React.CSSProperties = {
  border: "1px dashed #d7d0c6",
  borderRadius: "16px",
  padding: "24px",
  color: "#8b97a1",
  background: "#fff",
};

const card: React.CSSProperties = {
  border: "1px solid #e8e4dc",
  borderRadius: "18px",
  padding: "20px",
  marginTop: "14px",
  background: "#ffffff",
};

const cardTopRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "18px",
  alignItems: "flex-start",
  flexWrap: "wrap",
};

const serviceTypeTag: React.CSSProperties = {
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: "999px",
  background: "#f3efe8",
  color: "#6f5f52",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.08em",
  marginBottom: "10px",
};

const serviceName: React.CSSProperties = {
  fontSize: "28px",
  lineHeight: 1.1,
  color: "#233746",
  fontWeight: 700,
};

const serviceSubtitle: React.CSSProperties = {
  marginTop: "8px",
  color: "#6b7c87",
  fontSize: "14px",
};

const serviceTotalBlock: React.CSSProperties = {
  minWidth: "180px",
};

const serviceTotalValue: React.CSSProperties = {
  fontSize: "28px",
  color: "#233746",
  fontWeight: 700,
};

const serviceMetaGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: "12px",
  marginTop: "18px",
};

const serviceMetaBox: React.CSSProperties = {
  background: "#faf8f4",
  border: "1px solid #eee8df",
  borderRadius: "14px",
  padding: "14px",
};

const serviceMetaValue: React.CSSProperties = {
  fontSize: "18px",
  color: "#233746",
  fontWeight: 700,
};

const detailRow: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginTop: "16px",
};

const detailPill: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: "999px",
  background: "#f5f1eb",
  color: "#4d5d68",
  fontSize: "13px",
};

const detailPillMuted: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: "999px",
  background: "#f7f7f7",
  color: "#7d8790",
  fontSize: "13px",
};

const btnBlack: React.CSSProperties = {
  padding: "10px 16px",
  background: "#111111",
  color: "#ffffff",
  borderRadius: "10px",
  textDecoration: "none",
  border: "none",
};

const btnBlue: React.CSSProperties = {
  padding: "10px 16px",
  background: "#233746",
  color: "#ffffff",
  borderRadius: "10px",
  textDecoration: "none",
  border: "none",
};

const btnRed: React.CSSProperties = {
  padding: "10px 16px",
  background: "#b42318",
  color: "#ffffff",
  borderRadius: "10px",
  border: "none",
  cursor: "pointer",
};

const editServiceLink: React.CSSProperties = {
  fontSize: "14px",
  color: "#233746",
  textDecoration: "none",
  fontWeight: 600,
};
