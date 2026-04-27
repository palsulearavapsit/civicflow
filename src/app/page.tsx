"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button, cn } from "@/components/ui";
import { ShieldCheck, Vote, Navigation, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useI18n } from "@/context/I18nContext";

export default function LandingPage() {
  const { user, profile, signInWithGoogle, loading } = useAuth();
  const { t, language, setLanguage } = useI18n();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      if (profile?.onboarded) {
        router.push("/dashboard");
      } else {
        router.push("/onboarding");
      }
    }
  }, [user, profile, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-bold text-slate-500 animate-pulse">Initializing CivicFlow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Language Switcher */}
      <div className="fixed top-6 right-6 z-[100] flex flex-wrap justify-end gap-2 max-w-[200px]">
        {['en', 'es', 'hi', 'mr'].map((lang) => (
          <button 
            key={lang}
            onClick={() => setLanguage(lang as 'en' | 'es' | 'hi' | 'mr')}
            className={cn(
              "px-3 py-1 rounded-full text-[10px] font-black tracking-widest transition-all uppercase", 
              language === lang 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
              : 'bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
            )}
          >
            {lang}
          </button>
        ))}
      </div>

      {/* Background blobs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[600px] h-[600px] bg-indigo-400/20 rounded-full blur-[120px]"></div>
      </div>

      <main id="main-content" tabIndex={-1} className="relative z-10 max-w-7xl mx-auto px-4 pt-20 pb-32 flex flex-col items-center text-center outline-none">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-widest">
            <ShieldCheck size={14} />
            {t('tagline')}
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            {t('welcome')}
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed">
            CivicFlow provides a personalized road map for your voting journey. Deadlines, locations, and interactive guidance, all in one place.
          </p>
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              onClick={signInWithGoogle}
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 text-lg shadow-xl shadow-blue-500/25"
            >
              {t('getStarted')}
            </Button>
            <Button 
              onClick={() => router.push("/onboarding")}
              className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 px-10 py-4 text-lg"
            >
              {t('demoMode')}
            </Button>
          </div>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
            No account required for Demo Mode
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {[
            { 
              title: "Smart Timeline", 
              desc: "Never miss a deadline with a personalized calendar based on your location.",
              icon: Vote 
            },
            { 
              title: "Station Finder", 
              desc: "Instantly find your closest polling station with real-time routing.",
              icon: Navigation 
            },
            { 
              title: "AI Copilot", 
              desc: "Ask any election question in plain language and get instant answers.",
              icon: MessageCircle 
            }
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="p-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-3xl text-left hover:border-blue-400 transition-colors"
            >
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-6">
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
