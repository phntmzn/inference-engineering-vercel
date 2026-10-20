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
