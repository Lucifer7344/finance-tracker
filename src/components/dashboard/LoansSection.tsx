import { useState } from 'react';
import type { Database } from '../../types/database';
import { Plus, Banknote, Edit2, Trash2, Calendar } from 'lucide-react';
import { LoanModal } from '../modals/LoanModal';
import { supabase } from '../../lib/supabase';

type Loan = Database['public']['Tables']['loans']['Row'];

interface LoansSectionProps {
  loans: Loan[];
  onUpdate: () => void;
  userId: string;
}

export function LoansSection({ loans, onUpdate, userId }: LoansSectionProps) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Loan | undefined>();

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this loan?')) return;

    try {
      const { error} = await supabase.from('loans').delete().eq('id', id);
      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error deleting loan:', error);
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
          <div className="p-2 bg-rose-100 rounded-lg">
            <Banknote className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Loans & EMI</h2>
            <p className="text-sm text-slate-600">Track your loans and monthly payments</p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditing(undefined);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-700 text-white rounded-lg hover:from-rose-700 hover:to-rose-800 shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          <span>Add Loan</span>
        </button>
      </div>

      {loans.length === 0 ? (
        <div className="text-center py-12">
          <Banknote className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No loans recorded. Add your first loan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loans.map((loan) => {
            const paidPercent = ((Number(loan.principal_amount) - Number(loan.outstanding_amount)) / Number(loan.principal_amount)) * 100;

            return (
              <div
                key={loan.id}
                className="group bg-gradient-to-br from-rose-50 to-white rounded-xl p-6 border border-rose-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xs text-rose-600 uppercase mb-1">{loan.type} LOAN</div>
                    <h3 className="text-lg font-semibold text-slate-800">{loan.name}</h3>
                    <p className="text-xs text-slate-500">{loan.lender}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditing(loan);
                        setShowModal(true);
                      }}
                      className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(loan.id)}
                      className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span>Outstanding</span>
                      <span>{paidPercent.toFixed(1)}% paid</span>
                    </div>
                    <div className="text-2xl font-bold text-rose-600">
                      {formatCurrency(Number(loan.outstanding_amount))}
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${paidPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200">
                    <div>
                      <div className="text-xs text-slate-500">Monthly EMI</div>
                      <div className="text-lg font-semibold text-slate-800">
                        {formatCurrency(Number(loan.emi_amount))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Interest Rate</div>
                      <div className="text-lg font-semibold text-slate-800">
                        {Number(loan.interest_rate)}%
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-600 pt-2">
                    <Calendar className="w-3 h-3" />
                    <span>EMI on {loan.emi_day}th of every month</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <LoanModal
          userId={userId}
          loan={editing}
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
