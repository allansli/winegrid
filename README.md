# 🍷 WineGrid — The Master Sommelier 3×3 Matrix Game

A **GeoGrid-inspired 3×3 Wine Matrix Game** crafted for casual wine lovers, WSET students, and Master Sommeliers.

## ✨ Highlights

- **Unified Sommelier Knowledge Graph (123 Curated Entities)**:
  - **64 World Appellations & Denominations** (*Pauillac AOC, Barolo DOCG, Champagne AOC, Chablis AOC, Mosel VDP, Priorat DOCa, Jerez-Xérès-Sherry DO, Tokaj PDO, Santorini PDO, Napa Valley AVA, Coonawarra GI, Mendoza, Central Otago...*)
  - **33 Noble & Autochthonous Grape Varieties** (*Cabernet Sauvignon, Pinot Noir, Nebbiolo, Sangiovese, Riesling, Syrah, Chenin Blanc, Assyrtiko, Furmint, Grüner Veltliner, Savagnin, Touriga Nacional, Nerello Mascalese...*)
  - **26 Iconic Benchmark Producers / Estates** (*Domaine de la Romanée-Conti, Château Lafite Rothschild, Château Pétrus, Château d'Yquem, Krug, Jacques Selosse, E. Guigal, Château Rayas, Giacomo Conterno, Gaja, Sassicaia, Vega Sicilia, López de Heredia, Egon Müller, Penfolds, Catena Zapata, Chateau Musar...*)
- **79 Sommelier Matrix Predicates Across 13 Categories**:
  - *Terroir & Geology* (Kimmeridgian Marl, Volcanic Basalt, Devonian Slate/Llicorella Schist, Galets Roulés/Gravel, Granite, Albariza, Terra Rossa, Phylloxera-Free Sand)
  - *Climate & Topography* (Maritime, Continental, Mediterranean, High-Altitude ≥500m, Heroic Steep Slopes >30°, Cooling Fog/Currents, Rain Shadow & Diurnal Shift)
  - *Vinification & Cellar Laws* (Solera & Flor/Voile Yeast, Sur Lie Autolysis, Carbonic/Whole-Cluster & Co-Fermentation, Slavonian Botti/Foudres, New French Barriques, 36+ Month Mandatory Aging)
  - *WSET / CMS Deductive Sensory Grid* (High Tannin + High Acid, Laser-Sharp Low-pH Acidity, TDN Petrol/Kerosene, Rotundone Black Pepper, Violet/Rose Terpenes, Truffle/Tar)
  - *Classifications, Bottle Shapes, Viticultural Heritage (Ungrafted Pre-Phylloxera, Gobelet/Alberello/Kouloura Bush Vines, UNESCO/Monastic)*
- **Guaranteed Solvable 3×3 Matrices**:
  - Uses Mulberry32 deterministic PRNG for global **Daily Vintage Challenges** + an MRV backtracking solver to guarantee every generated board has at least one 9-distinct-entity solution across 6 non-overlapping clue categories.
  - **Answer floors, no caps.** Standard and Sommelier cells have at least 3 accepted answers. Master keeps a floor of 2 on purpose, so that tier can stay sharper. No level has a maximum.
  - **A pick cannot dead-end the board.** The generator checks the first pick. Later picks are checked as you play: a clue-valid answer that would leave no way to finish is refused, and it does not spend a miss. Proving every sequence while the board is generated does not fit the broad Standard grape and estate pools, so the guarantee is enforced on the pick.
- **Anonymous Play + Seamless Account Upgrade & History Sync**:
  - Play immediately as an anonymous guest (`anon_id` + LocalStorage + Supabase `game_sessions`).
  - Sign in anytime with **Supabase Auth** to automatically claim and merge all prior anonymous games via the `claim_anonymous_history` Postgres RPC.
- **Dual Free-Tier Observability**:
  - **PostHog Free Tier** (`posthog-js`): 1M events/month, Session Replay, Web Vitals, and runtime error capture.
  - **Supabase First-Party Telemetry**: Logs structured events into `public.telemetry_events` and tracks live cell pick rarity percentages via `public.record_cell_pick`, with a built-in **Live Telemetry Drawer** inside the UI.

---

## 🚀 Quick Start (Local Development)

```bash
npm install
npm run test:matrix   # Verifies 180 3x3 matrices & generates supabase/seed.sql
npm run dev           # Starts Next.js at http://localhost:3000
```

---

## 🗄️ Free Supabase Setup (2 Minutes)

1. Create a free project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase Dashboard and run:
   - [`supabase/migrations/0001_winegrid_schema.sql`](./supabase/migrations/0001_winegrid_schema.sql) (Creates tables, indexes, RLS policies, and `record_cell_pick` + `claim_anonymous_history` RPCs)
   - [`supabase/seed.sql`](./supabase/seed.sql) (Seeds all 123 Wine Entities into `public.wine_entities`)
3. Copy `.env.example` to `.env.local` and fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

---

## 📊 Free Observability Setup (PostHog)

1. Create a free account at [posthog.com](https://posthog.com) (Free tier includes 1,000,000 events/month, 5,000 session recordings, and error tracking).
2. Add `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` to `.env.local` (and Vercel Environment Variables).

---

## 🌐 Free Hosting Deployment (Vercel)

1. Push this repository to GitHub.
2. Import the project on [vercel.com](https://vercel.com) (Hobby Free Tier).
3. Add your `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_POSTHOG_KEY` environment variables and click **Deploy**.
