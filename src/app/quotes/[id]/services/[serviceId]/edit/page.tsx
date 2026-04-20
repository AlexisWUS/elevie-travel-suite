"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type ServiceType = "hotel" | "flight" | "transfer" | "tour" | "extra";
type CurrencyCode = "USD" | "EUR" | "MXN" | "GBP" | "JPY" | "OTHER";

export default function EditQuoteServicePage() {
  const { id, serviceId } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [serviceType, setServiceType] = useState<ServiceType>("hotel");

  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [otherCurrency, setOtherCurrency] = useState("");

  const [supplier, setSupplier] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [notes, setNotes] = useState("");

  const [hotelPriceMode, setHotelPriceMode] = useState<"per_night" | "total">("total");
  const [hotelPrice, setHotelPrice] = useState("");
  const [taxAmount, setTaxAmount] = useState
