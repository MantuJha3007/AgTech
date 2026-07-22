'use client';
// src/app/(dashboard)/leases/page.tsx — Lease management

import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import api from '@/services/api';
import { Lease, Land, User } from '@/types';
import { Plus, FileText, Calendar, Loader2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/store/AuthContext';

const emptyForm = { land: '', tenant: '', startDate: '', endDate: '', amount: '', paymentFrequency: 'annually', status: 'pending', terms: '' };

export default function LeasesPage() {
  const { user } = useAuth();
  const [leases, setLeases] = useState<Lease[]>([]);
  const [lands, setLands] = useState<Land[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    try {
      const [lRes, ldRes] = await Promise.all([api.get('/leases'), api.get('/lands')]);
      setLeases(lRes.data.data);
      setLands(ldRes.data.data);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  // eslint-disable-next-line
  useEffect(() => { fetch(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/leases', { ...form, amount: parseFloat(form.amount) });
      toast.success('Lease created!');
      setShowModal(false);
      fetch();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create lease');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this lease?')) return;
    try { await api.delete(`/leases/${id}`); toast.success('Lease deleted'); fetch(); }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (err: any) { toast.error(err?.response?.data?.message || 'Delete failed'); }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:border-green-500/60 transition-all";

  const statusColor: Record<string, string> = {
    active: 'bg-green-500/15 text-green-400',
    pending: 'bg-amber-500/15 text-amber-400',
    expired: 'bg-gray-500/15 text-gray-400',
    terminated: 'bg-red-500/15 text-red-400',
  };

  return (
    <>
      <Navbar title="Lease Registry" subtitle="Manage lease agreements" />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-400 text-sm">{leases.length} lease{leases.length !== 1 ? 's' : ''}</p>
          {user?.role === 'landowner' && (
            <button onClick={() => setShowModal(true)} id="add-lease-btn"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold hover:from-green-500 hover:to-emerald-500 transition-all shadow-lg shadow-green-900/30">
              <Plus size={16} /> New Lease
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-green-500" /></div>
        ) : leases.length === 0 ? (
          <div className="text-center py-20"><FileText size={48} className="mx-auto mb-4 text-gray-700" /><p className="text-gray-500">No leases yet</p></div>
        ) : (
          <div className="space-y-3">
            {leases.map(lease => (
              <div key={lease._id} className="glass-card p-5 flex items-center justify-between hover:border-white/15 transition-all">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-medium text-white">{typeof lease.land === 'object' ? lease.land?.title : 'Land'}</p>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColor[lease.status] || 'bg-gray-500/15 text-gray-400'}`}>{lease.status}</span>
                  </div>
                  <div className="flex items-center gap-6 text-xs text-gray-500">
                    <span>Tenant: {lease.tenant?.name}</span>
                    <span className="flex items-center gap-1"><Calendar size={11} />{new Date(lease.startDate).toLocaleDateString()} → {new Date(lease.endDate).toLocaleDateString()}</span>
                    <span className="text-green-400 font-medium">₹{lease.amount?.toLocaleString('en-IN')} / {lease.paymentFrequency}</span>
                  </div>
                </div>
                {user?.role === 'landowner' && (
                  <button onClick={() => handleDelete(lease._id)} className="ml-4 p-2 rounded-xl hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-all"><Trash2 size={16} /></button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-card w-full max-w-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-5">Create New Lease</h2>
            {lands.length === 0 ? (
              <p className="text-gray-400 text-sm mb-4">You need to add land parcels first.</p>
            ) : (
              <form onSubmit={handleSave} className="space-y-4">
                <select required value={form.land} onChange={e => setForm(f => ({ ...f, land: e.target.value }))} className={inputCls}>
                  <option value="" className="bg-gray-900">Select Land *</option>
                  {lands.map(l => <option key={l._id} value={l._id} className="bg-gray-900">{l.title}</option>)}
                </select>
                <input required value={form.tenant} onChange={e => setForm(f => ({ ...f, tenant: e.target.value }))} placeholder="Tenant User ID *" className={inputCls} />
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs text-gray-400 mb-1">Start Date *</label><input required type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className={inputCls} /></div>
                  <div><label className="block text-xs text-gray-400 mb-1">End Date *</label><input required type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className={inputCls} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input required type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="Amount (₹) *" className={inputCls} />
                  <select value={form.paymentFrequency} onChange={e => setForm(f => ({ ...f, paymentFrequency: e.target.value }))} className={inputCls}>
                    {['monthly','quarterly','annually','one-time'].map(f => <option key={f} value={f} className="bg-gray-900">{f}</option>)}
                  </select>
                </div>
                <textarea value={form.terms} onChange={e => setForm(f => ({ ...f, terms: e.target.value }))} placeholder="Lease terms (optional)" rows={2} className={`${inputCls} resize-none`} />
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white text-sm font-medium">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                    {saving && <Loader2 size={14} className="animate-spin" />} Save Lease
                  </button>
                </div>
              </form>
            )}
            {lands.length === 0 && <button onClick={() => setShowModal(false)} className="w-full py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm">Close</button>}
          </div>
        </div>
      )}
    </>
  );
}
