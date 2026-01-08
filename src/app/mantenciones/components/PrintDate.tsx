"use client";

import { useEffect, useState } from "react";

export default function PrintDate() {
  const [date, setDate] = useState("");

  useEffect(() => {
    setDate(new Date().toLocaleString("es-CL"));
  }, []);

  if (!date) return null;

  return <span className="print-date">{date}</span>;
}
