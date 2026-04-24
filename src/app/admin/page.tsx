"use client";

import { useState } from "react";
import { Card, Button, Badge } from "@/components/ui";
import { Settings, Plus, Save, Trash2, Edit3, ShieldAlert, History } from "lucide-react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'dates' | 'docs' | 'faqs' | 'myths'>('dates');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Admin Sidebar */}
      <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 space-y-8">
        <div className="flex items-center gap-2 px-2">
          <ShieldAlert className="text-red-600" size={24} />
          <h1 className="font-bold text-xl">Admin Panel</h1>
        </div>
        <nav className="space-y-1">
          {[
            { id: 'dates', title: 'Election Dates', icon: History },
            { id: 'docs', title: 'Required Docs', icon: Edit3 },
            { id: 'faqs', title: 'FAQ Management', icon: Plus },
            { id: 'myths', title: 'Myths vs Facts', icon: Settings },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              <tab.icon size={18} />
              {tab.title}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-10 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight capitalize">{activeTab} Management</h2>
            <p className="text-slate-500">Update the global election rules and data across all users.</p>
          </div>
          <Button className="bg-blue-600 text-white flex items-center gap-2">
            <Plus size={18} /> Add New Entry
          </Button>
        </div>

        <Card className="p-0 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-4 font-bold text-xs uppercase text-slate-400">Content</th>
                <th className="p-4 font-bold text-xs uppercase text-slate-400">Status</th>
                <th className="p-4 font-bold text-xs uppercase text-slate-400">Last Updated</th>
                <th className="p-4 font-bold text-xs uppercase text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-sm">General Election Registration Deadline</p>
                    <p className="text-xs text-slate-500">Applies to: All States</p>
                  </td>
                  <td className="p-4">
                    <Badge variant="success">Active</Badge>
                  </td>
                  <td className="p-4 text-xs text-slate-500">
                    Oct 22, 2026 by Admin_V
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Edit3 size={16} /></button>
                      <button className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <div className="flex justify-end">
          <Button className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white flex items-center gap-2">
            <Save size={18} /> Publish Changes
          </Button>
        </div>
      </main>
    </div>
  );
}
