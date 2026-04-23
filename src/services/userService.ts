import { doc, getDoc, setDoc, updateDoc, collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile, UserProfileSchema } from "@/types";

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
    await this.logAudit(profile.uid, "PROFILE_CREATED", { email: profile.email });
  },

  async updateProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    if (!db) return;
    const docRef = doc(db, "users", uid);
    await updateDoc(docRef, { ...data, lastUpdated: new Date() });
    await this.logAudit(uid, "PROFILE_UPDATED", data);
  },

  async logAudit(uid: string, action: string, metadata: any = {}): Promise<void> {
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
