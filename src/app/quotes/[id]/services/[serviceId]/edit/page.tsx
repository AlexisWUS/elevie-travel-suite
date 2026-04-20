  useEffect(() => {
    async function fetchService() {
      setLoading(true);

      const { data, error } = await supabase
        .from("quote_items")
        .select("*")
        .eq("id", serviceId)
        .single();

      if (error || !data) {
        setError("Error loading service");
        setLoading(false);
        return;
      }

      setServiceType(data.service_type);

      setSupplier(data.supplier || "");
      setConfirmationCode(data.confirmation_code || "");
      setNotes(data.notes || "");

      setTaxAmount(data.tax_amount ? String(data.tax_amount) : "0");
      setMarkupEnabled(!!data.markup_enabled);
      setMarkupPercent(data.markup_percent ? String(data.markup_percent) : "0");
      setExcludeCcFee(!data.apply_cc_fee);

      const supported = ["USD", "EUR", "MXN", "GBP", "JPY"];
      if (supported.includes(data.currency)) {
        setCurrency(data.currency);
      } else {
        setCurrency("OTHER");
        setOtherCurrency(data.currency || "");
      }

      const d = data.details || {};

      if (data.service_type === "hotel") {
        setHotelName(d.hotel_name || data.service_name || "");
        setHotelCity(d.city || "");
        setCheckIn(d.check_in || "");
        setCheckOut(d.check_out || "");
        setNights(d.nights ? String(d.nights) : "");
        setRoomType(d.room_type || "");
        setRooms(d.rooms ? String(d.rooms) : "1");
        setMealPlan(d.meal_plan || "");
        setHotelPrice(data.unit_cost ? String(data.unit_cost) : "");
      }

      if (data.service_type === "flight") {
        setAirline(d.airline || "");
        setRoute(d.route || data.service_name || "");
        setFlightNumber(d.flight_number || "");
        setDepartureAirport(d.departure_airport_code || "");
        setArrivalAirport(d.arrival_airport_code || "");
        setDepartureDateTime(d.departure_datetime || "");
        setArrivalDateTime(d.arrival_datetime || "");
        setCabinClass(d.cabin_class || "");
        setFlightCost(data.unit_cost ? String(data.unit_cost) : "");
      }

      if (
        data.service_type === "transfer" ||
        data.service_type === "tour" ||
        data.service_type === "extra"
      ) {
        setGenericName(data.service_name || "");
        setGenericCity(d.city || "");
        setGenericDate(d.service_date || "");
        setGenericCost(data.unit_cost ? String(data.unit_cost) : "");
      }

      setLoading(false);
    }

    if (serviceId) fetchService();
  }, [serviceId]);

  useEffect(() => {
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diff = Math.round(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );
      setNights(diff > 0 ? String(diff) : "0");
    }
  }, [checkIn, checkOut]);

  const resolvedCurrency = useMemo(() => {
    if (currency === "OTHER") return otherCurrency.toUpperCase();
    return currency;
  }, [currency, otherCurrency]);

  async function handleSave(e: any) {
    e.preventDefault();
    setSaving(true);
    setError("");

    let service_name = "";
    let unit_cost = 0;
    let details: any = {};

    if (serviceType === "hotel") {
      service_name = hotelName;
      unit_cost = Number(hotelPrice || 0);
      details = {
        hotel_name: hotelName,
        city: hotelCity,
        check_in: checkIn,
        check_out: checkOut,
        nights: Number(nights || 0),
        room_type: roomType,
        rooms: Number(rooms || 1),
        meal_plan: mealPlan,
      };
    }

    if (serviceType === "flight") {
      service_name = route || `${departureAirport} to ${arrivalAirport}`;
      unit_cost = Number(flightCost || 0);
      details = {
        airline,
        route,
        flight_number: flightNumber,
        departure_airport_code: departureAirport,
        arrival_airport_code: arrivalAirport,
        departure_datetime: departureDateTime,
        arrival_datetime: arrivalDateTime,
        cabin_class: cabinClass,
      };
    }

    if (
      serviceType === "transfer" ||
      serviceType === "tour" ||
      serviceType === "extra"
    ) {
      service_name = genericName;
      unit_cost = Number(genericCost || 0);
      details = {
        name: genericName,
        city: genericCity,
        service_date: genericDate,
      };
    }

    const { error } = await supabase
      .from("quote_items")
      .update({
        service_name,
        supplier,
        confirmation_code: confirmationCode,
        notes,
        currency: resolvedCurrency,
        unit_cost,
        tax_amount: Number(taxAmount || 0),
        markup_enabled: markupEnabled,
        markup_percent: Number(markupPercent || 0),
        apply_cc_fee: !excludeCcFee,
        details,
      })
      .eq("id", serviceId);

    if (error) {
      setError("Error saving");
      setSaving(false);
      return;
    }

    router.push(`/quotes/${id}`);
    router.refresh();
  }

  if (loading) return <div style={{ padding: 30 }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 30 }}>
      <button onClick={() => router.push(`/quotes/${id}`)}>
        ← Back to Quote
      </button>

      <h1 style={{ marginTop: 20 }}>Edit Service</h1>

      <form onSubmit={handleSave} style={{ marginTop: 20, display: "grid", gap: 12 }}>
        {serviceType === "hotel" && (
          <>
            <input value={hotelName} onChange={(e) => setHotelName(e.target.value)} placeholder="Hotel Name" />
            <input value={hotelCity} onChange={(e) => setHotelCity(e.target.value)} placeholder="City" />
            <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
            <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
            <input value={nights} disabled />
            <input value={roomType} onChange={(e) => setRoomType(e.target.value)} placeholder="Room Type" />
            <input value={rooms} onChange={(e) => setRooms(e.target.value)} placeholder="Rooms" />
            <input value={hotelPrice} onChange={(e) => setHotelPrice(e.target.value)} placeholder="Hotel Price" />
          </>
        )}

        {serviceType === "flight" && (
          <>
            <input value={route} onChange={(e) => setRoute(e.target.value)} placeholder="Route" />
            <input value={flightCost} onChange={(e) => setFlightCost(e.target.value)} placeholder="Cost" />
          </>
        )}

        <select value={currency} onChange={(e) => setCurrency(e.target.value as any)}>
          <option>USD</option>
          <option>EUR</option>
          <option>MXN</option>
          <option>GBP</option>
          <option>JPY</option>
          <option>OTHER</option>
        </select>

        {currency === "OTHER" && (
          <input value={otherCurrency} onChange={(e) => setOtherCurrency(e.target.value)} />
        )}

        <input value={taxAmount} onChange={(e) => setTaxAmount(e.target.value)} placeholder="Taxes" />

        <label>
          <input
            type="checkbox"
            checked={excludeCcFee}
            onChange={(e) => setExcludeCcFee(e.target.checked)}
          />
          No 5% credit card fee
        </label>

        <button type="submit">{saving ? "Saving..." : "Save Changes"}</button>
      </form>
    </div>
  );
}
