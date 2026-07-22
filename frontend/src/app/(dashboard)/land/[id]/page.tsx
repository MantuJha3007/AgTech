'use client';
// src/app/(dashboard)/land/[id]/page.tsx — Land detail + lease view

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import api from '@/services/api';
import { Land, Lease } from '@/types';
import { MapPin, Loader2, FileText, Calendar, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function LandDetailPage() {
  const { id } = useParams();
  const [land, setLand] = useState<Land | null>(null);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [landRes, leaseRes] = await Promise.all([
          api.get(`/lands/${id}`),
          api.get('/leases'),
        ]);
        setLand(landRes.data.data);
        setLeases(leaseRes.data.data.filter((l: Lease) =>
          typeof l.land === 'object' ? l.land._id === id : l.land === id
        ));
      } catch { }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  if (loading) return (
    <><Navbar title="Land Detail" /><div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-green-500" /></div></>
  );

  if (!land) return (
    <><Navbar title="Land Detail" /><div className="p-8 text-gray-400">Land not found. <Link href="/land" className="text-green-500">← Back</Link></div></>
  );

  return (
    <>
      <Navbar title={land.title} subtitle={land.location} />
      <div className="flex-1 p-8 space-y-6">
        {/* Info cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Area', value: `${land.area} acres` },
            { label: 'Soil Type', value: land.soilType },
            { label: 'Status', value: land.isAvailable ? 'Available' : 'Leased' },
            { label: 'Survey No.', value: land.surveyNumber || 'N/A' },
          ].map(({ label, value }) => (
            <div key={label} className="glass-card p-4">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className="text-base font-semibold text-white capitalize">{value}</p>
            </div>
          ))}
        </div>

        {land.description && (
          <div className="glass-card p-5">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Description</h3>
            <p className="text-sm text-gray-300">{land.description}</p>
          </div>
        )}

        {/* Leases */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-white flex items-center gap-2"><FileText size={16} className="text-sky-400" /> Lease Agreements ({leases.length})</h3>
            <Link href="/leases" className="text-xs text-green-500 hover:text-green-400 font-medium">Manage Leases →</Link>
          </div>
          {leases.length === 0 ? (
            <p className="text-gray-600 text-sm">No leases for this land.</p>
          ) : (
            <div className="space-y-3">
              {leases.map(lease => (
                <div key={lease._id} className="bg-white/5 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{lease.tenant?.name}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Calendar size={11} /> {new Date(lease.startDate).toLocaleDateString()} – {new Date(lease.endDate).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><DollarSign size={11} /> ₹{lease.amount?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    lease.status === 'active' ? 'bg-green-500/15 text-green-400' :
                    lease.status === 'pending' ? 'bg-amber-500/15 text-amber-400' :
                    'bg-gray-500/15 text-gray-400'
                  }`}>{lease.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
