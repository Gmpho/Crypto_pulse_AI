# Database Schema

This document provides a detailed overview of the database schema for the CryptoPulse AI project, including table definitions and Row-Level Security (RLS) policies.

## Core Tables

### `profiles`

This table extends the `auth.users` table from Supabase to store user-specific information.

```sql
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    risk_tolerance TEXT CHECK (risk_tolerance IN ('low', 'medium', 'high')) DEFAULT 'medium',
    trading_mode TEXT CHECK (trading_mode IN ('manual', 'autonomous')) DEFAULT 'manual',
    daily_trade_limit_usd NUMERIC DEFAULT 1000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

### `user_api_keys`

This table stores the encrypted API keys for the exchanges that the user has connected.

```sql
CREATE TABLE user_api_keys (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    exchange_name TEXT NOT NULL,
    key_ciphertext TEXT NOT NULL,
    key_metadata JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, exchange_name)
);
```

### `wallet_addresses`

This table stores the wallet addresses that the user has linked to their account.

```sql
CREATE TABLE wallet_addresses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    address TEXT NOT NULL,
    chain_id INTEGER NOT NULL,
    wallet_type TEXT CHECK (wallet_type IN ('eoa', 'contract')) DEFAULT 'eoa',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(address, chain_id)
);
```

### `trades`

This table stores the user's trade history.

```sql
CREATE TABLE trades (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    exchange TEXT NOT NULL,
    symbol TEXT NOT NULL,
    side TEXT CHECK (side IN ('buy', 'sell')) NOT NULL,
    type TEXT CHECK (type IN ('market', 'limit', 'stop')) NOT NULL,
    quantity NUMERIC NOT NULL,
    price NUMERIC NOT NULL,
    total NUMERIC NOT NULL,
    status TEXT CHECK (status IN ('pending', 'filled', 'cancelled', 'failed')) NOT NULL,
    order_id TEXT,
    tx_hash TEXT,
    fee NUMERIC DEFAULT 0,
    executed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

### `audit_logs`

This table stores immutable audit logs for all actions performed in the system.

```sql
CREATE TABLE audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details JSONB NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

### `embeddings`

This table stores vector embeddings for Retrieval-Augmented Generation (RAG).

```sql
CREATE TABLE embeddings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content_type TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

## Row-Level Security (RLS) Policies

We use RLS to ensure that users can only access their own data.

```sql
-- Enable RLS for all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- API keys policies
CREATE POLICY "Users can view own API keys" ON user_api_keys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own API keys" ON user_api_keys FOR ALL USING (auth.uid() = user_id);

-- Wallet addresses policies
CREATE POLICY "Users can view own wallets" ON wallet_addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own wallets" ON wallet_addresses FOR ALL USING (auth.uid() = user_id);

-- Trades policies
CREATE POLICY "Users can view own trades" ON trades FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert trades" ON trades FOR INSERT WITH CHECK (true);
CREATE POLICY "System can update trades" ON trades FOR UPDATE WITH CHECK (true);

-- Audit logs policies
CREATE POLICY "Users can view own audit logs" ON audit_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert audit logs" ON audit_logs FOR INSERT WITH CHECK (true);

-- Embeddings policies
CREATE POLICY "Anyone can read embeddings" ON embeddings FOR SELECT USING (true);
CREATE POLICY "System can manage embeddings" ON embeddings FOR ALL USING (true);
```
