"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { Card, Button, Badge } from '@/components/ui';
import { BarChart3, TrendingUp, DollarSign, Cpu, ChevronLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface CostEvent {
  id: string;
  userId: string;
  action: string;
  metadata: {
    model: string;
    promptTokens: number;
    responseTokens: number;
    estimatedCost: number;
  };
  timestamp: any;
}

/**
 * GOOGLE-23: Real-time AI Cost Analytics Dashboard.
 * Admin-only view to track Gemini token usage and costs.
 */
export default function AnalyticsPage() {
  const [events, setEvents] = useState<CostEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalCost: 0, totalTokens: 0, avgResponse: 0 });

  const fetchData = async () => {
    if (!db) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'audit_vault'),
        where('action', '==', 'ai_cost_event'),
        orderBy('timestamp', 'desc'),
        limit(100)
      );
      
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CostEvent[];
      
      setEvents(data);
      
      const totalCost = data.reduce((acc, curr) => acc + curr.metadata.estimatedCost, 0);
      const totalTokens = data.reduce((acc, curr) => acc + curr.metadata.promptTokens + curr.metadata.responseTokens, 0);
      const avgResponse = data.length > 0 ? totalTokens / data.length : 0;
      
      setStats({ totalCost, totalTokens, avgResponse });
    } catch (error) {
      console.error('Analytics Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
              <ChevronLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl font-black tracking-tight">AI Cost Analytics</h1>
              <p className="text-slate-500 text-sm">Real-time tracking of Gemini 1.5 token usage.</p>
            </div>
          </div>
          <Button onClick={fetchData} variant="ghost" className="gap-2">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 flex items-center gap-4 border-l-4 border-l-blue-600">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Estimated Cost</p>
              <p className="text-2xl font-black">${stats.totalCost.toFixed(4)}</p>
            </div>
          </Card>
          <Card className="p-6 flex items-center gap-4 border-l-4 border-l-purple-600">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-2xl">
              <Cpu size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Tokens Processed</p>
              <p className="text-2xl font-black">{stats.totalTokens.toLocaleString()}</p>
            </div>
          </Card>
          <Card className="p-6 flex items-center gap-4 border-l-4 border-l-emerald-600">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Avg. Response Size</p>
              <p className="text-2xl font-black">{Math.round(stats.avgResponse)} <span className="text-sm font-normal text-slate-500">tokens</span></p>
            </div>
          </Card>
        </div>

        {/* Table Section */}
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h2 className="font-bold flex items-center gap-2">
              <BarChart3 size={20} className="text-blue-600" />
              Recent Consumption Events
            </h2>
            <Badge variant="info">Top 100 Events</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase tracking-widest font-black text-slate-400">
                  <th className="p-4">User ID</th>
                  <th className="p-4">Model</th>
                  <th className="p-4 text-right">Prompt</th>
                  <th className="p-4 text-right">Response</th>
                  <th className="p-4 text-right">Est. Cost</th>
                  <th className="p-4 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {events.map(event => (
                  <tr key={event.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors text-sm">
                    <td className="p-4 font-mono text-xs text-slate-500">{event.userId.slice(0, 8)}...</td>
                    <td className="p-4 font-bold">{event.metadata.model}</td>
                    <td className="p-4 text-right">{event.metadata.promptTokens}</td>
                    <td className="p-4 text-right">{event.metadata.responseTokens}</td>
                    <td className="p-4 text-right font-bold text-emerald-600">${event.metadata.estimatedCost.toFixed(6)}</td>
                    <td className="p-4 text-right text-xs text-slate-400">
                      {event.timestamp?.toDate ? event.timestamp.toDate().toLocaleTimeString() : 'Just now'}
                    </td>
                  </tr>
                ))}
                {events.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="p-20 text-center text-slate-400 italic">No cost events recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
