# Negoshi

Business, economy and politics of Aruba, Curaçao and Bonaire. English and Dutch.

## Stack
- Next.js (App Router), no database: content lives in `data/*.json`.
- `scripts/pipeline.mjs` fetches local sources, filters with Claude, writes original EN + NL briefs, commits to `data/items.json`.
- GitHub Action runs the pipeline hourly; every commit triggers a Vercel deploy.

## Routes
- `/en`, `/nl` home · `/{lang}/{aruba|curacao|bonaire}` island feeds · `/{lang}/brief/{slug}` · `/{lang}/analysis` (guest contributors) · `/{lang}/reports` · `/{lang}/about`

## Run locally
```
npm install
npm run dev
```

## Pipeline
```
ANTHROPIC_API_KEY=sk-ant-... node scripts/pipeline.mjs        # live
node scripts/pipeline.mjs --dry                                 # fetch feeds only, write nothing
```
Add `ANTHROPIC_API_KEY` as a repository secret for the scheduled Action.
Sources: `data/sources.json` (add a `feed` URL to activate a source; sources without a feed are listed only).

## Content
- `data/items.json` briefs (the first six are sample seeds, removed automatically once six live briefs exist)
- `data/analysis.json` guest analysis (contributor backoffice: next phase)
- `data/reports.json` reports library

## Newsletter
`POST /api/subscribe` forwards to `NEWSLETTER_WEBHOOK` (set in Vercel env) once an email provider is connected.
