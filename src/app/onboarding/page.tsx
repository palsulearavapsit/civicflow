"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ChevronRight, MapPin, User, Mail, ShieldCheck } from "lucide-react";

const steps = [
  { id: 'location', title: 'Location', icon: MapPin },
  { id: 'voter-type', title: 'Voter Profile', icon: User },
  { id: 'method', title: 'Voting Method', icon: Mail },
  { id: 'finish', title: 'Ready!', icon: ShieldCheck }
];

import { UserProfile } from "@/types";

interface OnboardingData {
  location: { state: string; zipCode: string };
  ageGroup: UserProfile['ageGroup'];
  isFirstTimeVoter: boolean;
  preferredMethod: UserProfile['preferredMethod'];
  accessibilityNeeds: string[];
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const { profile, updateProfile } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState<OnboardingData>({
    location: { state: '', zipCode: '' },
    ageGroup: '25-44',
    isFirstTimeVoter: false,
    preferredMethod: 'in-person',
    accessibilityNeeds: []
  });

  const next = async () => {
    if (currentStep === steps.length - 1) {
      try {
        if (profile) {
          await updateProfile({ ...formData, onboarded: true });
        }
      } catch (e) {
        console.warn("Profile update failed, proceeding anyway", e);
      }
      router.push("/dashboard");
    } else {
      setCurrentStep(s => s + 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 border border-slate-200 dark:border-slate-800">
        
        {/* Progress Bar */}
        <div className="flex justify-between mb-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0"></div>
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx <= currentStep;
            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-blue-600 text-white scale-110' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                  <Icon size={18} />
                </div>
                <span className={`text-xs mt-2 font-medium ${isActive ? 'text-blue-600' : 'text-slate-400 dark:text-slate-300'}`}>{step.title}</span>
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {currentStep === 0 && (
              <div className="space-y-4">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Where do you vote?</h1>
                <p className="text-slate-500">We need your location to show you specific deadlines and polling places.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">State</label>
                    <input 
                      type="text" 
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="State"
                      value={formData.location.state}
                      onChange={e => setFormData({...formData, location: {...formData.location, state: e.target.value}})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">ZIP Code</label>
                    <input 
                      type="text" 
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Pincode"
                      value={formData.location.zipCode}
                      onChange={e => setFormData({...formData, location: {...formData.location, zipCode: e.target.value}})}
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-4">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">About you</h1>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 text-sm font-semibold">Age Group</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['18-24', '25-44', '45-64', '65+'].map(age => (
                        <button
                          key={age}
                          onClick={() => setFormData({...formData, ageGroup: age as '18-24' | '25-44' | '45-64' | '65+'})}
                          className={`p-3 rounded-xl border text-sm font-medium transition-all ${formData.ageGroup === age ? 'bg-blue-600 text-white border-blue-600' : 'bg-transparent border-slate-200 dark:border-slate-700 hover:border-blue-400 text-slate-900 dark:text-slate-100'}`}
                        >
                          {age}
                        </button>
                      ))}
                    </div>
                  </div>
                  <label className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      checked={formData.isFirstTimeVoter}
                      onChange={e => setFormData({...formData, isFirstTimeVoter: e.target.checked})}
                    />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">I am a first-time voter</p>
                      <p className="text-xs text-slate-500">We&apos;ll give you extra guidance on the basics.</p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">How do you want to vote?</h1>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { id: 'in-person', title: 'In Person on Election Day', desc: 'Visit your local polling station.' },
                    { id: 'early', title: 'Early Voting', desc: 'Avoid the rush by voting early.' },
                    { id: 'mail', title: 'By Mail / Absentee', desc: 'Vote from the comfort of your home.' }
                  ].map(method => (
                    <button
                      key={method.id}
                      onClick={() => setFormData({...formData, preferredMethod: method.id as 'in-person' | 'early' | 'mail'})}
                      className={`flex flex-col items-start p-4 rounded-2xl border transition-all ${formData.preferredMethod === method.id ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-600' : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100'}`}
                    >
                      <span className="font-bold text-slate-900 dark:text-white">{method.title}</span>
                      <span className="text-xs text-slate-500">{method.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="text-center py-10 space-y-6">
                <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={48} />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">You&apos;re all set!</h1>
                <p className="text-slate-500">We&apos;ve generated a personalized election plan just for you based on your location and preferences.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-10 flex justify-between">
          {currentStep > 0 && (
            <button 
              onClick={() => setCurrentStep(s => s - 1)}
              className="px-6 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Back
            </button>
          )}
          <button 
            onClick={next}
            className="ml-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-transform active:scale-95 shadow-lg shadow-blue-500/25"
          >
            {currentStep === steps.length - 1 ? 'Go to Dashboard' : 'Continue'}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
