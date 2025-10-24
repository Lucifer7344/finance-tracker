import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database';
import { X } from 'lucide-react';

type CreditCard = Database['public']['Tables']['credit_cards']['Row'];

interface CreditCardModalProps {
  userId: string;
  creditCard?: CreditCard;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreditCardModal({ userId, creditCard, onClose, onSuccess }: CreditCardModalProps) {
  const [formData, setFormData] = useState({
    name: creditCard?.name || '',
    bank: creditCard?.bank || '',
    last_four_digits: creditCard?.last_four_digits || '',
    credit_limit: creditCard?.credit_limit?.toString() || '0',
    current_balance: creditCard?.current_balance?.toString() || '0',
    billing_day: creditCard?.billing_day?.toString() || '1',
    due_day: creditCard?.due_day?.toString() || '10',
    interest_rate: creditCard?.interest_rate?.toString() || '0',
    is_active: creditCard?.is_active ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = {
        name: formData.name,
        bank: formData.bank,
        last_four_digits: formData.last_four_digits,
        credit_limit: Number(formData.credit_limit),
        current_balance: Number(formData.current_balance),
        billing_day: Number(formData.billing_day),
        due_day: Number(formData.due_day),
        interest_rate: Number(formData.interest_rate),
        is_active: formData.is_active,
      };

      if (creditCard) {
        const { error: updateError } = await supabase
          .from('credit_cards')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', creditCard.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('credit_cards')
          .insert({ user_id: userId, ...data });

        if (insertError) throw insertError;
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">
            {creditCard ? 'Edit Credit Card' : 'Add Credit Card'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Card Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                placeholder="e.g., Platinum Card"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Bank *</label>
              <input
                type="text"
                required
                value={formData.bank}
                onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                placeholder="e.g., Chase"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Last 4 Digits *</label>
            <input
              type="text"
              required
              maxLength={4}
              pattern="[0-9]{4}"
              value={formData.last_four_digits}
              onChange={(e) => setFormData({ ...formData, last_four_digits: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
              placeholder="1234"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Credit Limit *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.credit_limit}
                onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Current Balance *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.current_balance}
                onChange={(e) => setFormData({ ...formData, current_balance: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Billing Day *</label>
              <input
                type="number"
                min="1"
                max="31"
                required
                value={formData.billing_day}
                onChange={(e) => setFormData({ ...formData, billing_day: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Due Day *</label>
              <input
                type="number"
                min="1"
                max="31"
                required
                value={formData.due_day}
                onChange={(e) => setFormData({ ...formData, due_day: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Interest Rate (%)</label>
              <input
                type="number"
                step="0.01"
                value={formData.interest_rate}
                onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-violet-600 border-slate-300 rounded focus:ring-violet-500"
            />
            <label htmlFor="is_active" className="text-sm text-slate-700">Card is active</label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-violet-600 to-violet-700 text-white rounded-lg hover:from-violet-700 hover:to-violet-800 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 font-medium"
            >
              {loading ? 'Saving...' : creditCard ? 'Update' : 'Add Card'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
