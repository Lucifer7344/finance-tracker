import { useState } from 'react';
import type { Database } from '../../types/database';
import { Plus, TrendingUp, Edit2, Trash2, TrendingDown } from 'lucide-react';
import { InvestmentModal } from '../modals/InvestmentModal';
import { supabase } from '../../lib/supabase';

type Investment = Database['public']['Tables']['investments']['Row'];

interface InvestmentsSectionProps {
  investments: Investment[];
  onUpdate: () => void;
  userId: string;
}

export function InvestmentsSection({ investments, onUpdate, userId }: InvestmentsSectionProps) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Investment | undefined>();

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this investment?')) return;

    try {
      const { error } = await supabase.from('investments').delete().eq('id', id);
      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error deleting investment:', error);
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
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Investments</h2>
            <p className="text-sm text-slate-600">Track your portfolio performance</p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditing(undefined);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          <span>Add Investment</span>
        </button>
      </div>

      {investments.length === 0 ? (
        <div className="text-center py-12">
          <TrendingUp className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No investments yet. Start tracking your portfolio.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {investments.map((investment) => {
            const gain = Number(investment.current_value) - Number(investment.amount_invested);
            const gainPercent = (gain / Number(investment.amount_invested)) * 100;
            const isProfit = gain >= 0;

            return (
              <div
                key={investment.id}
                className="group bg-gradient-to-br from-slate-50 to-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xs text-slate-500 uppercase mb-1">{investment.type.replace('_', ' ')}</div>
                    <h3 className="text-lg font-semibold text-slate-800">{investment.name}</h3>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditing(investment);
                        setShowModal(true);
                      }}
                      className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(investment.id)}
                      className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <div className="text-xs text-slate-500">Current Value</div>
                    <div className="text-2xl font-bold text-slate-800">
                      {formatCurrency(Number(investment.current_value))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    {isProfit ? (
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-rose-600" />
                    )}
                    <span className={isProfit ? 'text-emerald-600' : 'text-rose-600'}>
                      {formatCurrency(Math.abs(gain))} ({gainPercent.toFixed(2)}%)
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 text-xs text-slate-500">
                    Invested: {formatCurrency(Number(investment.amount_invested))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <InvestmentModal
          userId={userId}
          investment={editing}
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
