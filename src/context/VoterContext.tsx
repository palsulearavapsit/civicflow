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

import { useElectionWorker } from "@/hooks/useElectionWorker";

export function VoterProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const { plan, loading, recalculate } = useElectionWorker(profile);

  return (
    <VoterContext.Provider value={{ plan, refreshPlan: recalculate }}>
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
