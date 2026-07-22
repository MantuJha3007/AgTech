// src/types/index.ts — All TypeScript interfaces for the AgTech platform

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'landowner' | 'tenant';
  phone?: string;
  location?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export interface Land {
  _id: string;
  title: string;
  location: string;
  area: number;
  soilType: string;
  description?: string;
  owner: User | string;
  isAvailable: boolean;
  surveyNumber?: string;
  createdAt: string;
}

export interface Lease {
  _id: string;
  land: Land;
  tenant: User;
  startDate: string;
  endDate: string;
  amount: number;
  paymentFrequency: string;
  status: 'active' | 'expired' | 'pending' | 'terminated';
  terms?: string;
  createdBy: string;
  createdAt: string;
}

export interface LifecycleEvent {
  stage: string;
  expectedDate: string;
  actualDate?: string;
  notes?: string;
  completed: boolean;
}

export interface Crop {
  _id: string;
  name: string;
  variety?: string;
  land: Land;
  tenant: User;
  sowDate: string;
  expectedHarvestDate?: string;
  actualHarvestDate?: string;
  status: 'planned' | 'growing' | 'harvested' | 'failed';
  season: string;
  estimatedYield?: number;
  actualYield?: number;
  lifecycle: LifecycleEvent[];
  notes?: string;
  createdAt: string;
}

export interface Transaction {
  _id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description?: string;
  date: string;
  land?: Land;
  crop?: Crop;
  createdBy: string;
  createdAt: string;
}

export interface PLSummary {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  profitMargin: string;
}

export interface TransactionsResponse {
  success: boolean;
  count: number;
  summary: PLSummary;
  data: Transaction[];
}

export interface AISuggestion {
  name: string;
  variety: string;
  growthDays: number;
  estimatedYield: string;
  marketPrice: string;
  tips: string;
}

export interface ApiError {
  success: false;
  message: string;
}
