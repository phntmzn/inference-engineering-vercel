# Inference Engineering — Vercel Starter

A polished Next.js frontend and serverless API route for an inference-engineering landing page. Includes an interactive prompt playground, concepts section, architecture diagram, and a mock inference endpoint.

## Requirements

- Node.js 20.9+
- npm
- A Vercel account for deployment

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## API

`POST /api/inference`

Example request:

```json
{
  "model": "demo-model",
  "prompt": "Explain KV caching."
}
```

The route validates input and returns a mock completion plus basic token and latency metadata. **It does not run a real language model.** Replace the marked demo block in `app/api/inference/route.ts` with a request to your model provider or your own hosted inference server.

Keep API keys server-side in environment variables. Never expose provider secrets in browser code or commit them to Git.

## Deploy to Vercel

1. Create a GitHub repository and push this project.
2. Sign in to Vercel and choose **Add New → Project**.
3. Import the repository.
4. Keep the detected framework as **Next.js** and the default build settings.
5. If you connect a model provider, add its server-side secrets in **Project Settings → Environment Variables**.
6. Select **Deploy**.

You can also deploy from the project directory using the Vercel CLI:

```bash
npm install
npm install --global vercel
vercel
```

Follow the prompts, then use `vercel --prod` for a production deployment.

## Project structure

```text
inference-engineering-vercel/
├── app/
│   ├── api/inference/route.ts  # Serverless inference API
│   ├── globals.css             # Responsive styles
│   ├── layout.tsx              # App layout and metadata
│   └── page.tsx                # Landing page and playground
├── .env.example
├── .gitignore
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Production notes

- Add authentication and rate limiting before exposing a paid inference endpoint.
- Validate request size and allowed model names on the server.
- Add streaming responses if you want token-by-token output.
- Track real provider usage and latency; don't bill customers using the demo metadata.
- Configure CORS only if external origins need to call the API.


## Stripe prepaid checkout

This starter includes Stripe Checkout for three one-time packages:

- Starter: $5 for 500 credits
- Builder: $20 for 2,200 credits
- Scale: $50 for 6,000 credits

These are demo prices and credit quantities; edit `app/api/checkout/route.ts` and `app/billing/page.tsx` together if you change them.

### Configure Stripe test mode

1. Create or sign in to your Stripe account.
2. Copy your **test-mode secret key** from the Stripe Dashboard.
3. Copy `.env.example` to `.env.local` and set `STRIPE_SECRET_KEY`.
4. Set `NEXT_PUBLIC_APP_URL=http://localhost:3000` locally.
5. Install the updated dependencies with `npm install`.
6. Start the app with `npm run dev`.
7. Visit `/billing` and choose a package.

For local webhook testing, install and sign in to the Stripe CLI, then run:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the `whsec_...` secret printed by the CLI into `STRIPE_WEBHOOK_SECRET`. Use Stripe's test card `4242 4242 4242 4242`, any future expiry date, and any CVC.

### Deploy the payment flow

In Vercel → Project → Settings → Environment Variables, set:

- `STRIPE_SECRET_KEY` — your Stripe secret key (start with test mode)
- `STRIPE_WEBHOOK_SECRET` — signing secret from the webhook endpoint
- `NEXT_PUBLIC_APP_URL` — your deployed origin, e.g. `https://inference-engineering.vercel.app`

Redeploy after changing environment variables. In Stripe Dashboard → Developers → Webhooks, create an endpoint pointing to:

`https://YOUR-DOMAIN/api/webhooks/stripe`

Subscribe to `checkout.session.completed`. Use the signing secret for that deployed endpoint, not the local Stripe CLI secret.

### Important limitation before taking live payments

Checkout session creation and webhook signature verification are implemented. The webhook currently logs verified paid sessions but **does not persist or grant usable credits**. Before you accept live customer payments for inference credits, add authentication, a durable database-backed credit ledger, idempotent fulfillment, refunds/disputes handling, and server-side usage metering. Never grant credits based solely on the browser's success page.
