"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function NewQuoteServicePage() {
  const { id } = useParams();
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [serviceType, setServiceType] = useState("hotel");
  const [serviceName, setServiceName] = useState("");
  const [city, setCity] = useState("");
  const [supplier, setSupplier] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [unitCost, setUnitCost] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [taxAmount, setTaxAmount] = useState("0");
  const [markupEnabled, setMarkupEnabled] = useState(false);
  const [markupPercent, setMarkupPercent] = useState("0");
  const [applyCcFee, setApplyCcFee] = useState(true);
  const [notes, setNotes] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const { error } = await supabase.from("quote_items").insert({
      quote_id: id,
      service_type: serviceType,
      service_name: serviceName,
      city: city || null,
      supplier: supplier || null,
      currency,
      unit_cost: unitCost ? Number(unitCost) : 0,
      quantity: quantity ? Number(quantity) : 1,
      tax_amount: taxAmount ? Number(taxAmount) : 0,
      markup_enabled: markupEnabled,
      markup_percent: markupPercent ? Number(markupPercent) : 0,
      apply_cc_fee: applyCcFee,
      notes: notes || null,
    });

    if (error) {
      setError("No se pudo guardar el servicio.");
      setSaving(false);
      return;
    }

    router.push(`/quotes/${id}`);
    router.refresh();
  }

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto", padding: "24px" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "24px" }}>Add Service</h1>

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
          <label style={{ display: "block", marginBottom: "6px" }}>Service Type</label>
          <select
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
          >
            <option value="flight">flight</option>
            <option value="hotel">hotel</option>
            <option value="transfer">transfer</option>
            <option value="tour">tour</option>
            <option value="extra">extra</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "6px" }}>Service Name</label>
          <input
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
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
          <label style={{ display: "block", marginBottom: "6px" }}>City</label>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "6px" }}>Supplier</label>
          <input
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "6px" }}>Currency</label>
          <input
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "6px" }}>Unit Cost</label>
          <input
            type="number"
            step="0.01"
            value={unitCost}
            onChange={(e) => setUnitCost(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "6px" }}>Quantity</label>
          <input
            type="number"
            step="0.01"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "6px" }}>Tax Amount</label>
          <input
            type="number"
            step="0.01"
            value={taxAmount}
            onChange={(e) => setTaxAmount(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
          />
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <input
            type="checkbox"
            checked={markupEnabled}
            onChange={(e) => setMarkupEnabled(e.target.checked)}
          />
          Enable markup for this service
        </label>

        <div>
          <label style={{ display: "block", marginBottom: "6px" }}>Markup Percent</label>
          <input
            type="number"
            step="0.01"
            value={markupPercent}
            onChange={(e) => setMarkupPercent(e.target.value)}
            disabled={!markupEnabled}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              background: markupEnabled ? "white" : "#f3f3f3",
            }}
          />
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <input
            type="checkbox"
            checked={applyCcFee}
            onChange={(e) => setApplyCcFee(e.target.checked)}
          />
          Apply credit card fee to this service
        </label>

        <div>
          <label style={{ display: "block", marginBottom: "6px" }}>Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
          />
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
            {saving ? "Saving..." : "Save Service"}
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
