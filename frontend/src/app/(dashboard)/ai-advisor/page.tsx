'use client';
// src/app/(dashboard)/ai-advisor/page.tsx — AI Crop Advisor

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import api from '@/services/api';
import { Bot, Sparkles, Loader2, Leaf, Clock, DollarSign, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { AISuggestion } from '@/types';

const SEASONS = ['kharif', 'rabi', 'zaid', 'summer', 'winter', 'year-round'];
const SOIL_TYPES = ['clay', 'sandy', 'loamy', 'silty', 'peaty', 'chalky', 'other'];

export default function AIAdvisorPage() {
  const [form, setForm] = useState({ location: '', season: 'kharif', soilType: 'loamy', area: '' });
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState<{ location: string; season: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuggestions([]);
    try {
      const res = await api.post('/ai/suggest', form);
      setSuggestions(res.data.data.suggestions);
      setContext({ location: form.location, season: form.season });
      toast.success('AI suggestions ready!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to get suggestions');
    } finally { setLoading(false); }
  };

  const inputCls = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:border-green-500/60 transition-all";

  return (
    <>
      <Navbar title="AI Crop Advisor" subtitle="Get smart crop recommendations" />
      <div className="flex-1 p-8 max-w-5xl">

        {/* Header */}
        <div className="glass-card p-6 mb-8" style={{ border: '1px solid rgba(168,85,247,0.2)', background: 'rgba(168,85,247,0.05)' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <Bot size={20} className="text-purple-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">AI-Powered Crop Recommendations</h2>
              <p className="text-xs text-gray-500">Enter your location and season to get tailored suggestions</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass-card p-6 mb-8">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Location *</label>
              <input required value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                placeholder="e.g. Punjab, India" className={inputCls} id="ai-location" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Season *</label>
              <select required value={form.season} onChange={e => setForm(f => ({ ...f, season: e.target.value }))} className={inputCls}>
                {SEASONS.map(s => <option key={s} value={s} className="bg-gray-900 capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Soil Type</label>
              <select value={form.soilType} onChange={e => setForm(f => ({ ...f, soilType: e.target.value }))} className={inputCls}>
                {SOIL_TYPES.map(s => <option key={s} value={s} className="bg-gray-900 capitalize">{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Area (acres)</label>
              <input type="number" min="0.1" step="0.1" value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))}
                placeholder="e.g. 5.5" className={inputCls} />
            </div>
          </div>
          <button type="submit" disabled={loading} id="get-suggestions-btn"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold text-sm hover:from-purple-500 hover:to-violet-500 transition-all shadow-lg shadow-purple-900/30 disabled:opacity-60">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {loading ? 'Analyzing...' : 'Get AI Suggestions'}
          </button>
        </form>

        {/* Results */}
        {suggestions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-purple-400" />
              <p className="text-sm font-medium text-gray-300">
                Top {suggestions.length} crops for <span className="text-white font-semibold">{context?.location}</span> — <span className="capitalize text-green-400">{context?.season} season</span>
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {suggestions.map((s, i) => (
                <div key={i} className="glass-card p-5 hover:border-purple-500/20 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-white">{s.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{s.variety}</p>
                    </div>
                    <span className="w-8 h-8 rounded-xl bg-green-500/15 flex items-center justify-center">
                      <Leaf size={15} className="text-green-400" />
                    </span>
                  </div>
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-xs">
                      <Clock size={12} className="text-gray-500" />
                      <span className="text-gray-500">Growth period:</span>
                      <span className="text-gray-300 font-medium">{s.growthDays} days</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Leaf size={12} className="text-gray-500" />
                      <span className="text-gray-500">Est. yield:</span>
                      <span className="text-gray-300 font-medium">{s.estimatedYield}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <DollarSign size={12} className="text-gray-500" />
                      <span className="text-gray-500">Market price:</span>
                      <span className="text-green-400 font-semibold">{s.marketPrice}</span>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 flex gap-2">
                    <Info size={12} className="text-gray-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-500 leading-relaxed">{s.tips}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-700 mt-4 text-center">
              ⚠ These suggestions are AI-generated. Consult a local agronomist for personalized advice.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
