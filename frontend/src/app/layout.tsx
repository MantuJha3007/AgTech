import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/store/AuthContext';
import { Toaster } from 'react-hot-toast';
import { Leaf, Mail, Globe } from 'lucide-react';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'AgTech Platform — Smart Agricultural Management',
  description: 'Modern agricultural technology platform for landowners and tenants to manage land, leases, crops and profits.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-gray-950 text-white antialiased">
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <main className="flex-1">
              {children}
            </main>
            <footer className="border-t border-white/5 bg-gray-900/30 backdrop-blur-lg">
              <div className="max-w-7xl mx-auto px-6 py-8 md:py-10">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  {/* Brand */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-900/20 p-0.5">
                      <div className="w-full h-full bg-gray-950/40 rounded-2xl flex items-center justify-center">
                        <Leaf size={18} className="text-white" />
                      </div>
                    </div>
                    <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight">
                      AgTech
                    </span>
                  </div>

                  {/* Social Links */}
                  <div className="flex items-center gap-4">
                    <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors bg-white/5 p-3 rounded-full hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/30 shadow-lg">
                      <Globe size={18} />
                    </a>
                    <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors bg-white/5 p-3 rounded-full hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/30 shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                    </a>
                    <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors bg-white/5 p-3 rounded-full hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/30 shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                    </a>
                    <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors bg-white/5 p-3 rounded-full hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/30 shadow-lg">
                      <Mail size={18} />
                    </a>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
                  <p>&copy; {new Date().getFullYear()} AgTech Platform. All rights reserved.</p>
                  <div className="flex gap-6 font-medium">
                    <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-gray-300 transition-colors">Terms of Service</a>
                  </div>
                </div>
              </div>
            </footer>
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1f2937',
                color: '#f9fafb',
                border: '1px solid #374151',
                borderRadius: '12px',
              },
              success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
