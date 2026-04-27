"use client";

import React, { createContext, useContext, useState, useMemo } from "react";
import { ElectionTask, PersonalizedPlan, UserProfile } from "@/types";
import { useAuth } from "./AuthContext";
import { differenceInDays, isAfter, addDays } from "date-fns";

interface VoterContextType {
  plan: PersonalizedPlan | null;
  refreshPlan: () => void;
}

const VoterContext = createContext<VoterContextType | undefined>(undefined);

import { generatePlan } from "@/utils/election-logic";


export function VoterProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const [tick, setTick] = useState(0);

  const plan = useMemo(() => {
    // Access tick to ensure dependency is used and triggers refresh when requested
    if (tick < 0) console.log(tick); 
    return generatePlan(profile);
  }, [profile, tick]);

  return (
    <VoterContext.Provider value={{ plan, refreshPlan: () => setTick(t => t + 1) }}>
      {children}
    </VoterContext.Provider>
  );
}

export const useVoter = () => {
  const context = useContext(VoterContext);
  if (context === undefined) {
    throw new Error("useVoter must be used within a VoterProvider");
  }
  return context;
};
