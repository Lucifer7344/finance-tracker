import { useState } from 'react';
import type { Database } from '../../types/database';
import { Plus, CreditCard, Edit2, Trash2, Calendar } from 'lucide-react';
import { CreditCardModal } from '../modals/CreditCardModal';
import { supabase } from '../../lib/supabase';

type CreditCardType = Database['public']['Tables']['credit_cards']['Row'];

interface CreditCardsSectionProps {
  creditCards: CreditCardType[];
  onUpdate: () => void;
  userId: string;
}

export function CreditCardsSection({ creditCards, onUpdate, userId }: CreditCardsSectionProps) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CreditCardType | undefined>();

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this credit card?')) return;

    try {
      const { error } = await supabase.from('credit_cards').delete().eq('id', id);
      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error deleting credit card:', error);
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
          <div className="p-2 bg-violet-100 rounded-lg">
            <CreditCard className="w-6 h-6 text-violet-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Credit Cards</h2>
            <p className="text-sm text-slate-600">Manage your credit card balances</p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditing(undefined);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-violet-700 text-white rounded-lg hover:from-violet-700 hover:to-violet-800 shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          <span>Add Card</span>
        </button>
      </div>

      {creditCards.length === 0 ? (
        <div className="text-center py-12">
          <CreditCard className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No credit cards added yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {creditCards.map((card) => {
            const utilization = (Number(card.current_balance) / Number(card.credit_limit)) * 100;

            return (
              <div
                key={card.id}
                className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="h-44 bg-gradient-to-br from-violet-600 to-violet-700 p-6 text-white">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="text-xs opacity-90">{card.bank}</div>
                      <div className="text-lg font-bold">{card.name}</div>
                    </div>
                    {card.is_active && (
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    )}
                  </div>

                  <div className="text-2xl font-bold mb-2">•••• {card.last_four_digits}</div>

                  <div className="text-xs opacity-75">
                    Balance: {formatCurrency(Number(card.current_balance))} / {formatCurrency(Number(card.credit_limit))}
                  </div>

                  <div className="w-full bg-white/20 rounded-full h-1 mt-2">
                    <div
                      className="bg-white h-1 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(utilization, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-white p-4">
                  <div className="flex items-center justify-between text-xs text-slate-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Bill: {card.billing_day}th</span>
                    </div>
                    <div>Due: {card.due_day}th</div>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditing(card);
                        setShowModal(true);
                      }}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(card.id)}
                      className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <CreditCardModal
          userId={userId}
          creditCard={editing}
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
