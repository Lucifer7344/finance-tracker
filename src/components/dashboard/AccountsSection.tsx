import { useState } from 'react';
import type { Database } from '../../types/database';
import { Plus, Wallet, Edit2, Trash2 } from 'lucide-react';
import { AccountModal } from '../modals/AccountModal';
import { supabase } from '../../lib/supabase';

type Account = Database['public']['Tables']['accounts']['Row'];

interface AccountsSectionProps {
  accounts: Account[];
  onUpdate: () => void;
  userId: string;
}

export function AccountsSection({ accounts, onUpdate, userId }: AccountsSectionProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | undefined>();

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this account?')) return;

    try {
      const { error } = await supabase.from('accounts').delete().eq('id', id);
      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account');
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const accountTypeColors = {
    savings: 'from-emerald-400 to-emerald-500',
    current: 'from-blue-400 to-blue-500',
    cash: 'from-amber-400 to-amber-500',
    investment: 'from-violet-400 to-violet-500',
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 animate-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Wallet className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Accounts</h2>
            <p className="text-sm text-slate-600">Manage your bank accounts and cash</p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingAccount(undefined);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          <span>Add Account</span>
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="text-center py-12">
          <Wallet className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No accounts yet. Add your first account to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <div className={`h-32 bg-gradient-to-br ${accountTypeColors[account.type]} p-6 text-white`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-sm opacity-90 mb-1">{account.type.toUpperCase()}</div>
                    <div className="text-2xl font-bold">{account.name}</div>
                  </div>
                  {account.is_active && (
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  )}
                </div>
                <div className="text-3xl font-bold">{formatCurrency(Number(account.balance))}</div>
              </div>
              <div className="bg-white p-4 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setEditingAccount(account);
                    setShowModal(true);
                  }}
                  className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(account.id)}
                  className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <AccountModal
          userId={userId}
          account={editingAccount}
          onClose={() => {
            setShowModal(false);
            setEditingAccount(undefined);
          }}
          onSuccess={() => {
            setShowModal(false);
            setEditingAccount(undefined);
            onUpdate();
          }}
        />
      )}
    </div>
  );
}
