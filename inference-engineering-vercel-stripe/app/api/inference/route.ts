// app/api/inference/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type InferenceRequest = {
  prompt?: unknown;
  model?: unknown;
};

export async function POST(request: NextRequest) {
  let body: InferenceRequest;

  try {
    body = (await request.json()) as InferenceRequest;
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (typeof body.prompt !== "string" || !body.prompt.trim()) {
    return NextResponse.json({ error: "A non-empty prompt is required." }, { status: 400 });
  }
  if (body.prompt.length > 4000) {
    return NextResponse.json({ error: "Prompt must be 4,000 characters or fewer." }, { status: 413 });
  }

  const model = typeof body.model === "string" ? body.model : "demo-model";
  const prompt = body.prompt.trim();
  const inputTokens = Math.max(1, Math.ceil(prompt.split(/\s+/).length * 1.3));

  // Demo backend: replace this block with a call to your model provider.
  // Keep provider API keys in Vercel Environment Variables, never in client code.
  const output =
    `This is a mock inference response for "${prompt.slice(0, 180)}${prompt.length > 180 ? "…" : ""}". ` +
    "In a real deployment, this API route would send the prompt to your model endpoint, " +
    "stream or receive generated tokens, and return the completion with usage and latency metadata.";

  return NextResponse.json({
    output,
    model,
    latencyMs: 42,
    inputTokens,
    outputTokens: Math.max(1, Math.ceil(output.split(/\s+/).length * 1.3)),
    note: "Mock response only — connect a model provider to enable real inference.",
  });
}
