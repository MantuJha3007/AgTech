'use client';
// src/app/page.tsx — Simple Premium Landing Page

import Link from 'next/link';
import { ArrowRight, Leaf, BarChart3, MapPin, Bot, Shield, Sprout } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  { icon: Shield, title: 'Role-Based Access', desc: 'Separate dashboards for landowners and tenants with fine-grained permissions.' },
  { icon: MapPin, title: 'Land & Lease Registry', desc: 'Manage land parcels, create leases, track tenants — all in one place.' },
  { icon: Sprout, title: 'Crop Lifecycle Tracking', desc: 'Auto-generate crop timelines from sowing to harvest with milestone tracking.' },
  { icon: Bot, title: 'AI Crop Advisor', desc: 'Get AI-powered crop recommendations based on your location and season.' },
  { icon: BarChart3, title: 'P&L Dashboard', desc: 'Track income vs expenses, view profit margins, and plan your next season.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Navbar */}
      <nav className="w-full border-b border-white/5 bg-gray-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-[1px]">
              <div className="w-full h-full bg-gray-950 rounded-xl flex items-center justify-center">
                <Leaf size={20} className="text-emerald-400" />
              </div>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">AgTech</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 text-sm font-bold transition-all shadow-lg shadow-emerald-500/20">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-6 overflow-hidden">
          {/* Subtle Background Glows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-8"
            >
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Built for Modern Agriculture
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black text-white leading-tight mb-6 tracking-tight"
            >
              Smart Farming <br className="hidden md:block" />
              <span className="gradient-text">Starts Here</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              The complete platform for landowners and tenants. Manage land, track crops, get AI suggestions, and visualize your profits — all in one place.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/register" className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-lg transition-all shadow-xl shadow-emerald-500/20 hover:-translate-y-1">
                Start Free Today <ArrowRight size={20} />
              </Link>
              <Link href="/login" className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-white/10 text-white font-semibold text-lg hover:bg-white/5 transition-all">
                Sign In
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-6 bg-white/[0.02] border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything You Need</h2>
              <p className="text-gray-400 text-lg">Powerful tools designed for the modern agricultural workflow.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map(({ icon: Icon, title, desc }, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  key={title} 
                  className="glass-card p-8 hover:border-emerald-500/30 transition-all group hover:-translate-y-1"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-all">
                    <Icon size={24} className="text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                  <p className="text-gray-400 leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-gray-950 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} AgTech Platform. Built with Next.js + Express + MongoDB.
          </p>
        </div>
      </footer>
    </div>
  );
}
