-- Fix RLS policies for transactions table
-- Ensure all necessary columns exist (idempotent)
ALTER TABLE IF EXISTS transactions 
  ADD COLUMN IF NOT EXISTS metadata jsonb,
  ADD COLUMN IF NOT EXISTS bank_name text,
  ADD COLUMN IF NOT EXISTS account_number text,
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Remove existing policies if they exist to avoid conflicts
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can read their own transactions" ON transactions;
    DROP POLICY IF EXISTS "Service role can do anything" ON transactions;
    DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;
END $$;

-- RLS Policies for transactions table
CREATE POLICY "Users can read their own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow service role to do anything (for edge functions)
-- Note: service_role usually bypasses RLS, but explicit policy doesn't hurt
CREATE POLICY "Service role can do anything" ON transactions
  USING (true)
  WITH CHECK (true);

-- Fix wallets RLS as well
ALTER TABLE IF EXISTS wallets ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can read their own wallets" ON wallets;
END $$;

CREATE POLICY "Users can read their own wallets" ON wallets
  FOR SELECT USING (auth.uid() = user_id);

-- Ensure the handle_opay_deposit function is robust
CREATE OR REPLACE FUNCTION handle_opay_deposit(
  _reference text,
  _amount numeric,
  _metadata jsonb
)
RETURNS boolean AS $$
DECLARE
  _user_id uuid;
  _current_status text;
BEGIN
  -- Select the transaction and lock the row
  SELECT user_id, status INTO _user_id, _current_status
  FROM transactions
  WHERE reference = _reference
  FOR UPDATE;

  -- If transaction not found or already completed, return false
  IF _user_id IS NULL OR _current_status = 'completed' THEN
    RETURN false;
  END IF;

  -- Update transaction status
  UPDATE transactions
  SET 
    status = 'completed',
    metadata = COALESCE(metadata, '{}'::jsonb) || _metadata,
    updated_at = now()
  WHERE reference = _reference;

  -- Update user balance in profiles
  UPDATE profiles
  SET 
    balance = COALESCE(balance, 0) + _amount,
    updated_at = now()
  WHERE id = _user_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for transactions updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
