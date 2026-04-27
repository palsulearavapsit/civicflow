import { doc, getDoc, setDoc, updateDoc, collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile, UserProfileSchema } from "@/types";
import { SecurityService } from "@/utils/security";


export const UserService = {
  async getProfile(uid: string): Promise<UserProfile | null> {
    if (!db) return null;
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const result = UserProfileSchema.safeParse(data);
      return result.success ? result.data : (data as UserProfile);
    }
    return null;
  },

  async createProfile(profile: UserProfile): Promise<void> {
    if (!db) return;
    const docRef = doc(db, "users", profile.uid);
    await setDoc(docRef, { ...profile, lastUpdated: new Date() });
    await this.logAudit(profile.uid, "PROFILE_CREATED", { email: SecurityService.maskPII(profile.email || '') });
  },


  async updateProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    if (!db) return;
    const docRef = doc(db, "users", uid);
    await updateDoc(docRef, { ...data, lastUpdated: new Date() });
    await this.logAudit(uid, "PROFILE_UPDATED", data);
  },

  async logAIInteraction(uid: string, prompt: string, response: string, metadata: Record<string, unknown> = {}): Promise<void> {

    if (!db) return;
    try {
      const chatLogsRef = collection(db, "ai_interactions");
      await addDoc(chatLogsRef, {
        uid,
        prompt,
        response,
        metadata,
        timestamp: new Date(),
        model: "gemini-2.0-flash",
      });
    } catch (error) {
      console.error("AI Logging failed:", error);
    }
  },

  async logAudit(uid: string, action: string, metadata: Record<string, unknown> = {}): Promise<void> {
    if (!db) return;
    try {
      const auditRef = collection(db, "audit_logs");
      await addDoc(auditRef, {
        uid,
        action,
        metadata,
        timestamp: new Date(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      });
    } catch (error) {
      console.warn("Audit logging failed:", error);
    }
  }
};
