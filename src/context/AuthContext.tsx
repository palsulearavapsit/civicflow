"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { UserService } from "@/services/userService";
import { UserProfile } from "@/types";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If no auth is available, we are in demo mode
    if (!auth) {
      setLoading(false);
      return;
    }

    // Safety timeout
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 2000);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        clearTimeout(timeout);
        setUser(user);
        if (user) {
          const profileData = await UserService.getProfile(user.uid);
          setProfile(profileData);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.warn("Auth background process failed:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const signInWithGoogle = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const existingProfile = await UserService.getProfile(user.uid);
      
      if (!existingProfile) {
        const newProfile: UserProfile = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          onboarded: false,
          location: { state: "", zipCode: "00000" },
          ageGroup: '25-44',
          isFirstTimeVoter: false,
          preferredMethod: 'in-person',
          language: 'en',
          accessibilityNeeds: [],
          lastUpdated: new Date()
        };
        await UserService.createProfile(newProfile);
        setProfile(newProfile);
      } else {
        setProfile(existingProfile);
      }
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  const logOut = async () => {
    if (auth) await signOut(auth);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    await UserService.updateProfile(user.uid, data);
    setProfile(prev => prev ? { ...prev, ...data } : null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, logOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
