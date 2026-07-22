// src/app/(dashboard)/layout.tsx — Protected layout with sidebar (Server layout wrapper)
import DashboardClient from '@/components/layout/DashboardClient';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardClient>{children}</DashboardClient>;
}
