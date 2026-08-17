# CourtReady

CourtReady helps people organise rights, facts, dates, questions, and supporting documents for UK civil and family court procedures, especially matters involving children.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/courtpath-uk/` — the deployable React app and its guided drafting flows.
- `attached_assets/` — the user-supplied court forms, rights guide, and fictional worked examples used as reference material.
- `artifacts/api-server/` — shared API scaffold; CourtReady intentionally does not send case data to a server.
- `artifacts/courtpath-uk/src/App.tsx` — template library, local draft state, rights index, document preview, print, and download behavior.
- `artifacts/courtpath-uk/src/data/rights-index.ts` — source-linked ECHR and UNCRC article index.
- `artifacts/courtpath-uk/public/manifest.json` — PWA manifest for a future mobile wrapper.

## Architecture decisions

- The first release is browser-only: drafts are saved in IndexedDB where available, with a local fallback, and exports happen locally.
- DOCX files are generated in the browser; there is no document upload or central case-data store.
- The app creates editable working drafts, not official court forms or legal advice.
- Reference content is jurisdiction-aware and labels fictional worked examples as examples.
- The initial scope covers Scotland, England & Wales orientation, and an ECHR readiness checklist; Northern Ireland is not yet included.

## Product

Users can choose a procedure, answer guided plain-English prompts, review a live draft, track missing details and attachments, and print or download DOCX, HTML, or text drafts. The rights guide includes both short summaries and source-linked ECHR/UNCRC indexes.

## User preferences

- Keep legal-safety language prominent and avoid claiming a generated draft is guaranteed to be correct or accepted.

## Gotchas

- Court forms and rules change; users must check the current official version before lodging anything.
- Do not treat the fictional names, dates, addresses, or authorities in the worked examples as user data.
- The PWA manifest uses the supplied wide CourtReady SVG as its icon; a future mobile packaging pass may need a square raster/icon variant for stricter install surfaces.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
