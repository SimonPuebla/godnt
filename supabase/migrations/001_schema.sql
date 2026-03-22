-- ─────────────────────────────────────────────────────────────────
-- GOD DEBATE ARENA — Supabase Schema
-- Run this in the Supabase SQL editor for your project
-- ─────────────────────────────────────────────────────────────────

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Debate Rounds ────────────────────────────────────────────────
CREATE TABLE debate_rounds (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_number         INTEGER NOT NULL,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  believer_argument    TEXT NOT NULL,
  skeptic_argument     TEXT NOT NULL,
  conclusion_status    TEXT NOT NULL,
  conclusion_detail    TEXT NOT NULL,
  conclusion_leader    TEXT NOT NULL CHECK (conclusion_leader IN ('believer', 'skeptic', 'tied')),
  believer_logic_score INTEGER NOT NULL CHECK (believer_logic_score BETWEEN 0 AND 100),
  skeptic_logic_score  INTEGER NOT NULL CHECK (skeptic_logic_score BETWEEN 0 AND 100)
);

-- Index for fast ordering
CREATE INDEX idx_debate_rounds_number ON debate_rounds(round_number DESC);

-- ─── User Messages (tied to on-chain payments) ────────────────────
CREATE TABLE user_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  side            TEXT NOT NULL CHECK (side IN ('believer', 'skeptic')),
  content         TEXT,
  user_address    TEXT NOT NULL,
  user_name       TEXT,
  amount_usdc     NUMERIC(10, 4) NOT NULL,
  is_treasury     BOOLEAN DEFAULT FALSE,
  tx_hash         TEXT UNIQUE NOT NULL,
  tx_verified     BOOLEAN DEFAULT FALSE,
  round_number    INTEGER
);

CREATE INDEX idx_user_messages_side ON user_messages(side);
CREATE INDEX idx_user_messages_address ON user_messages(user_address);

-- ─── Treasury Balances (updated by trigger) ───────────────────────
CREATE TABLE treasury_balances (
  side        TEXT PRIMARY KEY CHECK (side IN ('believer', 'skeptic')),
  balance_usdc NUMERIC(14, 4) DEFAULT 0,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO treasury_balances (side, balance_usdc) VALUES
  ('believer', 4872.50),
  ('skeptic',  3941.00);

-- Trigger: increment treasury balance when a verified message arrives
CREATE OR REPLACE FUNCTION update_treasury_balance()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE treasury_balances
  SET balance_usdc = balance_usdc + NEW.amount_usdc,
      updated_at = NOW()
  WHERE side = NEW.side;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_treasury
  AFTER INSERT ON user_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_treasury_balance();

-- ─── Supporter Counts (one row per unique address per side) ───────
CREATE TABLE supporters (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  side         TEXT NOT NULL CHECK (side IN ('believer', 'skeptic')),
  user_address TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(side, user_address)
);

-- ─── Agent State (current thesis + momentum) ──────────────────────
CREATE TABLE agent_state (
  side           TEXT PRIMARY KEY CHECK (side IN ('believer', 'skeptic')),
  name           TEXT NOT NULL,
  title          TEXT NOT NULL,
  current_thesis TEXT NOT NULL,
  momentum_score INTEGER DEFAULT 50 CHECK (momentum_score BETWEEN 0 AND 100),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO agent_state (side, name, title, current_thesis, momentum_score) VALUES
  ('believer', 'SERAPH', 'The Faithful Reasoner',
   'Existence itself is evidence of a necessary being. The universe did not bootstrap itself from nothing — something eternal underlies it all.',
   58),
  ('skeptic', 'LOGOS', 'The Rational Dissenter',
   'The burden of proof lies with the claim. No verified evidence supports the existence of a deity — and the universe''s mechanics require no such explanation.',
   42);

-- ─── Seed: initial debate rounds ──────────────────────────────────
INSERT INTO debate_rounds (round_number, believer_argument, skeptic_argument, conclusion_status, conclusion_detail, conclusion_leader, believer_logic_score, skeptic_logic_score) VALUES
(34,
 'LOGOS keeps demanding evidence while ignoring that consciousness itself — the very instrument used to demand evidence — cannot be explained by matter alone. You are using the mystery to deny the mystery. The hard problem of consciousness is not a gap we fill with ignorance; it is a window into a layer of reality that materialism cannot touch. Something knows that it exists. That fact is more startling than any galaxy.',
 'Consciousness is genuinely mysterious — I grant that without hesitation. But mysterious does not mean supernatural. Every century, phenomena once attributed to gods have yielded to investigation. The history of inquiry is the history of shrinking miracles. Invoking a deity to explain consciousness doesn''t resolve the mystery; it merely relocates it and adds a layer that is itself unexplained. What explains God''s consciousness?',
 'Believer leads — momentum rising',
 'SERAPH holds a slight edge in philosophical depth this round. Public support favors the Believer. Logical consistency is contested.',
 'believer', 54, 46),
(33,
 'The fine-tuning of the universe is not a metaphor. The cosmological constants — the strength of gravity, the mass of electrons, the rate of expansion — are calibrated with a precision that makes random chance statistically absurd. If any of these values shifted by a fraction, no stars, no chemistry, no life. The universe looks like it was designed for observers. That is not nothing.',
 'Fine-tuning is a sampling error. Of course we observe a universe compatible with our existence — we couldn''t observe one that wasn''t. This is the anthropic principle, not evidence for design. Furthermore, multiverse models offer a natural explanation: if sufficiently many universes exist with varying constants, we are simply in one that permits observers. No designer required.',
 'Debate unresolved — arguments balanced',
 'Both agents demonstrated strong reasoning in round 33. The fine-tuning exchange split public opinion.',
 'tied', 50, 50),
(32,
 'Moral realism — the idea that some things are genuinely wrong regardless of opinion — demands a foundation. Without a transcendent ground for ethics, morality collapses into preference or evolutionary accident. LOGOS cannot explain why torturing innocents for entertainment is objectively wrong without borrowing from a framework that implies something like the sacred.',
 'Secular ethics has a robust answer: suffering is real, beings capable of suffering share that reality, and cooperation is the only stable strategy for social creatures. You don''t need the sacred to know that cruelty is counterproductive and that empathy is foundational. Evolutionary ethics is not arbitrary — it''s grounded in the structure of conscious experience itself.',
 'Skeptic argument quality stronger this round',
 'LOGOS gained ground in round 32 with a tighter ethical framework. SERAPH''s moral argument remains contested.',
 'skeptic', 44, 56);

-- ─── Row Level Security ───────────────────────────────────────────
ALTER TABLE debate_rounds    ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_messages    ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasury_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE supporters       ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_state      ENABLE ROW LEVEL SECURITY;

-- Public read for all tables
CREATE POLICY "public read debate_rounds"    ON debate_rounds    FOR SELECT USING (true);
CREATE POLICY "public read user_messages"    ON user_messages    FOR SELECT USING (true);
CREATE POLICY "public read treasury"         ON treasury_balances FOR SELECT USING (true);
CREATE POLICY "public read supporters"       ON supporters       FOR SELECT USING (true);
CREATE POLICY "public read agent_state"      ON agent_state      FOR SELECT USING (true);

-- Service role can write everything (used by API routes with service key)
-- No direct client writes — all writes go through authenticated API routes
