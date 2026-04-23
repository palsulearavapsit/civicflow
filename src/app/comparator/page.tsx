"use client";

import { useState } from "react";
import { Card, Button, Badge, cn } from "@/components/ui";
import { Check, X, Clock, ShieldCheck, MapPin, Mail, Zap, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const methods = [
  {
    id: 'in-person',
    title: 'In-Person (Election Day)',
    icon: MapPin,
    description: 'The traditional way to vote at your local assigned polling place.',
    pros: ['Immediate support from poll workers', 'I-voted sticker on the spot', 'Classic civic experience'],
    cons: ['Potentially long lines', 'Limited to one specific day', 'Fixed hours (7 AM - 8 PM)'],
    security: 'High - ID verification on site',
    flexibility: 'Low',
    speed: 'Instant result'
  },
  {
    id: 'early',
    title: 'Early Voting',
    icon: Zap,
    description: 'Vote in person days or weeks before the actual election day.',
    pros: ['Avoid the rush', 'Choose a time that fits your schedule', 'Shorter wait times'],
    cons: ['Limited locations', 'Dates vary by state', 'Must plan ahead'],
    security: 'High - Same as election day',
    flexibility: 'Medium',
    speed: 'Processed early'
  },
  {
    id: 'mail',
    title: 'Mail-In / Absentee',
    icon: Mail,
    description: 'Receive your ballot by mail and return it via post or drop-box.',
    pros: ['Vote from home', 'Time to research candidates', 'No physical travel needed'],
    cons: ['Must request ballot in advance', 'Postage deadlines apply', 'Requires signature verification'],
    security: 'Medium - Signature matching used',
    flexibility: 'High',
    speed: 'Requires mailing time'
  }
];

export default function ComparatorPage() {
  const [selected, setSelected] = useState<string[]>(['in-person', 'early', 'mail']);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col items-start gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-bold text-sm">
            <ChevronLeft size={18} /> Back to Dashboard
          </Link>
          <div className="text-center w-full max-w-3xl mx-auto space-y-4">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">Compare Voting Methods</h1>
            <p className="text-slate-500 text-lg">Unsure how to cast your ballot? Compare the options available in your state to find what works best for your schedule.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {methods.map((method) => (
            <motion.div
              key={method.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "relative group flex flex-col h-full bg-white dark:bg-slate-900 border-2 rounded-3xl p-8 transition-all hover:shadow-2xl",
                selected.includes(method.id) ? "border-blue-600 ring-4 ring-blue-500/10" : "border-slate-200 dark:border-slate-800"
              )}
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
                  <method.icon size={28} />
                </div>
                <Badge variant={method.flexibility === 'High' ? 'success' : method.flexibility === 'Medium' ? 'warning' : 'default'}>
                  {method.flexibility} Flexibility
                </Badge>
              </div>

              <h3 className="text-2xl font-bold mb-4">{method.title}</h3>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed">{method.description}</p>

              <div className="space-y-8 flex-1">
                <div className="space-y-3">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Pros</p>
                  {method.pros.map(pro => (
                    <div key={pro} className="flex items-start gap-2 text-sm">
                      <Check className="text-green-500 mt-1 flex-shrink-0" size={16} />
                      <span className="text-slate-700 dark:text-slate-300">{pro}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Cons</p>
                  {method.cons.map(con => (
                    <div key={con} className="flex items-start gap-2 text-sm">
                      <X className="text-red-400 mt-1 flex-shrink-0" size={16} />
                      <span className="text-slate-700 dark:text-slate-300">{con}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 flex items-center gap-2"><ShieldCheck size={16} /> Security</span>
                    <span className="font-bold">{method.security}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 flex items-center gap-2"><Clock size={16} /> Result Speed</span>
                    <span className="font-bold">{method.speed}</span>
                  </div>
                </div>
              </div>

              <Button className="mt-10 w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold py-4">
                Select This Method
              </Button>
            </motion.div>
          ))}
        </div>

        <Card className="bg-blue-600 text-white border-none p-10 overflow-hidden relative">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold">Ready to make your choice?</h2>
              <p className="text-blue-100 max-w-xl">We will update your personalized election plan and timeline based on the method you select here.</p>
            </div>
            <Button className="bg-white text-blue-600 px-8 py-4 text-lg font-bold shadow-xl shadow-blue-900/20">
              Confirm My Selection
            </Button>
          </div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
        </Card>
      </div>
    </div>
  );
}
