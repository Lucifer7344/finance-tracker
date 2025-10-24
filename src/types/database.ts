export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      accounts: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'savings' | 'current' | 'cash' | 'investment'
          balance: number
          currency: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'savings' | 'current' | 'cash' | 'investment'
          balance?: number
          currency?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'savings' | 'current' | 'cash' | 'investment'
          balance?: number
          currency?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      investments: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'stocks' | 'mutual_funds' | 'bonds' | 'crypto' | 'real_estate' | 'gold' | 'other'
          amount_invested: number
          current_value: number
          purchase_date: string
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'stocks' | 'mutual_funds' | 'bonds' | 'crypto' | 'real_estate' | 'gold' | 'other'
          amount_invested: number
          current_value: number
          purchase_date: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'stocks' | 'mutual_funds' | 'bonds' | 'crypto' | 'real_estate' | 'gold' | 'other'
          amount_invested?: number
          current_value?: number
          purchase_date?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
      }
      loans: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'home' | 'car' | 'personal' | 'education' | 'business' | 'other'
          principal_amount: number
          outstanding_amount: number
          interest_rate: number
          emi_amount: number
          emi_day: number
          start_date: string
          end_date: string
          lender: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'home' | 'car' | 'personal' | 'education' | 'business' | 'other'
          principal_amount: number
          outstanding_amount: number
          interest_rate: number
          emi_amount: number
          emi_day: number
          start_date: string
          end_date: string
          lender: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'home' | 'car' | 'personal' | 'education' | 'business' | 'other'
          principal_amount?: number
          outstanding_amount?: number
          interest_rate?: number
          emi_amount?: number
          emi_day?: number
          start_date?: string
          end_date?: string
          lender?: string
          created_at?: string
          updated_at?: string
        }
      }
      credit_cards: {
        Row: {
          id: string
          user_id: string
          name: string
          bank: string
          last_four_digits: string
          credit_limit: number
          current_balance: number
          billing_day: number
          due_day: number
          interest_rate: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          bank: string
          last_four_digits: string
          credit_limit: number
          current_balance?: number
          billing_day: number
          due_day: number
          interest_rate?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          bank?: string
          last_four_digits?: string
          credit_limit?: number
          current_balance?: number
          billing_day?: number
          due_day?: number
          interest_rate?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      recurring_transactions: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'income' | 'expense'
          category: string
          amount: number
          frequency: 'monthly' | 'quarterly' | 'yearly'
          day_of_month: number
          start_date: string
          end_date: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'income' | 'expense'
          category: string
          amount: number
          frequency: 'monthly' | 'quarterly' | 'yearly'
          day_of_month: number
          start_date: string
          end_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'income' | 'expense'
          category?: string
          amount?: number
          frequency?: 'monthly' | 'quarterly' | 'yearly'
          day_of_month?: number
          start_date?: string
          end_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          account_id: string | null
          type: 'income' | 'expense' | 'transfer'
          category: string
          amount: number
          description: string
          transaction_date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          account_id?: string | null
          type: 'income' | 'expense' | 'transfer'
          category: string
          amount: number
          description?: string
          transaction_date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          account_id?: string | null
          type?: 'income' | 'expense' | 'transfer'
          category?: string
          amount?: number
          description?: string
          transaction_date?: string
          created_at?: string
        }
      }
    }
  }
}
