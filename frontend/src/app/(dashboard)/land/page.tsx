'use client';
// src/app/(dashboard)/land/page.tsx — Land parcel management

import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import api from '@/services/api';
import { Land } from '@/types';
import { Plus, MapPin, Trash2, Pencil, Loader2, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/store/AuthContext';
import Link from 'next/link';

const SOIL_TYPES = ['clay', 'sandy', 'loamy', 'silty', 'peaty', 'chalky', 'other'];

const emptyForm = { title: '', location: '', area: '', soilType: 'loamy', description: '', surveyNumber: '' };

export default function LandPage() {
  const { user } = useAuth();
  const [lands, setLands] = useState<Land[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchLands = async () => {
    try {
      const res = await api.get('/lands');
      setLands(res.data.data);
    } catch { toast.error('Failed to load lands'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLands(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditing(null); setShowModal(true); };
  const openEdit = (l: Land) => {
    setForm({ title: l.title, location: l.location, area: String(l.area), soilType: l.soilType, description: l.description || '', surveyNumber: l.surveyNumber || '' });
    setEditing(l._id); setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, area: parseFloat(form.area) };
      if (editing) {
        await api.put(`/lands/${editing}`, payload);
        toast.success('Land updated!');
      } else {
        await api.post('/lands', payload);
        toast.success('Land parcel added!');
      }
      setShowModal(false);
      fetchLands();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this land parcel? This cannot be undone.')) return;
    try {
      await api.delete(`/lands/${id}`);
      toast.success('Land deleted');
      setLands(ls => ls.filter(l => l._id !== id));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:border-green-500/60 transition-all";

  return (
    <>
      <Navbar title="Land Registry" subtitle="Manage your land parcels" />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-400 text-sm">{lands.length} parcel{lands.length !== 1 ? 's' : ''} registered</p>
          {user?.role === 'landowner' && (
            <button onClick={openCreate} id="add-land-btn"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold hover:from-green-500 hover:to-emerald-500 transition-all shadow-lg shadow-green-900/30">
              <Plus size={16} /> Add Land
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-green-500" /></div>
        ) : lands.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            <MapPin size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium text-gray-500 mb-2">No lands registered yet</p>
            {user?.role === 'landowner' && <button onClick={openCreate} className="text-green-500 hover:text-green-400 text-sm font-medium">+ Add your first land parcel</button>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {lands.map(land => (
              <div key={land._id} className="glass-card p-5 hover:border-white/15 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-base">{land.title}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><MapPin size={11} />{land.location}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ml-2 ${land.isAvailable ? 'bg-green-500/15 text-green-400' : 'bg-amber-500/15 text-amber-400'}`}>
                    {land.isAvailable ? 'Available' : 'Leased'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">Area</p>
                    <p className="text-sm font-semibold text-white">{land.area} acres</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">Soil Type</p>
                    <p className="text-sm font-semibold text-white capitalize">{land.soilType}</p>
                  </div>
                </div>
                {land.surveyNumber && <p className="text-xs text-gray-600 mb-4">Survey No: {land.surveyNumber}</p>}
                <div className="flex items-center gap-2">
                  <Link href={`/land/${land._id}`}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-medium transition-all">
                    View Details <ChevronRight size={14} />
                  </Link>
                  {user?.role === 'landowner' && (
                    <>
                      <button onClick={() => openEdit(land)} className="p-2 rounded-xl bg-white/5 hover:bg-blue-500/15 text-gray-500 hover:text-blue-400 transition-all"><Pencil size={15} /></button>
                      <button onClick={() => handleDelete(land._id)} className="p-2 rounded-xl bg-white/5 hover:bg-red-500/15 text-gray-500 hover:text-red-400 transition-all"><Trash2 size={15} /></button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-card w-full max-w-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-5">{editing ? 'Edit Land' : 'Add New Land'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Land Title *" className={inputCls} />
              <input required value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Location *" className={inputCls} />
              <div className="grid grid-cols-2 gap-3">
                <input required type="number" min="0.1" step="0.1" value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} placeholder="Area (acres) *" className={inputCls} />
                <select value={form.soilType} onChange={e => setForm(f => ({ ...f, soilType: e.target.value }))} className={inputCls}>
                  {SOIL_TYPES.map(s => <option key={s} value={s} className="bg-gray-900 capitalize">{s}</option>)}
                </select>
              </div>
              <input value={form.surveyNumber} onChange={e => setForm(f => ({ ...f, surveyNumber: e.target.value }))} placeholder="Survey Number (optional)" className={inputCls} />
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" rows={2} className={`${inputCls} resize-none`} />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white text-sm font-medium transition-all">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                  {saving && <Loader2 size={14} className="animate-spin" />} {editing ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
