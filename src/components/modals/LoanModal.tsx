import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database';
import { X } from 'lucide-react';

type Loan = Database['public']['Tables']['loans']['Row'];

interface LoanModalProps {
  userId: string;
  loan?: Loan;
  onClose: () => void;
  onSuccess: () => void;
}

export function LoanModal({ userId, loan, onClose, onSuccess }: LoanModalProps) {
  const [formData, setFormData] = useState({
    name: loan?.name || '',
    type: loan?.type || 'personal',
    principal_amount: loan?.principal_amount?.toString() || '0',
    outstanding_amount: loan?.outstanding_amount?.toString() || '0',
    interest_rate: loan?.interest_rate?.toString() || '0',
    emi_amount: loan?.emi_amount?.toString() || '0',
    emi_day: loan?.emi_day?.toString() || '1',
    start_date: loan?.start_date || new Date().toISOString().split('T')[0],
    end_date: loan?.end_date || new Date().toISOString().split('T')[0],
    lender: loan?.lender || '',
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
        type: formData.type as Loan['type'],
        principal_amount: Number(formData.principal_amount),
        outstanding_amount: Number(formData.outstanding_amount),
        interest_rate: Number(formData.interest_rate),
        emi_amount: Number(formData.emi_amount),
        emi_day: Number(formData.emi_day),
        start_date: formData.start_date,
        end_date: formData.end_date,
        lender: formData.lender,
      };

      if (loan) {
        const { error: updateError } = await supabase
          .from('loans')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', loan.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('loans')
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
            {loan ? 'Edit Loan' : 'Add Loan'}
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
              <label className="block text-sm font-medium text-slate-700 mb-2">Loan Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                placeholder="e.g., Home Loan"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
              >
                <option value="home">Home</option>
                <option value="car">Car</option>
                <option value="personal">Personal</option>
                <option value="education">Education</option>
                <option value="business">Business</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Lender/Bank *</label>
            <input
              type="text"
              required
              value={formData.lender}
              onChange={(e) => setFormData({ ...formData, lender: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
              placeholder="e.g., ABC Bank"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Principal Amount *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.principal_amount}
                onChange={(e) => setFormData({ ...formData, principal_amount: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Outstanding Amount *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.outstanding_amount}
                onChange={(e) => setFormData({ ...formData, outstanding_amount: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Interest Rate (%) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.interest_rate}
                onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Monthly EMI *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.emi_amount}
                onChange={(e) => setFormData({ ...formData, emi_amount: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">EMI Day *</label>
              <input
                type="number"
                min="1"
                max="31"
                required
                value={formData.emi_day}
                onChange={(e) => setFormData({ ...formData, emi_day: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Start Date *</label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">End Date *</label>
              <input
                type="date"
                required
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-rose-600 to-rose-700 text-white rounded-lg hover:from-rose-700 hover:to-rose-800 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 font-medium"
            >
              {loading ? 'Saving...' : loan ? 'Update' : 'Add Loan'}
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
