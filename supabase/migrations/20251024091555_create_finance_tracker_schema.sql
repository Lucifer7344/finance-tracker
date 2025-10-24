/*
  # Finance Tracker Schema

  1. New Tables
    
    ## accounts
    - `id` (uuid, primary key) - Unique identifier
    - `user_id` (uuid, foreign key) - References auth.users
    - `name` (text) - Account name (e.g., "Main Savings", "Emergency Fund")
    - `type` (text) - Account type: 'savings', 'current', 'cash', 'investment'
    - `balance` (numeric) - Current balance
    - `currency` (text) - Currency code (default: 'USD')
    - `is_active` (boolean) - Active status
    - `created_at` (timestamptz) - Creation timestamp
    - `updated_at` (timestamptz) - Last update timestamp

    ## investments
    - `id` (uuid, primary key) - Unique identifier
    - `user_id` (uuid, foreign key) - References auth.users
    - `name` (text) - Investment name
    - `type` (text) - Type: 'stocks', 'mutual_funds', 'bonds', 'crypto', 'real_estate', 'gold', 'other'
    - `amount_invested` (numeric) - Initial investment amount
    - `current_value` (numeric) - Current market value
    - `purchase_date` (date) - Date of purchase
    - `notes` (text) - Additional notes
    - `created_at` (timestamptz) - Creation timestamp
    - `updated_at` (timestamptz) - Last update timestamp

    ## loans
    - `id` (uuid, primary key) - Unique identifier
    - `user_id` (uuid, foreign key) - References auth.users
    - `name` (text) - Loan name (e.g., "Home Loan", "Car Loan")
    - `type` (text) - Type: 'home', 'car', 'personal', 'education', 'business', 'other'
    - `principal_amount` (numeric) - Original loan amount
    - `outstanding_amount` (numeric) - Remaining balance
    - `interest_rate` (numeric) - Annual interest rate percentage
    - `emi_amount` (numeric) - Monthly EMI amount
    - `emi_day` (integer) - Day of month for EMI payment (1-31)
    - `start_date` (date) - Loan start date
    - `end_date` (date) - Expected completion date
    - `lender` (text) - Lender/Bank name
    - `created_at` (timestamptz) - Creation timestamp
    - `updated_at` (timestamptz) - Last update timestamp

    ## credit_cards
    - `id` (uuid, primary key) - Unique identifier
    - `user_id` (uuid, foreign key) - References auth.users
    - `name` (text) - Card name/nickname
    - `bank` (text) - Issuing bank
    - `last_four_digits` (text) - Last 4 digits of card
    - `credit_limit` (numeric) - Total credit limit
    - `current_balance` (numeric) - Outstanding balance
    - `billing_day` (integer) - Billing cycle day (1-31)
    - `due_day` (integer) - Payment due day (1-31)
    - `interest_rate` (numeric) - Interest rate percentage
    - `is_active` (boolean) - Active status
    - `created_at` (timestamptz) - Creation timestamp
    - `updated_at` (timestamptz) - Last update timestamp

    ## recurring_transactions
    - `id` (uuid, primary key) - Unique identifier
    - `user_id` (uuid, foreign key) - References auth.users
    - `name` (text) - Transaction name
    - `type` (text) - Type: 'income' or 'expense'
    - `category` (text) - Category (e.g., 'salary', 'rent', 'utilities', 'subscription')
    - `amount` (numeric) - Transaction amount
    - `frequency` (text) - Frequency: 'monthly', 'quarterly', 'yearly'
    - `day_of_month` (integer) - Day of month (1-31)
    - `start_date` (date) - Start date
    - `end_date` (date) - Optional end date
    - `is_active` (boolean) - Active status
    - `created_at` (timestamptz) - Creation timestamp
    - `updated_at` (timestamptz) - Last update timestamp

    ## transactions
    - `id` (uuid, primary key) - Unique identifier
    - `user_id` (uuid, foreign key) - References auth.users
    - `account_id` (uuid, foreign key) - References accounts (optional)
    - `type` (text) - Type: 'income', 'expense', 'transfer'
    - `category` (text) - Transaction category
    - `amount` (numeric) - Transaction amount
    - `description` (text) - Description
    - `transaction_date` (date) - Date of transaction
    - `created_at` (timestamptz) - Creation timestamp

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Restrict access to user's own records only

  3. Indexes
    - Add indexes on user_id for all tables for better query performance
    - Add indexes on date fields for transaction queries
*/

