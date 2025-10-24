import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Database } from '../types/database';
import {
  LogOut,
  Wallet,
  TrendingUp,
  CreditCard,
  Banknote,
  PiggyBank,
  Plus,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { AccountsSection } from './dashboard/AccountsSection';
import { InvestmentsSection } from './dashboard/InvestmentsSection';
import { LoansSection } from './dashboard/LoansSection';
import { CreditCardsSection } from './dashboard/CreditCardsSection';
import { RecurringSection } from './dashboard/RecurringSection';

type Account = Database['public']['Tables']['accounts']['Row'];
type Investment = Database['public']['Tables']['investments']['Row'];
type Loan = Database['public']['Tables']['loans']['Row'];
type CreditCard = Database['public']['Tables']['credit_cards']['Row'];
type RecurringTransaction = Database['public']['Tables']['recurring_transactions']['Row'];

interface DashboardProps {
  user: User;
}

export function Dashboard({ user }: DashboardProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    try {
      const [accountsData, investmentsData, loansData, cardsData, recurringData] = await Promise.all([
        supabase.from('accounts').select('*').order('created_at', { ascending: false }),
        supabase.from('investments').select('*').order('created_at', { ascending: false }),
        supabase.from('loans').select('*').order('created_at', { ascending: false }),
        supabase.from('credit_cards').select('*').order('created_at', { ascending: false }),
        supabase.from('recurring_transactions').select('*').eq('is_active', true).order('created_at', { ascending: false }),
      ]);

      setAccounts(accountsData.data || []);
      setInvestments(investmentsData.data || []);
      setLoans(loansData.data || []);
      setCreditCards(cardsData.data || []);
      setRecurring(recurringData.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  const totalAssets = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0) +
                      investments.reduce((sum, inv) => sum + Number(inv.current_value), 0);

  const totalLiabilities = loans.reduce((sum, loan) => sum + Number(loan.outstanding_amount), 0) +
                          creditCards.reduce((sum, card) => sum + Number(card.current_balance), 0);

  const netWorth = totalAssets - totalLiabilities;

  const investmentGains = investments.reduce((sum, inv) =>
    sum + (Number(inv.current_value) - Number(inv.amount_invested)), 0
  );

  const monthlyRecurringIncome = recurring
    .filter(r => r.type === 'income' && r.frequency === 'monthly')
    .reduce((sum, r) => sum + Number(r.amount), 0);

  const monthlyRecurringExpense = recurring
    .filter(r => r.type === 'expense' && r.frequency === 'monthly')
    .reduce((sum, r) => sum + Number(r.amount), 0);

  const totalMonthlyEMI = loans.reduce((sum, loan) => sum + Number(loan.emi_amount), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8 animate-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
                Finance Tracker
              </h1>
              <p className="text-slate-600">Welcome back, {user.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all duration-200 self-start md:self-auto"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <div className="text-emerald-100 text-sm font-medium">Net Worth</div>
                <PiggyBank className="w-6 h-6 text-emerald-200" />
              </div>
              <div className="text-3xl font-bold mb-1">{formatCurrency(netWorth)}</div>
              <div className="text-emerald-100 text-xs">Assets - Liabilities</div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <div className="text-blue-100 text-sm font-medium">Total Assets</div>
                <Wallet className="w-6 h-6 text-blue-200" />
              </div>
              <div className="text-3xl font-bold mb-1">{formatCurrency(totalAssets)}</div>
              <div className="text-blue-100 text-xs flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                Accounts + Investments
              </div>
            </div>

            <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <div className="text-rose-100 text-sm font-medium">Total Liabilities</div>
                <CreditCard className="w-6 h-6 text-rose-200" />
              </div>
              <div className="text-3xl font-bold mb-1">{formatCurrency(totalLiabilities)}</div>
              <div className="text-rose-100 text-xs flex items-center gap-1">
                <ArrowDownRight className="w-3 h-3" />
                Loans + Credit Cards
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <div className="text-amber-100 text-sm font-medium">Investment Gains</div>
                <TrendingUp className="w-6 h-6 text-amber-200" />
              </div>
              <div className="text-3xl font-bold mb-1">{formatCurrency(investmentGains)}</div>
              <div className="text-amber-100 text-xs">
                {investmentGains >= 0 ? 'Profit' : 'Loss'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="text-slate-600 text-sm mb-2">Monthly Income</div>
              <div className="text-2xl font-bold text-emerald-600">
                {formatCurrency(monthlyRecurringIncome)}
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="text-slate-600 text-sm mb-2">Monthly Expenses</div>
              <div className="text-2xl font-bold text-rose-600">
                {formatCurrency(monthlyRecurringExpense)}
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="text-slate-600 text-sm mb-2">Monthly EMI</div>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(totalMonthlyEMI)}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <AccountsSection accounts={accounts} onUpdate={loadAllData} userId={user.id} />
          <InvestmentsSection investments={investments} onUpdate={loadAllData} userId={user.id} />
          <LoansSection loans={loans} onUpdate={loadAllData} userId={user.id} />
          <CreditCardsSection creditCards={creditCards} onUpdate={loadAllData} userId={user.id} />
          <RecurringSection recurring={recurring} onUpdate={loadAllData} userId={user.id} />
        </div>
      </div>
    </div>
  );
}
