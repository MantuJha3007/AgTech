'use client';
// src/components/layout/Sidebar.tsx

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Map, FileText, Sprout, Bot, TrendingUp, LogOut, Leaf
} from 'lucide-react';
import { useAuth } from '@/store/AuthContext';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/land', label: 'My Lands', icon: Map },
  { href: '/leases', label: 'Leases', icon: FileText },
  { href: '/crops', label: 'Crops', icon: Sprout },
  { href: '/ai-advisor', label: 'AI Advisor', icon: Bot },
  { href: '/transactions', label: 'P&L Ledger', icon: TrendingUp },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 flex flex-col z-40"
      style={{ background: 'rgba(3,7,18,0.95)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>

      {/* Logo */}
      <div className="flex items-center gap-3 p-6 border-b border-white/5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
          <Leaf size={18} className="text-white" />
        </div>
        <div>
          <h1 className="font-bold text-white text-lg leading-tight">AgTech</h1>
          <p className="text-xs text-gray-500">Platform</p>
        </div>
      </div>

      {/* User badge */}
      <div className="mx-4 mt-4 p-3 rounded-xl" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}>
        <p className="text-xs text-gray-400 mb-1">Signed in as</p>
        <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${
          user?.role === 'landowner'
            ? 'bg-amber-500/20 text-amber-400'
            : 'bg-blue-500/20 text-blue-400'
        }`}>
          {user?.role === 'landowner' ? '🏡 Landowner' : '🌾 Tenant'}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 mt-6 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}>
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/5">
        <button onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
