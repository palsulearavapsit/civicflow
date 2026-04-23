"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, Badge, Button, cn } from "@/components/ui";
import { CheckCircle2, Circle, AlertCircle, FileText, Info, ShieldCheck, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function EligibilityChecker() {
  const { profile } = useAuth();
  const [items, setItems] = useState([
    { id: 1, text: "U.S. Citizen", checked: true, required: true },
    { id: 2, text: "18+ years old by Election Day", checked: true, required: true },
    { id: 3, text: "Registered to vote in current state", checked: false, required: true, info: "Deadline is 30 days before election." },
    { id: 4, text: "Valid Government ID", checked: false, required: false, info: "Required for in-person voting in some states." },
    { id: 5, text: "Proof of Residency", checked: false, required: false, info: "Needed if ID address is not current." },
  ]);

  const toggleItem = (id: number) => {
    setItems(items.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const missingRequired = items.filter(i => i.required && !i.checked);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex flex-col items-start gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-bold text-sm">
            <ChevronLeft size={18} /> Back to Dashboard
          </Link>
          <div className="text-center w-full space-y-2">
            <h1 className="text-4xl font-black tracking-tight">Eligibility Checker</h1>
            <p className="text-slate-500">Interactive checklist to ensure you're ready for the ballot.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="text-center p-4">
            <span className="text-3xl font-black text-blue-600">{items.filter(i => i.checked).length}/{items.length}</span>
            <p className="text-xs text-slate-500 font-bold uppercase mt-1">Ready</p>
          </Card>
          <Card className={cn("text-center p-4", missingRequired.length > 0 ? "border-red-500" : "border-green-500")}>
            <span className={cn("text-3xl font-black", missingRequired.length > 0 ? "text-red-500" : "text-green-500")}>
              {missingRequired.length > 0 ? "NOT READY" : "QUALIFIED"}
            </span>
            <p className="text-xs text-slate-500 font-bold uppercase mt-1">Status</p>
          </Card>
          <Card className="text-center p-4">
            <span className="text-3xl font-black text-slate-900 dark:text-white">NOV 3</span>
            <p className="text-xs text-slate-500 font-bold uppercase mt-1">Deadline</p>
          </Card>
        </div>

        <Card className="p-0 overflow-hidden">
          <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
            <h2 className="font-bold">Required Documents & Status</h2>
            <Badge variant="warning">Action Required</Badge>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((item) => (
              <div 
                key={item.id} 
                onClick={() => toggleItem(item.id)}
                className="p-6 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
              >
                <div className={cn("mt-1 flex-shrink-0", item.checked ? "text-green-500" : "text-slate-300")}>
                  {item.checked ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className={cn("font-bold", item.checked ? "text-slate-900 dark:text-white line-through opacity-50" : "text-slate-900 dark:text-white")}>
                      {item.text}
                    </p>
                    {item.required && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">MANDATORY</span>}
                  </div>
                  {item.info && (
                    <div className="mt-2 flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30 text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                      <Info size={14} className="mt-0.5 flex-shrink-0" />
                      {item.info}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {missingRequired.length > 0 && (
          <Card className="bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30 p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
              <div>
                <h3 className="font-bold text-red-900 dark:text-red-400">Risk Detected: Missing Requirements</h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  You haven't confirmed your registration. You have 12 days left to register in {profile?.location.state || 'your state'}.
                </p>
                <Button className="mt-4 bg-red-600 text-white hover:bg-red-700">Register Online Now</Button>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="hover:border-blue-400 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                <FileText size={24} />
              </div>
              <div>
                <h4 className="font-bold text-sm">Download Ballot Guide</h4>
                <p className="text-xs text-slate-500">PDF with all local candidates</p>
              </div>
            </div>
          </Card>
          <Card className="hover:border-blue-400 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="font-bold text-sm">Verify ID Requirements</h4>
                <p className="text-xs text-slate-500">Check state-specific ID laws</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
