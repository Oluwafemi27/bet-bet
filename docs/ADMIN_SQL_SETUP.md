# Admin Panel SQL Setup Guide

This document contains all SQL commands needed to ensure admin panel pages are properly connected to the database with realtime support.

## Database Schema Overview

The admin panel uses the following main tables:
- `profiles` - User profile data with status (active/banned/suspended)
- `bets` - User betting records
- `transactions` - Financial transactions
- `fraud_alerts` - Risk and fraud detection
- `kyc_documents` - KYC/compliance documents
- `user_messages` - Support messages
- `sports` - Sportsbook sports
- `leagues` - Sportsbook leagues
- `matches` - Sportsbook matches
- `odds_markets` - Betting odds
- `casino_games` - Casino games
- `agents` - Affiliate agents
- `agent_commissions` - Agent commissions
- `risk_rules` - Risk management rules
- `betting_limits` - User betting limits
- `responsible_gaming_limits` - RG restrictions
- `admin_activity_logs` - Admin action audit trail

## Base Table Setup

All admin tables need the following:
1. Row Level Security (RLS) enabled
2. Admin access policies
3. Realtime publication enabled

### Users Admin Module

**Tables needed:**
- profiles (user data with status field)
- user_roles (admin role assignment)

**Realtime subscriptions:**
```sql
-- Enable RLS if not already done
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Admin policy for profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update profiles" ON profiles
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for profiles
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
```

**Status enum check:**
```sql
-- Verify status column has correct constraint
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status text DEFAULT 'active'
CHECK (status IN ('active', 'banned', 'suspended'));
```

### Bets Admin Module

**Tables needed:**
- bets
- matches
- odds_markets

**Realtime subscriptions:**
```sql
-- Enable RLS for bets
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

-- Admin policy for bets
CREATE POLICY "Admins can view all bets" ON bets
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update bets" ON bets
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE bets;
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
ALTER PUBLICATION supabase_realtime ADD TABLE odds_markets;
```

### Finance Admin Module

**Tables needed:**
- transactions
- profiles (for balance info)

**Realtime subscriptions:**
```sql
-- Enable RLS for transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Admin policy for transactions
CREATE POLICY "Admins can view all transactions" ON transactions
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update transactions" ON transactions
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
```

### Risk Management Module

**Tables needed:**
- fraud_alerts
- risk_rules
- betting_limits

**Realtime subscriptions:**
```sql
-- Enable RLS for fraud alerts
ALTER TABLE fraud_alerts ENABLE ROW LEVEL SECURITY;

-- Admin policy for fraud alerts
CREATE POLICY "Admins can view fraud alerts" ON fraud_alerts
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update fraud alerts" ON fraud_alerts
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Risk rules policies
ALTER TABLE risk_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage risk_rules" ON risk_rules
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Betting limits policies
ALTER TABLE betting_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage betting_limits" ON betting_limits
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE fraud_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE risk_rules;
ALTER PUBLICATION supabase_realtime ADD TABLE betting_limits;
```

### Compliance Module

**Tables needed:**
- kyc_documents
- responsible_gaming_limits

**Realtime subscriptions:**
```sql
-- Enable RLS for KYC documents
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;

-- Admin policy for KYC
CREATE POLICY "Admins can manage kyc_documents" ON kyc_documents
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RG limits policies
ALTER TABLE responsible_gaming_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage responsible_gaming_limits" ON responsible_gaming_limits
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE kyc_documents;
ALTER PUBLICATION supabase_realtime ADD TABLE responsible_gaming_limits;
```

### Sportsbook Module

**Tables needed:**
- sports
- leagues
- matches
- odds_markets

**Realtime subscriptions:**
```sql
-- Enable RLS for sportsbook tables
ALTER TABLE sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE odds_markets ENABLE ROW LEVEL SECURITY;

-- Admin policies for sports
CREATE POLICY "Admins can manage sports" ON sports
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for leagues
CREATE POLICY "Admins can manage leagues" ON leagues
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for matches
CREATE POLICY "Admins can manage matches" ON matches
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for odds
CREATE POLICY "Admins can manage odds_markets" ON odds_markets
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE sports;
ALTER PUBLICATION supabase_realtime ADD TABLE leagues;
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
ALTER PUBLICATION supabase_realtime ADD TABLE odds_markets;
```

### Casino Module

**Tables needed:**
- casino_games
- casino_transactions

**Realtime subscriptions:**
```sql
-- Enable RLS for casino
ALTER TABLE casino_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE casino_transactions ENABLE ROW LEVEL SECURITY;

-- Admin policies
CREATE POLICY "Admins can manage casino_games" ON casino_games
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage casino_transactions" ON casino_transactions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE casino_games;
ALTER PUBLICATION supabase_realtime ADD TABLE casino_transactions;
```

### Agents Module

**Tables needed:**
- agents
- agent_commissions

**Realtime subscriptions:**
```sql
-- Enable RLS for agents
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_commissions ENABLE ROW LEVEL SECURITY;

-- Admin policies
CREATE POLICY "Admins can manage agents" ON agents
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage agent_commissions" ON agent_commissions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE agents;
ALTER PUBLICATION supabase_realtime ADD TABLE agent_commissions;
```

### Dashboard

**Dashboard needs to subscribe to:**
- profiles (for total users count)
- bets (for active bets count)
- transactions (for revenue)
- fraud_alerts (for risk alerts)

All these should already have realtime enabled above.

## Implementation in Admin Components

All admin list components should follow this pattern:

```typescript
useEffect(() => {
  loadData();

  const channel = supabase
    .channel("your-table-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "table_name" },
      () => {
        loadData(); // Reload when changes detected
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

## Verification Commands

Run these in Supabase SQL editor to verify setup:

```sql
-- Check RLS is enabled on all admin tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;

-- Check realtime is enabled
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';

-- Check admin policies exist
SELECT tablename, policyname, permissive, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

## Status

- [x] Users module - realtime subscriptions active
- [x] Bets module - realtime subscriptions active
- [x] Finance module - realtime subscriptions active
- [x] Risk module - realtime subscriptions active
- [x] Compliance module - realtime subscriptions active
- [x] Sportsbook module - realtime subscriptions active
- [x] Casino module - realtime subscriptions active
- [x] Agents module - realtime subscriptions active
- [x] Dashboard - ready for realtime subscription

All tables are properly configured with RLS and admin policies.
