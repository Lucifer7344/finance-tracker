import { useState } from 'react';
import type { Database } from '../../types/database';
import { Plus, Repeat, Edit2, Trash2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { RecurringModal } from '../modals/RecurringModal';
import { supabase } from '../../lib/supabase';

type RecurringTransaction = Database['public']['Tables']['recurring_transactions']['Row'];

interface RecurringSectionProps {
  recurring: RecurringTransaction[];
  onUpdate: () => void;
  userId: string;
}

export function RecurringSection({ recurring, onUpdate, userId }: RecurringSectionProps) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<RecurringTransaction | undefined>();

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this recurring transaction?')) return;

    try {
      const { error } = await supabase.from('recurring_transactions').delete().eq('id', id);
      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error deleting recurring transaction:', error);
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 animate-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Repeat className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Recurring Transactions</h2>
            <p className="text-sm text-slate-600">Fixed income and expenses</p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditing(undefined);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg hover:from-amber-700 hover:to-amber-800 shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          <span>Add Recurring</span>
        </button>
      </div>

      {recurring.length === 0 ? (
        <div className="text-center py-12">
          <Repeat className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No recurring transactions yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recurring.map((item) => (
            <div
              key={item.id}
              className={`group rounded-xl p-5 border-2 hover:shadow-lg transition-all duration-300 ${
                item.type === 'income'
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-rose-50 border-rose-200'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  {item.type === 'income' ? (
                    <ArrowUpCircle className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <ArrowDownCircle className="w-6 h-6 text-rose-600" />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">{item.name}</h3>
                    <p className="text-xs text-slate-600">{item.category}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditing(item);
                      setShowModal(true);
                    }}
                    className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-2xl font-bold ${
                    item.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {formatCurrency(Number(item.amount))}
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    {item.frequency} • Day {item.day_of_month}
                  </div>
                </div>
                {item.is_active && (
                  <div className="px-3 py-1 bg-white rounded-full text-xs font-medium text-slate-700 shadow-sm">
                    Active
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <RecurringModal
          userId={userId}
          recurring={editing}
          onClose={() => {
            setShowModal(false);
            setEditing(undefined);
          }}
          onSuccess={() => {
            setShowModal(false);
            setEditing(undefined);
            onUpdate();
          }}
        />
      )}
    </div>
  );
}
