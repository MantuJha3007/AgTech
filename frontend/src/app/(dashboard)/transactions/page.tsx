'use client';
// src/app/(dashboard)/transactions/page.tsx — P&L ledger

import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import api from '@/services/api';
import { Transaction, PLSummary } from '@/types';
import { Plus, TrendingUp, TrendingDown, Wallet, Loader2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = {
  income: ['lease_income', 'crop_sale', 'other'],
  expense: ['seed_cost', 'fertilizer_cost', 'labor_cost', 'equipment_cost', 'irrigation_cost', 'pesticide_cost', 'other'],
};

const emptyForm = { type: 'income' as 'income' | 'expense', category: 'crop_sale', amount: '', description: '', date: new Date().toISOString().split('T')[0] };

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<PLSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    try {
      const res = await api.get('/transactions');
      setTransactions(res.data.data);
      setSummary(res.data.summary);
    } catch { toast.error('Failed to load transactions'); }
    finally { setLoading(false); }
  };

  // eslint-disable-next-line
  useEffect(() => { fetchAll(); }, []);

  const handleTypeChange = (type: 'income' | 'expense') => {
    setForm(f => ({ ...f, type, category: type === 'income' ? 'crop_sale' : 'seed_cost' }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/transactions', { ...form, amount: parseFloat(form.amount) });
      toast.success('Transaction saved!');
      setShowModal(false);
      setForm(emptyForm);
      fetchAll();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this transaction?')) return;
    try { await api.delete(`/transactions/${id}`); toast.success('Deleted'); fetchAll(); }
    catch { toast.error('Delete failed'); }
  };

  const fmt = (n: number) => `₹${n?.toLocaleString('en-IN') || '0'}`;
  const inputCls = "w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:border-green-500/60 transition-all";

  return (
    <>
      <Navbar title="P&L Ledger" subtitle="Profit & Loss tracker" />
      <div className="flex-1 p-8 space-y-6">

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Income', value: fmt(summary?.totalIncome || 0), icon: TrendingUp, color: 'text-green-400', border: 'border-green-500/20' },
            { label: 'Total Expense', value: fmt(summary?.totalExpense || 0), icon: TrendingDown, color: 'text-red-400', border: 'border-red-500/20' },
            { label: 'Net Profit', value: fmt(summary?.netProfit || 0), icon: Wallet, color: summary?.netProfit && summary.netProfit >= 0 ? 'text-blue-400' : 'text-red-400', border: 'border-blue-500/20' },
            { label: 'Profit Margin', value: summary?.profitMargin || '0%', icon: TrendingUp, color: 'text-purple-400', border: 'border-purple-500/20' },
          ].map(({ label, value, icon: Icon, color, border }) => (
            <div key={label} className={`glass-card p-5 border ${border}`}>
              <Icon size={18} className={`${color} mb-3`} />
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className={`text-xl font-black ${color}`}>{loading ? '–' : value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <h3 className="font-semibold text-white">All Transactions</h3>
            <button onClick={() => setShowModal(true)} id="add-tx-btn"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs font-semibold hover:from-green-500 hover:to-emerald-500 transition-all">
              <Plus size={14} /> Add Entry
            </button>
          </div>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin text-green-500" /></div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-600"><p>No transactions yet. Add your first entry!</p></div>
          ) : (
            <div className="divide-y divide-white/5">
              {transactions.map(tx => (
                <div key={tx._id} className="flex items-center justify-between px-5 py-4 hover:bg-white/2 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === 'income' ? 'bg-green-500/15' : 'bg-red-500/15'}`}>
                      {tx.type === 'income' ? <TrendingUp size={14} className="text-green-400" /> : <TrendingDown size={14} className="text-red-400" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{tx.description || tx.category.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-gray-600">{new Date(tx.date).toLocaleDateString()} &middot; <span className="capitalize">{tx.category.replace(/_/g, ' ')}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-base font-bold ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                    </span>
                    <button onClick={() => handleDelete(tx._id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-all"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-card w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-white mb-5">Add Transaction</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {(['income', 'expense'] as const).map(t => (
                  <button key={t} type="button" onClick={() => handleTypeChange(t)}
                    className={`py-2.5 rounded-xl text-sm font-medium border transition-all capitalize ${form.type === t ? (t === 'income' ? 'border-green-500/60 bg-green-500/15 text-green-400' : 'border-red-500/60 bg-red-500/15 text-red-400') : 'border-white/10 bg-white/5 text-gray-400 hover:text-white'}`}>
                    {t === 'income' ? '↑ Income' : '↓ Expense'}
                  </button>
                ))}
              </div>
              <select required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inputCls}>
                {CATEGORIES[form.type].map(c => <option key={c} value={c} className="bg-gray-900 capitalize">{c.replace(/_/g, ' ')}</option>)}
              </select>
              <input required type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="Amount (₹) *" className={inputCls} />
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" className={inputCls} />
              <div><label className="block text-xs text-gray-400 mb-1">Date</label><input required type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className={inputCls} /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white text-sm font-medium">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                  {saving && <Loader2 size={14} className="animate-spin" />} Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
