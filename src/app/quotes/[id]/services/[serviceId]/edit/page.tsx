"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type CurrencyCode = "USD" | "EUR" | "MXN" | "GBP" | "JPY" | "OTHER";

export default function EditQuoteServicePage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;
  const serviceId = params.serviceId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [serviceType, setServiceType] = useState("hotel");

  const [serviceName, setServiceName] = useState("");
  const [city, setCity] = useState("");
  const [supplier, setSupplier] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [notes, setNotes] = useState("");

  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [otherCurrency, setOtherCurrency] = useState("");

  const [unitCost, setUnitCost] = useState("");
  const [taxAmount, setTaxAmount] = useState("0");

  const [markupEnabled, setMarkupEnabled] = useState(false);
  const [markupPercent, setMarkupPercent] = useState("0");

  const [excludeCcFee, setExcludeCcFee] = useState(false);

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [nights, setNights] = useState("");
  const [roomType, setRoomType] = useState("");
  const [rooms, setRooms] = useState("1");
  const [mealPlan, setMealPlan] = useState("");

  const [airline, setAirline] = useState("");
  const [route, setRoute] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [departureAirport, setDepartureAirport] = useState("");
  const [arrivalAirport, setArrivalAirport] = useState("");
  const [departureDateTime, setDepartureDateTime] = useState("");
  const [arrivalDateTime, setArrivalDateTime] = useState("");
  const [cabinClass, setCabinClass] = useState("");

  useEffect(() => {
    async function fetchService() {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("quote_items")
        .select("*")
        .eq("id", serviceId)
        .single();

      if (error || !data) {
        setError("No se pudo cargar el servicio.");
        setLoading(false);
        return;
      }

      const details = data.details || {};

      setServiceType(data.service_type || "hotel");
      setServiceName(data.service_name || "");
      setCity(data.city || "");
      setSupplier(data.supplier || "");
      setConfirmationCode(data.confirmation_code || "");
      setNotes(data.notes || "");
      setUnitCost(data.unit_cost ? String(data.unit_cost) : "");
      setTaxAmount(data.tax_amount ? String(data.tax_amount) : "0");
      setMarkupEnabled(!!data.markup_enabled);
      setMarkupPercent(data.markup_percent ? String(data.markup_percent) : "0");
      setExcludeCcFee(!data.apply_cc_fee);

      const supportedCurrencies = ["USD", "EUR", "MXN", "GBP", "JPY"];
      if (supportedCurrencies.includes(data.currency)) {
        setCurrency(data.currency as CurrencyCode);
        setOtherCurrency("");
      } else {
        setCurrency("OTHER");
        setOtherCurrency(data.currency || "");
      }

      if (data.service_type === "hotel") {
        setCheckIn(details.check_in || data.start_date || "");
        setCheckOut(details.check_out || data.end_date || "");
        setNights(details.nights ? String(details.nights) : "");
        setRoomType(details.room_type || "");
        setRooms(details.rooms ? String(details.rooms) : "1");
        setMealPlan(details.meal_plan || "");
      }

      if (data.service_type === "flight") {
        setAirline(details.airline || "");
        setRoute(details.route || "");
        setFlightNumber(details.flight_number || "");
        setDepartureAirport(details.departure_airport_code || "");
        setArrivalAirport(details.arrival_airport_code || "");
        setDepartureDateTime(details.departure_datetime || "");
        setArrivalDateTime(details.arrival_datetime || "");
        setCabinClass(details.cabin_class || "");
      }

      setLoading(false);
    }

    if (serviceId) {
      fetchService();
    }
  }, [serviceId]);

  useEffect(() => {
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diffMs = end.getTime() - start.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      setNights(diffDays > 0 ? String(diffDays) : "0");
    }
  }, [checkIn, checkOut]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const resolvedCurrency =
      currency === "OTHER" ? otherCurrency.trim().toUpperCase() : currency;

    if (!resolvedCurrency) {
      setError("Selecciona una moneda válida.");
      setSaving(false);
      return;
    }

    let details: Record<string, unknown> = {};

    if (serviceType === "hotel") {
      details = {
        check_in: checkIn || null,
        check_out: checkOut || null,
        nights: nights ? Number(nights) : null,
        room_type: roomType || null,
        rooms: rooms ? Number(rooms) : 1,
        meal_plan: mealPlan || null,
      };
    }

    if (serviceType === "flight") {
      details = {
        airline: airline || null,
        route: route || null,
        flight_number: flightNumber || null,
        departure_airport_code: departureAirport || null,
        arrival_airport_code: arrivalAirport || null,
        departure_datetime: departureDateTime || null,
        arrival_datetime: arrivalDateTime || null,
        cabin_class: cabinClass || null,
      };
    }

    const { error } = await supabase
      .from("quote_items")
      .update({
        service_name: serviceName,
        city: city || null,
        supplier: supplier || null,
        confirmation_code: confirmationCode || null,
        notes: notes || null,
        currency: resolvedCurrency,
        unit_cost: unitCost ? Number(unitCost) : 0,
        tax_amount: taxAmount ? Number(taxAmount) : 0,
        markup_enabled: markupEnabled,
        markup_percent: markupEnabled ? Number(markupPercent || 0) : 0,
        apply_cc_fee: !excludeCcFee,
        details,
      })
      .eq("id", serviceId);

    if (error) {
      setError("No se pudo guardar el servicio.");
      setSaving(false);
      return;
    }

    router.push(`/quotes/${id}`);
    router.refresh();
  }

  if (loading) {
    return <div style={{ padding: "30px" }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "30px" }}>
      <button
        onClick={() => router.push(`/quotes/${id}`)}
        style={{
          marginBottom: "20px",
          background: "none",
          border: "none",
          color: "#2f4756",
          cursor: "pointer",
          fontSize: "14px",
        }}
      >
        ← Back to Quote
      </button>

      <h1 style={{ marginBottom: "20px", color: "#2f4756" }}>Edit Service</h1>

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
          <label style={labelStyle}>Service Type</label>
          <input value={serviceType} disabled style={inputStyleDisabled} />
        </div>

        <div>
          <label style={labelStyle}>Service Name</label>
          <input
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>City</label>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={inputStyle}
          />
        </div>

        {serviceType === "hotel" && (
          <>
            <div style={grid2}>
              <div>
                <label style={labelStyle}>Check-in</label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Check-out</label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={grid3}>
              <div>
                <label style={labelStyle}>Nights</label>
                <input value={nights} disabled style={inputStyleDisabled} />
              </div>

              <div>
                <label style={labelStyle}>Room Type</label>
                <input
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Rooms</label>
                <input
                  type="number"
                  value={rooms}
                  onChange={(e) => setRooms(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Meal Plan</label>
              <input
                value={mealPlan}
                onChange={(e) => setMealPlan(e.target.value)}
                style={inputStyle}
              />
            </div>
          </>
        )}

        {serviceType === "flight" && (
          <>
            <div style={grid2}>
              <div>
                <label style={labelStyle}>Airline</label>
                <input
                  value={airline}
                  onChange={(e) => setAirline(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Flight Number</label>
                <input
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Route</label>
              <input
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={grid2}>
              <div>
                <label style={labelStyle}>Departure Airport</label>
                <input
                  value={departureAirport}
                  onChange={(e) => setDepartureAirport(e.target.value.toUpperCase())}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Arrival Airport</label>
                <input
                  value={arrivalAirport}
                  onChange={(e) => setArrivalAirport(e.target.value.toUpperCase())}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={grid2}>
              <div>
                <label style={labelStyle}>Departure Date & Time</label>
                <input
                  type="datetime-local"
                  value={departureDateTime}
                  onChange={(e) => setDepartureDateTime(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Arrival Date & Time</label>
                <input
                  type="datetime-local"
                  value={arrivalDateTime}
                  onChange={(e) => setArrivalDateTime(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Class</label>
              <input
                value={cabinClass}
                onChange={(e) => setCabinClass(e.target.value)}
                style={inputStyle}
              />
            </div>
          </>
        )}

        <div style={grid2}>
          <div>
            <label style={labelStyle}>Supplier</label>
            <input
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Confirmation Code</label>
            <input
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={grid2}>
          <div>
            <label style={labelStyle}>Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              style={inputStyle}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="MXN">MXN</option>
              <option value="GBP">GBP</option>
              <option value="JPY">JPY</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>

          {currency === "OTHER" && (
            <div>
              <label style={labelStyle}>Other Currency</label>
              <input
                value={otherCurrency}
                onChange={(e) => setOtherCurrency(e.target.value.toUpperCase())}
                style={inputStyle}
              />
            </div>
          )}
        </div>

        <div style={grid2}>
          <div>
            <label style={labelStyle}>Price / Cost</label>
            <input
              type="number"
              step="0.01"
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Taxes</label>
            <input
              type="number"
              step="0.01"
              value={taxAmount}
              onChange={(e) => setTaxAmount(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <label style={checkLabelStyle}>
          <input
            type="checkbox"
            checked={markupEnabled}
            onChange={(e) => setMarkupEnabled(e.target.checked)}
          />
          Add markup to this service
        </label>

        <div>
          <label style={labelStyle}>Markup %</label>
          <input
            type="number"
            step="0.01"
            value={markupPercent}
            onChange={(e) => setMarkupPercent(e.target.value)}
            disabled={!markupEnabled}
            style={markupEnabled ? inputStyle : inputStyleDisabled}
          />
        </div>

        <label style={checkLabelStyle}>
          <input
            type="checkbox"
            checked={excludeCcFee}
            onChange={(e) => setExcludeCcFee(e.target.checked)}
          />
          Este servicio NO incluye el 5% de tarjeta
        </label>

        <div>
          <label style={labelStyle}>Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            style={textareaStyle}
          />
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
          <button type="submit" disabled={saving} style={primaryButton}>
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={() => router.push(`/quotes/${id}`)}
            style={secondaryButton}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "6px",
  color: "#2f4756",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  border: "1px solid #ccc",
  borderRadius: "8px",
};

const inputStyleDisabled: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  background: "#f5f5f5",
  color: "#777",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  border: "1px solid #ccc",
  borderRadius: "8px",
};

const grid2: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "16px",
};

const grid3: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: "16px",
};

const checkLabelStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  color: "#2f4756",
};

const primaryButton: React.CSSProperties = {
  padding: "12px 18px",
  borderRadius: "8px",
  border: "none",
  background: "black",
  color: "white",
  cursor: "pointer",
};

const secondaryButton: React.CSSProperties = {
  padding: "12px 18px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  background: "white",
  cursor: "pointer",
};