-- Drop existing tables if they exist (from previous task tracker)
DROP TABLE IF EXISTS tasks;

-- Accounts Table
CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('savings', 'current', 'cash', 'investment')),
  balance numeric(15, 2) DEFAULT 0 NOT NULL,
  currency text DEFAULT 'USD' NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own accounts"
  ON accounts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own accounts"
  ON accounts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts"
  ON accounts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own accounts"
  ON accounts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS accounts_user_id_idx ON accounts(user_id);

-- Investments Table
CREATE TABLE IF NOT EXISTS investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('stocks', 'mutual_funds', 'bonds', 'crypto', 'real_estate', 'gold', 'other')),
  amount_invested numeric(15, 2) NOT NULL,
  current_value numeric(15, 2) NOT NULL,
  purchase_date date NOT NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own investments"
  ON investments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own investments"
  ON investments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own investments"
  ON investments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own investments"
  ON investments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS investments_user_id_idx ON investments(user_id);

-- Loans Table
CREATE TABLE IF NOT EXISTS loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('home', 'car', 'personal', 'education', 'business', 'other')),
  principal_amount numeric(15, 2) NOT NULL,
  outstanding_amount numeric(15, 2) NOT NULL,
  interest_rate numeric(5, 2) NOT NULL,
  emi_amount numeric(15, 2) NOT NULL,
  emi_day integer CHECK (emi_day >= 1 AND emi_day <= 31),
  start_date date NOT NULL,
  end_date date NOT NULL,
  lender text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own loans"
  ON loans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own loans"
  ON loans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own loans"
  ON loans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own loans"
  ON loans FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS loans_user_id_idx ON loans(user_id);

-- Credit Cards Table
CREATE TABLE IF NOT EXISTS credit_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  bank text NOT NULL,
  last_four_digits text CHECK (length(last_four_digits) = 4),
  credit_limit numeric(15, 2) NOT NULL,
  current_balance numeric(15, 2) DEFAULT 0 NOT NULL,
  billing_day integer CHECK (billing_day >= 1 AND billing_day <= 31),
  due_day integer CHECK (due_day >= 1 AND due_day <= 31),
  interest_rate numeric(5, 2) DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credit cards"
  ON credit_cards FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own credit cards"
  ON credit_cards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own credit cards"
  ON credit_cards FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own credit cards"
  ON credit_cards FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS credit_cards_user_id_idx ON credit_cards(user_id);

-- Recurring Transactions Table
CREATE TABLE IF NOT EXISTS recurring_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  category text NOT NULL,
  amount numeric(15, 2) NOT NULL,
  frequency text NOT NULL CHECK (frequency IN ('monthly', 'quarterly', 'yearly')),
  day_of_month integer CHECK (day_of_month >= 1 AND day_of_month <= 31),
  start_date date NOT NULL,
  end_date date,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recurring transactions"
  ON recurring_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own recurring transactions"
  ON recurring_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recurring transactions"
  ON recurring_transactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recurring transactions"
  ON recurring_transactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS recurring_transactions_user_id_idx ON recurring_transactions(user_id);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_id uuid REFERENCES accounts(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  category text NOT NULL,
  amount numeric(15, 2) NOT NULL,
  description text DEFAULT '',
  transaction_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_date_idx ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS transactions_account_id_idx ON transactions(account_id);