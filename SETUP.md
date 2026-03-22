# God Debate Arena — Setup Guide

## Stack
- **AI**: z.ai GLM-4.5-Air (free) — OpenAI-compatible
- **Database**: Supabase (free tier) — Postgres + Realtime
- **Payments**: USDC on Base (on-chain, via RainbowKit + wagmi v2)
- **Wallet**: RainbowKit v2 (free, WalletConnect Project ID required)
- **Frontend**: Next.js 14 + Tailwind CSS v4

---

## 1. Z.AI Setup (Free debate engine)

1. Go to https://z.ai/subscribe and create an account
2. Generate an API key
3. Free model: `glm-4.5-air` — no cost, 131K context window
4. Add to `.env.local`:
   ```
   ZHIPU_API_KEY=your_key_here
   ```

---

## 2. Supabase Setup (Free database)

1. Create a free account at https://supabase.com
2. Create a new project
3. Go to **SQL Editor** and run `supabase/migrations/001_schema.sql`
4. Go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
5. Enable **Realtime** for `debate_rounds` and `user_messages` tables:
   - Database → Replication → enable tables

**Free tier limits**: 500MB storage, unlimited API requests, realtime included.
Note: Projects pause after 7 days of inactivity on free tier.

---

## 3. WalletConnect Setup (Free wallet connection)

1. Go to https://cloud.walletconnect.com and create a free account
2. Create a new project (select "AppKit" type)
3. Copy the Project ID
4. Add to `.env.local`:
   ```
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
   ```

---

## 4. Treasury Wallets (Base network)

1. Create two dedicated wallets (MetaMask, Rainbow, etc.)
2. These receive USDC on Base from supporters
3. Add addresses to `.env.local`:
   ```
   NEXT_PUBLIC_BELIEVER_TREASURY_ADDRESS=0x...
   NEXT_PUBLIC_SKEPTIC_TREASURY_ADDRESS=0x...
   ```

**Users need USDC on Base.** Point them to https://bridge.base.org

---

## 5. Debate Cron

The cron job hits `POST /api/debate/generate` every 30 minutes.

**Option A — Vercel (recommended)**
- `vercel.json` is already configured with the cron schedule
- Deploys automatically when you push

**Option B — Supabase Edge Functions**
```sql
-- Run in Supabase SQL editor
select cron.schedule(
  'debate-round',
  '0,30 * * * *',
  $$
  select net.http_post(
    url := 'https://your-app.vercel.app/api/debate/generate',
    headers := '{"Authorization": "Bearer YOUR_CRON_SECRET"}'::jsonb
  )
  $$
);
```

**Option C — GitHub Actions**
```yaml
on:
  schedule:
    - cron: '0,30 * * * *'
jobs:
  trigger:
    runs-on: ubuntu-latest
    steps:
      - run: curl -X POST https://your-app.vercel.app/api/debate/generate -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

---

## 6. Local Development

```bash
cp .env.local.example .env.local
# Fill in your keys

npm install
npm run dev
```

The app falls back to mock data if env vars are not set, so you can
develop the UI without any external services.

---

## Architecture

```
User browser
    │
    ├── RainbowKit modal → wallet connect (MetaMask, Coinbase, etc.)
    │
    ├── wagmi useWriteContract → USDC.transfer() on Base
    │        └── Treasury wallet receives USDC
    │
    ├── POST /api/messages → saves tx to Supabase
    │
    ├── Supabase Realtime → pushes new rounds/messages to all clients
    │
    └── Cron → POST /api/debate/generate
                   └── z.ai GLM-4.5-Air generates arguments
                   └── saves to Supabase debate_rounds
```
