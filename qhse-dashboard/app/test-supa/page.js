"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function TestSupabasePage() {
  useEffect(() => {
    console.log("Testing Supabase...");

    const testConnection = async () => {
      const { data, error } = await supabase
        .from("ms_kapal")
        .select("*")
        .limit(1);

      console.log("DATA:", data);
      console.log("ERROR:", error);
    };

    testConnection();
  }, []);

  return <div>Test Supabase</div>;
}