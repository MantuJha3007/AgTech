'use client';
// src/app/(dashboard)/crops/page.tsx — Crop tracking with lifecycle timeline

import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import api from '@/services/api';
import { Crop, Land } from '@/types';
import { Plus, Sprout, Calendar, Loader2, CheckCircle2, Circle, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

const SEASONS = ['kharif', 'rabi', 'zaid', 'summer', 'winter', 'year-round'];
const STATUS_COLORS: Record<string, string> = {
  planned: 'bg-blue-500/15 text-blue-400',
  growing: 'bg-green-500/15 text-green-400',
  harvested: 'bg-amber-500/15 text-amber-400',
  failed: 'bg-red-500/15 text-red-400',
};

export default function CropsPage() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [lands, setLands] = useState<Land[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', variety: '', land: '', sowDate: '', season: 'kharif', estimatedYield: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    try {
      const [cRes, lRes] = await Promise.all([api.get('/crops'), api.get('/lands')]);
      setCrops(cRes.data.data);
      setLands(lRes.data.data);
    } catch { toast.error('Failed to load crops'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/crops', { ...form, estimatedYield: form.estimatedYield ? parseFloat(form.estimatedYield) : undefined });
      toast.success('Crop added with lifecycle timeline!');
      setShowModal(false);
      setForm({ name: '', variety: '', land: '', sowDate: '', season: 'kharif', estimatedYield: '', notes: '' });
      fetchAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to add crop');
    } finally { setSaving(false); }
  };

  const markStage = async (cropId: string, stage: string) => {
    try {
      await api.patch(`/crops/${cropId}/lifecycle/${stage}`, { actualDate: new Date().toISOString() });
      toast.success(`Stage "${stage}" marked complete`);
      fetchAll();
    } catch { toast.error('Failed to update stage'); }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:border-green-500/60 transition-all";

  return (
    <>
      <Navbar title="Crop Tracking" subtitle="Monitor your crop lifecycle" />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-400 text-sm">{crops.length} crop{crops.length !== 1 ? 's' : ''} tracked</p>
          <button onClick={() => setShowModal(true)} id="add-crop-btn"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold hover:from-green-500 hover:to-emerald-500 transition-all shadow-lg shadow-green-900/30">
            <Plus size={16} /> Add Crop
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-green-500" /></div>
        ) : crops.length === 0 ? (
          <div className="text-center py-20"><Sprout size={48} className="mx-auto mb-4 text-gray-700" /><p className="text-gray-500 mb-2">No crops tracked yet</p><button onClick={() => setShowModal(true)} className="text-green-500 hover:text-green-400 text-sm font-medium">+ Add your first crop</button></div>
        ) : (
          <div className="space-y-4">
            {crops.map(crop => {
              const isExpanded = expanded === crop._id;
              const completedStages = crop.lifecycle?.filter(s => s.completed).length || 0;
              const totalStages = crop.lifecycle?.length || 0;
              const progress = totalStages ? Math.round((completedStages / totalStages) * 100) : 0;

              return (
                <div key={crop._id} className="glass-card overflow-hidden hover:border-white/15 transition-all">
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white">{crop.name}</h3>
                          {crop.variety && <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{crop.variety}</span>}
                        </div>
                        <p className="text-xs text-gray-500">
                          {typeof crop.land === 'object' ? crop.land?.title : 'Land'} &middot; Sown: {new Date(crop.sowDate).toLocaleDateString()} &middot; <span className="capitalize">{crop.season}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[crop.status] || ''}`}>{crop.status}</span>
                        <button onClick={() => setExpanded(isExpanded ? null : crop._id)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-all">
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{completedStages}/{totalStages} stages</span>
                    </div>
                  </div>

                  {/* Lifecycle timeline */}
                  {isExpanded && crop.lifecycle && (
                    <div className="border-t border-white/5 p-5">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Calendar size={12} /> Lifecycle Timeline</h4>
                      <div className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-px bg-white/5" />
                        <div className="space-y-4">
                          {crop.lifecycle.map((stage, i) => (
                            <div key={i} className="flex items-start gap-4 relative">
                              <button
                                onClick={() => !stage.completed && markStage(crop._id, stage.stage)}
                                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${stage.completed ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-600 hover:bg-green-500/10 hover:text-green-500'}`}>
                                {stage.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                              </button>
                              <div className="flex-1 pb-1">
                                <p className={`text-sm font-medium capitalize ${stage.completed ? 'text-green-400' : 'text-gray-300'}`}>{stage.stage}</p>
                                <div className="text-xs text-gray-600 mt-0.5">
                                  Expected: {new Date(stage.expectedDate).toLocaleDateString()}
                                  {stage.actualDate && <span className="ml-2 text-green-600">✓ Done: {new Date(stage.actualDate).toLocaleDateString()}</span>}
                                </div>
                                {stage.notes && <p className="text-xs text-gray-500 mt-1 italic">{stage.notes}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-card w-full max-w-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-5">Add Crop</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Crop name *" className={inputCls} />
                <input value={form.variety} onChange={e => setForm(f => ({ ...f, variety: e.target.value }))} placeholder="Variety" className={inputCls} />
              </div>
              <select required value={form.land} onChange={e => setForm(f => ({ ...f, land: e.target.value }))} className={inputCls}>
                <option value="" className="bg-gray-900">Select Land *</option>
                {lands.map(l => <option key={l._id} value={l._id} className="bg-gray-900">{l.title}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs text-gray-400 mb-1">Sow Date *</label><input required type="date" value={form.sowDate} onChange={e => setForm(f => ({ ...f, sowDate: e.target.value }))} className={inputCls} /></div>
                <select value={form.season} onChange={e => setForm(f => ({ ...f, season: e.target.value }))} className={inputCls}>
                  {SEASONS.map(s => <option key={s} value={s} className="bg-gray-900 capitalize">{s}</option>)}
                </select>
              </div>
              <input type="number" value={form.estimatedYield} onChange={e => setForm(f => ({ ...f, estimatedYield: e.target.value }))} placeholder="Estimated yield (kg)" className={inputCls} />
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notes" rows={2} className={`${inputCls} resize-none`} />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white text-sm font-medium">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                  {saving && <Loader2 size={14} className="animate-spin" />} Add Crop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
