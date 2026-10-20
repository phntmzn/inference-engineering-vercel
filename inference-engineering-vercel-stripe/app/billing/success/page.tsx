// app/billing/success/page.tsx
import Link from "next/link";

export default function BillingSuccessPage() {
  return (
    <main className="billing-page">
      <nav className="nav wrap"><a className="brand" href="/"><span className="brand-mark">IE</span> inference<span className="muted">.engineering</span></a></nav>
      <section className="success-card wrap">
        <div className="eyebrow">CHECKOUT RETURN</div>
        <h1>Thanks for<br /><em>your purchase.</em></h1>
        <p>Stripe redirected you back to the site. Payment confirmation should be handled by the signed webhook, not this page.</p>
        <p className="billing-disclaimer">This starter does not yet add purchased credits to a persistent account balance.</p>
        <Link className="button primary" href="/">Return to inference engineering →</Link>
      </section>
    </main>
  );
}
