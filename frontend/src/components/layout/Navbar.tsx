'use client';
// src/components/layout/Navbar.tsx

import { Bell, Search } from 'lucide-react';
import { useAuth } from '@/store/AuthContext';

interface NavbarProps { title: string; subtitle?: string; }

export default function Navbar({ title, subtitle }: NavbarProps) {
  const { user } = useAuth();
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <header className="h-16 flex items-center justify-between px-8 border-b"
      style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(3,7,18,0.6)', backdropFilter: 'blur(12px)' }}>
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all border border-white/5">
          <Search size={16} />
        </button>
        <button className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all border border-white/5">
          <Bell size={16} />
        </button>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold">
          {initials}
        </div>
      </div>
    </header>
  );
}
