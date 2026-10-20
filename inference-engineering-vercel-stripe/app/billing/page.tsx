// app/billing/page.tsx
"use client";

import { useState } from "react";

const packages = [
  { id: "starter", name: "Starter", price: "$5", credits: "500 credits", detail: "For testing and small experiments" },
  { id: "builder", name: "Builder", price: "$20", credits: "2,200 credits", detail: "Includes 10% bonus credits", popular: true },
  { id: "scale", name: "Scale", price: "$50", credits: "6,000 credits", detail: "Includes 20% bonus credits" },
];

export default function BillingPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  async function checkout(packageId: string) {
    setBusy(packageId);
    setError("");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId, email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not start checkout.");
      window.location.assign(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
      setBusy("");
    }
  }

  return (
    <main className="billing-page">
      <nav className="nav wrap">
        <a className="brand" href="/"><span className="brand-mark">IE</span> inference<span className="muted">.engineering</span></a>
        <a className="nav-cta" href="/">← Back to home</a>
      </nav>
      <section className="billing-content wrap">
        <div className="eyebrow">USAGE BILLING</div>
        <h1>Power your next<br /><em>inference run.</em></h1>
        <p className="billing-intro">Choose a prepaid credit package for your model experiments. Payments are handled securely by Stripe Checkout.</p>
        <label htmlFor="billing-email">EMAIL FOR YOUR RECEIPT (OPTIONAL)</label>
        <input id="billing-email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <div className="billing-grid">
          {packages.map((item) => (
            <article className={`billing-card ${item.popular ? "popular" : ""}`} key={item.id}>
              {item.popular && <span className="popular-label">MOST POPULAR</span>}
              <h2>{item.name}</h2><div className="billing-price">{item.price}<small> USD</small></div>
              <strong className="billing-credits">{item.credits}</strong><p>{item.detail}</p>
              <button className="button primary" disabled={!!busy} onClick={() => checkout(item.id)}>{busy === item.id ? "Redirecting..." : "Buy credits →"}</button>
            </article>
          ))}
        </div>
        {error && <div className="error-box">{error}</div>}
        <p className="billing-disclaimer">Demo pricing for setup purposes. The current starter verifies Stripe webhook events but does not yet store balances or meter inference usage. Add an authenticated account system and durable credit ledger before selling credits for production use.</p>
      </section>
    </main>
  );
}
