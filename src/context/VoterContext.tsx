"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { ElectionTask, PersonalizedPlan, UserProfile } from "@/types";
import { useAuth } from "./AuthContext";
import { differenceInDays, isAfter, isBefore, addDays } from "date-fns";

interface VoterContextType {
  plan: PersonalizedPlan | null;
  refreshPlan: () => void;
}

const VoterContext = createContext<VoterContextType | undefined>(undefined);

export function VoterProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const [plan, setPlan] = useState<PersonalizedPlan | null>(null);

  const generatePlan = (profile: UserProfile | null): PersonalizedPlan | null => {
    // If no profile, use a default demo profile
    const effectiveProfile = profile || {
      onboarded: true,
      location: { state: "California", zipCode: "90210" },
      ageGroup: "25-44",
      preferredMethod: "in-person"
    } as UserProfile;

    if (!effectiveProfile.onboarded) return null;

    // Simulated election data based on location
    // In a real app, this would fetch from Firestore 'election_rules'
    const baseDate = new Date(2026, 10, 3); // Nov 3, 2026

    const tasks: ElectionTask[] = [
      {
        id: "reg-1",
        title: "Voter Registration",
        description: "Ensure you are registered to vote in your current state.",
        deadline: addDays(baseDate, -30),
        type: "registration",
        status: "active",
        priority: "high",
        actionUrl: "https://vote.gov"
      },
      {
        id: "verify-1",
        title: "Verify Registration",
        description: "Check your voter status and information.",
        deadline: addDays(baseDate, -15),
        type: "verification",
        status: "upcoming",
        priority: "medium"
      },
      {
        id: "early-1",
        title: "Early Voting Period",
        description: "Cast your ballot ahead of time.",
        deadline: addDays(baseDate, -1),
        type: "early-voting",
        status: "upcoming",
        priority: "low"
      },
      {
        id: "election-day",
        title: "Election Day",
        description: "Go to your polling place and vote!",
        deadline: baseDate,
        type: "election-day",
        status: "upcoming",
        priority: "high"
      }
    ];

    // Mark as completed if logic applies (e.g. registration done)
    // For now, let's keep it simple.

    const now = new Date();
    const sortedTasks = tasks.sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
    const nextAction = sortedTasks.find(t => isAfter(t.deadline, now)) || null;

    // Calculate risk
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (nextAction) {
      const daysLeft = differenceInDays(nextAction.deadline, now);
      if (daysLeft < 7) riskLevel = 'high';
      else if (daysLeft < 14) riskLevel = 'medium';
    }

    return {
      tasks: sortedTasks,
      riskLevel,
      nextAction
    };
  };

  useEffect(() => {
    setPlan(generatePlan(profile));
  }, [profile]);

  return (
    <VoterContext.Provider value={{ plan, refreshPlan: () => setPlan(generatePlan(profile)) }}>
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
