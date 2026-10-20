// app/page.tsx
"use client";

import { FormEvent, useState } from "react";

type InferenceResult = {
  output: string;
  model: string;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  note?: string;
};

const concepts = [
  { number: "01", title: "Prefill", text: "Process the input prompt and build the KV cache before generation begins." },
  { number: "02", title: "Decode", text: "Generate output token by token, reusing cached attention states." },
  { number: "03", title: "Serving", text: "Balance latency, throughput, memory, batching, and accelerator utilization." },
];

export default function Home() {
  const [prompt, setPrompt] = useState("Explain why KV caching improves autoregressive inference.");
  const [model, setModel] = useState("demo-model");
  const [result, setResult] = useState<InferenceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runInference(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/inference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, model }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Inference request failed.");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <nav className="nav wrap">
        <a className="brand" href="#"><span className="brand-mark">IE</span> inference<span className="muted">.engineering</span></a>
        <div className="nav-links"><a href="#concepts">Concepts</a><a href="#playground">Playground</a><a href="#architecture">Architecture</a><a href="/billing">Pricing</a></div>
        <a className="nav-cta" href="/billing">Buy credits <span>↗</span></a>
      </nav>

      <section className="hero wrap">
        <div className="hero-copy">
          <div className="eyebrow"><span className="pulse" /> SYSTEMS FOR GENERATIVE AI</div>
          <h1>Make every<br /><em>token count.</em></h1>
          <p className="hero-text">A practical guide and playground for the systems behind fast, efficient, production-grade LLM inference.</p>
          <div className="hero-actions"><a className="button primary" href="#playground">Open inference playground <span>→</span></a><a className="text-link" href="#concepts">Explore the fundamentals ↓</a></div>
          <div className="hero-stats"><div><strong>01</strong><span>Prompt in</span></div><div><strong>02</strong><span>Tokens out</span></div><div><strong>∞</strong><span>Ways to optimize</span></div></div>
        </div>
        <div className="terminal-card">
          <div className="terminal-top"><div className="dots"><i></i><i></i><i></i></div><span>inference_trace.log</span><span className="live">● LIVE DEMO</span></div>
          <div className="terminal-body">
            <div className="terminal-label">REQUEST PIPELINE</div>
            <div className="trace-row"><span className="trace-num">01</span><div><strong>Tokenize prompt</strong><small>Text → token IDs</small></div><b className="tag">INPUT</b></div>
            <div className="trace-line"></div>
            <div className="trace-row"><span className="trace-num">02</span><div><strong>Prefill context</strong><small>Attention + KV cache</small></div><b className="tag violet">PREFILL</b></div>
            <div className="trace-line"></div>
            <div className="trace-row"><span className="trace-num">03</span><div><strong>Autoregressive decode</strong><small>Next-token generation</small></div><b className="tag green">DECODE</b></div>
            <div className="trace-line"></div>
            <div className="trace-row"><span className="trace-num">04</span><div><strong>Return completion</strong><small>Tokens → text</small></div><b className="tag">OUTPUT</b></div>
            <div className="terminal-footer"><span>● API STATUS</span><strong>READY</strong><span className="footer-right">v1 / serverless</span></div>
          </div>
        </div>
      </section>

      <section className="ticker"><div className="ticker-inner"><span>LOW LATENCY</span><b>✳</b><span>HIGH THROUGHPUT</span><b>✳</b><span>KV CACHING</span><b>✳</b><span>CONTINUOUS BATCHING</span><b>✳</b><span>LOW LATENCY</span></div></section>

      <section className="section wrap" id="concepts">
        <div className="section-heading"><div><div className="eyebrow">THE CORE LOOP</div><h2>From prompt to prediction.</h2></div><p>Inference engineering is the work of making trained models useful in the real world—at the right speed, cost, and scale.</p></div>
        <div className="concept-grid">{concepts.map((item) => <article className="concept-card" key={item.number}><div className="card-number">{item.number}</div><h3>{item.title}</h3><p>{item.text}</p><div className="card-arrow">↗</div></article>)}</div>
      </section>

      <section className="playground-section" id="playground">
        <div className="wrap playground-layout">
          <div className="playground-copy"><div className="eyebrow">INTERACTIVE WORKSPACE</div><h2>Test the<br /><em>inference loop.</em></h2><p>Send a prompt to the demo API. This starter uses a mock backend so you can deploy the UI immediately, then connect a real model endpoint when you're ready.</p><div className="feature-list"><span>✓ Next.js API route</span><span>✓ Typed request / response</span><span>✓ Ready for Vercel deployment</span></div></div>
          <div className="playground-card">
            <div className="playground-card-top"><span><span className="status-dot"></span> INFERENCE PLAYGROUND</span><span className="mono">POST /api/inference</span></div>
            <form onSubmit={runInference}>
              <label htmlFor="model">MODEL ROUTE</label><select id="model" value={model} onChange={(e) => setModel(e.target.value)}><option value="demo-model">demo-model · mock</option><option value="custom-endpoint">custom-endpoint · placeholder</option></select>
              <label htmlFor="prompt">INPUT PROMPT</label><textarea id="prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} required maxLength={4000} />
              <div className="form-bottom"><span>{prompt.length} / 4000 chars</span><button className="button primary" disabled={loading || !prompt.trim()}>{loading ? "Running..." : "Run inference →"}</button></div>
            </form>
            {error && <div className="error-box">{error}</div>}
            {result && <div className="result-box"><div className="result-heading"><span>MODEL RESPONSE</span><span>{result.latencyMs} ms · {result.outputTokens} output tokens</span></div><p>{result.output}</p><div className="result-meta"><span>Model: {result.model}</span><span>Input tokens: {result.inputTokens}</span></div>{result.note && <small>{result.note}</small>}</div>}
            {!result && !error && <div className="empty-result"><span>↳</span> Your generated response will appear here.</div>}
          </div>
        </div>
      </section>

      <section className="section wrap architecture" id="architecture">
        <div className="eyebrow">DEPLOYMENT SHAPE</div><h2>Small surface area.<br /><em>Room to scale.</em></h2>
        <div className="architecture-flow"><div><small>CLIENT</small><strong>Next.js UI</strong><span>Prompt + results</span></div><b>→</b><div><small>VERCEL FUNCTION</small><strong>/api/inference</strong><span>Validate + route</span></div><b>→</b><div><small>MODEL PROVIDER</small><strong>Your endpoint</strong><span>GPU / hosted model</span></div></div>
        <p className="architecture-note">The included endpoint returns a clearly labeled mock response. It does not run a model or incur GPU costs until you connect a provider.</p>
      </section>

      <footer className="footer"><div className="wrap footer-inner"><a className="brand" href="#"><span className="brand-mark">IE</span> inference<span className="muted">.engineering</span></a><span>Built for people who care about what happens between tokens.</span><span>© 2026</span></div></footer>
    </main>
  );
}
