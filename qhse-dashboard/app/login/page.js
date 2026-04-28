"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");

  return (
    <main>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
    </main>
  );
}