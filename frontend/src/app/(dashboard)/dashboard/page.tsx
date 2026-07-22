'use client';
// src/app/(dashboard)/dashboard/page.tsx — P&L Dashboard

import { useEffect, useState } from 'react';
import { useAuth } from '@/store/AuthContext';
import Navbar from '@/components/layout/Navbar';
import api from '@/services/api';
import { TrendingUp, TrendingDown, Wallet, Sprout, Map, FileText, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Stats {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  profitMargin: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [landCount, setLandCount] = useState(0);
  const [cropCount, setCropCount] = useState(0);
  const [leaseCount, setLeaseCount] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [txRes, landRes, cropRes, leaseRes] = await Promise.all([
          api.get('/transactions'),
          api.get('/lands'),
          api.get('/crops'),
          api.get('/leases'),
        ]);
        setStats(txRes.data.summary);
        setLandCount(landRes.data.count);
        setCropCount(cropRes.data.count);
        setLeaseCount(leaseRes.data.count);

        // Build monthly chart data from transactions
        const txList = txRes.data.data || [];
        const monthlyMap: Record<string, { month: string; Income: number; Expense: number }> = {};
        txList.forEach((tx: any) => {
          const d = new Date(tx.date);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
          if (!monthlyMap[key]) monthlyMap[key] = { month: label, Income: 0, Expense: 0 };
          if (tx.type === 'income') monthlyMap[key].Income += tx.amount;
          else monthlyMap[key].Expense += tx.amount;
        });
        setChartData(Object.values(monthlyMap).slice(-6));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const fmt = (n: number) => `₹${n?.toLocaleString('en-IN') || '0'}`;

  const statCards = [
    { label: 'Total Income', value: fmt(stats?.totalIncome || 0), icon: TrendingUp, color: 'from-green-600 to-emerald-600', bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400' },
    { label: 'Total Expense', value: fmt(stats?.totalExpense || 0), icon: TrendingDown, color: 'from-red-600 to-rose-600', bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400' },
    { label: 'Net Profit', value: fmt(stats?.netProfit || 0), icon: Wallet, color: 'from-blue-600 to-indigo-600', bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400' },
    { label: 'Profit Margin', value: stats?.profitMargin || '0%', icon: ArrowUpRight, color: 'from-purple-600 to-violet-600', bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400' },
  ];

  return (
    <>
      <Navbar title="Dashboard" subtitle={`Welcome back, ${user?.name}`} />
      <div className="flex-1 p-8 space-y-8">

        {/* P&L Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ label, value, icon: Icon, bg, border, text }) => (
            <div key={label} className={`glass-card p-5 border ${border}`}>
              <div className={`w-10 h-10 rounded-xl ${bg} border ${border} flex items-center justify-center mb-4`}>
                <Icon size={18} className={text} />
              </div>
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className={`text-2xl font-black ${text}`}>{loading ? '–' : value}</p>
            </div>
          ))}
        </div>

        {/* Quick counts */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Land Parcels', value: landCount, icon: Map, href: '/land', color: 'text-amber-400' },
            { label: 'Active Crops', value: cropCount, icon: Sprout, href: '/crops', color: 'text-green-400' },
            { label: 'Leases', value: leaseCount, icon: FileText, href: '/leases', color: 'text-sky-400' },
          ].map(({ label, value, icon: Icon, href, color }) => (
            <Link key={label} href={href} className="glass-card p-5 hover:border-white/15 transition-all group flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all">
                <Icon size={22} className={color} />
              </div>
              <div>
                <p className="text-2xl font-black text-white">{loading ? '–' : value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Chart */}
        <div className="glass-card p-6">
          <h3 className="text-base font-semibold text-white mb-6">Income vs Expense — Last 6 Months</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '12px', color: '#f9fafb' }} />
                <Bar dataKey="Income" fill="#22c55e" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Expense" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-600 text-sm">
              No transaction data yet. <Link href="/transactions" className="ml-2 text-green-500 hover:text-green-400">Add transactions →</Link>
            </div>
          )}
        </div>

      </div>
    </>
  );
}
