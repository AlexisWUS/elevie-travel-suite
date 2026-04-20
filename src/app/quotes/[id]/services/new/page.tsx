"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type ServiceType = "hotel" | "flight" | "transfer" | "tour" | "extra";
type CurrencyCode = "USD" | "EUR" | "MXN" | "GBP" | "JPY" | "OTHER";
type HotelRateType = "per_night" | "total";

function calculateNights(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return "";
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffMs = end.getTime() - start.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "";
  return String(diffDays);
}

export default function NewQuoteServicePage() {
  const { id } = useParams();
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [serviceType, setServiceType] = useState<ServiceType>("hotel");

  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [otherCurrency, setOtherCurrency] = useState("");

  const [supplier, setSupplier] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [notes, setNotes] = useState("");

  const [taxAmount, setTaxAmount] = useState("0");
  const [markupEnabled, setMarkupEnabled] = useState(false);
  const [markupPercent, setMarkupPercent] = useState("0");
  const [excludeCcFee, setExcludeCcFee] = useState(false);

  const [hotelName, setHotelName] = useState("");
  const [hotelCity, setHotelCity] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [roomType, setRoomType] = useState("");
  const [rooms, setRooms] = useState("1");
  const [mealPlan, setMealPlan] = useState("");
  const [hotelRateType, setHotelRateType] = useState<HotelRateType>("per_night");
  const [hotelPrice, setHotelPrice] = useState("");

  const [airline, setAirline] = useState("");
  const [route, setRoute] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [departureAirport, setDepartureAirport] = useState("");
  const [arrivalAirport, setArrivalAirport] = useState("");
  const [departureDateTime, setDepartureDateTime] = useState("");
  const [arrivalDateTime, setArrivalDateTime] = useState("");
  const [cabinClass, setCabinClass] = useState("");
  const [flightBaseCost, setFlightBaseCost] = useState("");

  const [genericName, setGenericName] = useState("");
  const [genericCity, setGenericCity] = useState("");
  const [genericDate, setGenericDate] = useState("");
  const [genericCost, setGenericCost] = useState("");

  const nights = useMemo(() => calculateNights(checkIn, checkOut), [checkIn, checkOut]);

  const resolvedCurrency = useMemo(() => {
    if (currency === "OTHER") {
      return otherCurrency.trim().toUpperCase();
    }
    return currency;
  }, [currency, otherCurrency]);

  function getServiceName() {
    if (serviceType === "hotel") return hotelName.trim();

    if (serviceType === "flight") {
      if (route.trim()) return route.trim();
      return [departureAirport.trim(), arrivalAirport.trim()].filter(Boolean).join(" to ");
    }

    return genericName.trim();
  }

  function getCity() {
    if (serviceType === "hotel") return hotelCity.trim() || null;
    if (serviceType === "flight") return null;
    return genericCity.trim() || null;
  }

  function getServiceDate() {
    if (serviceType === "flight") {
      return departureDateTime ? departureDateTime.slice(0, 10) : null;
    }

    if (serviceType === "transfer" || serviceType === "tour" || serviceType === "extra") {
      return genericDate || null;
    }

    return null;
  }

  function getStartDate() {
    if (serviceType === "hotel") return checkIn || null;
    return null;
  }

  function getEndDate() {
    if (serviceType === "hotel") return checkOut || null;
    return null;
  }

  function buildDetails() {
    if (serviceType === "hotel") {
      return {
        hotel_name: hotelName.trim(),
        city: hotelCity.trim() || null,
        check_in: checkIn || null,
        check_out: checkOut || null,
        nights: nights ? Number(nights) : null,
        room_type: roomType.trim() || null,
        rooms: rooms ? Number(rooms) : 1,
        meal_plan: mealPlan.trim() || null,
        rate_type: hotelRateType,
        hotel_price: hotelPrice ? Number(hotelPrice) : 0,
      };
    }

    if (serviceType === "flight") {
      return {
        airline: airline.trim() || null,
        route: route.trim() || null,
        flight_number: flightNumber.trim() || null,
        departure_airport_code: departureAirport.trim().toUpperCase() || null,
        arrival_airport_code: arrivalAirport.trim().toUpperCase() || null,
        departure_datetime: departureDateTime || null,
        arrival_datetime: arrivalDateTime || null,
        cabin_class: cabinClass.trim() || null,
        base_cost: flightBaseCost ? Number(flightBaseCost) : 0,
      };
    }

    return {
      name: genericName.trim(),
      city: genericCity.trim() || null,
      service_date: genericDate || null,
      cost: genericCost ? Number(genericCost) : 0,
    };
  }

  function getStoredUnitCost() {
    if (serviceType === "hotel") {
      return hotelPrice ? Number(hotelPrice) : 0;
    }

    if (serviceType === "flight") {
      return flightBaseCost ? Number(flightBaseCost) : 0;
    }

    return genericCost ? Number(genericCost) : 0;
  }

  function validateForm() {
    if (currency === "OTHER" && !otherCurrency.trim()) {
      return "Escribe la moneda en OTHER.";
    }

    if (!resolvedCurrency) {
      return "Selecciona una moneda válida.";
    }

    if (serviceType === "hotel") {
      if (!hotelName.trim()) return "Escribe el nombre del hotel.";
      if (!checkIn) return "Selecciona el check-in.";
      if (!checkOut) return "Selecciona el check-out.";
      if (!nights) return "El check-out debe ser después del check-in.";
      if (!hotelPrice) return "Escribe el precio del hotel.";
    }

    if (serviceType === "flight") {
      if (!route.trim() && (!departureAirport.trim() || !arrivalAirport.trim())) {
        return "Escribe la ruta o los códigos de aeropuerto.";
      }
      if (!flightBaseCost) return "Escribe el costo del vuelo.";
    }

    if (serviceType === "transfer" || serviceType === "tour" || serviceType === "extra") {
      if (!genericName.trim()) return "Escribe el nombre del servicio.";
      if (!genericCost) return "Escribe el costo o precio del servicio.";
    }

    return "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setSaving(false);
      return;
    }

    const payload = {
      quote_id: id,
      service_type: serviceType,
      service_name: getServiceName(),
      city: getCity(),
      start_date: getStartDate(),
      end_date: getEndDate(),
      service_date: getServiceDate(),
      supplier: supplier.trim() || null,
      confirmation_code: confirmationCode.trim() || null,
      notes: notes.trim() || null,
      currency: resolvedCurrency,
      unit_cost: getStoredUnitCost(),
      quantity: serviceType === "hotel" ? 1 : 1,
      tax_amount: taxAmount ? Number(taxAmount) : 0,
      markup_enabled: serviceType === "hotel" ? false : markupEnabled,
      markup_percent: serviceType === "hotel" ? 0 : markupEnabled && markupPercent ? Number(markupPercent) : 0,
      apply_cc_fee: !excludeCcFee,
      details: buildDetails(),
    };

    const { error } = await supabase.from("quote_items").insert(payload);

    if (error) {
      setError(`No se pudo guardar el servicio. ${error.message}`);
      setSaving(false);
      return;
    }

    router.push(`/quotes/${id}`);
    router.refresh();
  }

  return (
    <div style={pageWrap}>
      <div style={pageHeader}>
        <h1 style={titleStyle}>Add Service</h1>
      </div>

      {error && <div style={errorBox}>{error}</div>}

      <form onSubmit={handleSubmit} style={formStyle}>
        <div>
          <label style={labelStyle}>Service Type</label>
          <select
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value as ServiceType)}
            style={inputStyle}
          >
            <option value="hotel">hotel</option>
            <option value="flight">flight</option>
            <option value="transfer">transfer</option>
            <option value="tour">tour</option>
            <option value="extra">extra</option>
          </select>
        </div>

        {serviceType === "hotel" && (
          <div style={sectionCard}>
            <h2 style={sectionTitle}>Hotel</h2>

            <div>
              <label style={labelStyle}>Hotel Name</label>
              <input value={hotelName} onChange={(e) => setHotelName(e.target.value)} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>City</label>
              <input value={hotelCity} onChange={(e) => setHotelCity(e.target.value)} style={inputStyle} />
            </div>

            <div style={grid2}>
              <div>
                <label style={labelStyle}>Check-in</label>
                <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Check-out</label>
                <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} style={inputStyle} />
              </div>
            </div>

            <div style={grid3}>
              <div>
                <label style={labelStyle}>Number of Nights</label>
                <input value={nights} readOnly style={readOnlyStyle} />
              </div>

              <div>
                <label style={labelStyle}>Room Type</label>
                <input value={roomType} onChange={(e) => setRoomType(e.target.value)} style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Rooms</label>
                <input type="number" value={rooms} onChange={(e) => setRooms(e.target.value)} style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Meal Plan</label>
              <input
                value={mealPlan}
                onChange={(e) => setMealPlan(e.target.value)}
                placeholder="Breakfast included, half board, etc."
                style={inputStyle}
              />
            </div>

            <div style={grid2}>
              <div>
                <label style={labelStyle}>Price Type</label>
                <select
                  value={hotelRateType}
                  onChange={(e) => setHotelRateType(e.target.value as HotelRateType)}
                  style={inputStyle}
                >
                  <option value="per_night">Price per night</option>
                  <option value="total">Total price</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>
                  {hotelRateType === "per_night" ? "Price per Night" : "Total Price"}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={hotelPrice}
                  onChange={(e) => setHotelPrice(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        )}

        {serviceType === "flight" && (
          <div style={sectionCard}>
            <h2 style={sectionTitle}>Flight</h2>

            <div style={grid2}>
              <div>
                <label style={labelStyle}>Airline</label>
                <input value={airline} onChange={(e) => setAirline(e.target.value)} style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Flight Number</label>
                <input value={flightNumber} onChange={(e) => setFlightNumber(e.target.value)} style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Route</label>
              <input
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                placeholder="MEX to JFK"
                style={inputStyle}
              />
            </div>

            <div style={grid2}>
              <div>
                <label style={labelStyle}>Departure Airport Code</label>
                <input
                  value={departureAirport}
                  onChange={(e) => setDepartureAirport(e.target.value.toUpperCase())}
                  maxLength={3}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Arrival Airport Code</label>
                <input
                  value={arrivalAirport}
                  onChange={(e) => setArrivalAirport(e.target.value.toUpperCase())}
                  maxLength={3}
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

            <div style={grid2}>
              <div>
                <label style={labelStyle}>Class</label>
                <input
                  value={cabinClass}
                  onChange={(e) => setCabinClass(e.target.value)}
                  placeholder="Economy, Business, First"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Base Cost</label>
                <input
                  type="number"
                  step="0.01"
                  value={flightBaseCost}
                  onChange={(e) => setFlightBaseCost(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        )}

        {(serviceType === "transfer" || serviceType === "tour" || serviceType === "extra") && (
          <div style={sectionCard}>
            <h2 style={sectionTitle}>Service Details</h2>

            <div>
              <label style={labelStyle}>Service Name</label>
              <input value={genericName} onChange={(e) => setGenericName(e.target.value)} style={inputStyle} />
            </div>

            <div style={grid2}>
              <div>
                <label style={labelStyle}>City</label>
                <input value={genericCity} onChange={(e) => setGenericCity(e.target.value)} style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Service Date</label>
                <input type="date" value={genericDate} onChange={(e) => setGenericDate(e.target.value)} style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Cost / Price</label>
              <input
                type="number"
                step="0.01"
                value={genericCost}
                onChange={(e) => setGenericCost(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>
        )}

        <div style={sectionCard}>
          <h2 style={sectionTitle}>Commercial Details</h2>

          <div style={grid2}>
            <div>
              <label style={labelStyle}>Supplier</label>
              <input value={supplier} onChange={(e) => setSupplier(e.target.value)} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Confirmation Code</label>
              <input value={confirmationCode} onChange={(e) => setConfirmationCode(e.target.value)} style={inputStyle} />
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
                  placeholder="AED, CHF, CAD..."
                  style={inputStyle}
                />
              </div>
            )}
          </div>

          <div style={grid2}>
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

            {serviceType !== "hotel" && (
              <div>
                <label style={labelStyle}>Markup %</label>
                <input
                  type="number"
                  step="0.01"
                  value={markupPercent}
                  onChange={(e) => setMarkupPercent(e.target.value)}
                  disabled={!markupEnabled}
                  style={{
                    ...inputStyle,
                    background: markupEnabled ? "#fff" : "#f4f1ea",
                  }}
                />
              </div>
            )}
          </div>

          {serviceType !== "hotel" && (
            <label style={checkboxRow}>
              <input
                type="checkbox"
                checked={markupEnabled}
                onChange={(e) => setMarkupEnabled(e.target.checked)}
              />
              Add markup to this service
            </label>
          )}

          <label style={checkboxRow}>
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
        </div>

        <div style={buttonRow}>
          <button type="submit" disabled={saving} style={primaryButton}>
            {saving ? "Saving..." : "Save Service"}
          </button>

          <button type="button" onClick={() => router.push(`/quotes/${id}`)} style={secondaryButton}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

const pageWrap: React.CSSProperties = {
  maxWidth: "900px",
  margin: "0 auto",
  padding: "32px 24px 48px",
};

const pageHeader: React.CSSProperties = {
  marginBottom: "24px",
};

const titleStyle: React.CSSProperties = {
  fontSize: "38px",
  color: "#173042",
  margin: 0,
};

const formStyle: React.CSSProperties = {
  display: "grid",
  gap: "18px",
};

const sectionCard: React.CSSProperties = {
  background: "#f8f4ec",
  border: "1px solid #d9d0c3",
  borderRadius: "14px",
  padding: "20px",
  display: "grid",
  gap: "16px",
};

const sectionTitle: React.CSSProperties = {
  fontSize: "22px",
  color: "#173042",
  margin: 0,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "6px",
  color: "#173042",
  fontWeight: 600,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  border: "1px solid #cfc5b7",
  borderRadius: "10px",
  background: "#fff",
};

const readOnlyStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  border: "1px solid #d7cec2",
  borderRadius: "10px",
  background: "#f1ece3",
  color: "#173042",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  border: "1px solid #cfc5b7",
  borderRadius: "10px",
  background: "#fff",
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

const checkboxRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  color: "#173042",
};

const buttonRow: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  marginTop: "8px",
  flexWrap: "wrap",
};

const primaryButton: React.CSSProperties = {
  padding: "12px 18px",
  borderRadius: "10px",
  border: "none",
  background: "#173042",
  color: "white",
  cursor: "pointer",
};

const secondaryButton: React.CSSProperties = {
  padding: "12px 18px",
  borderRadius: "10px",
  border: "1px solid #cfc5b7",
  background: "#fff",
  color: "#173042",
  cursor: "pointer",
};

const errorBox: React.CSSProperties = {
  marginBottom: "16px",
  padding: "12px",
  borderRadius: "10px",
  background: "#fdeaea",
  color: "#8a1f1f",
  border: "1px solid #efc2c2",
};
