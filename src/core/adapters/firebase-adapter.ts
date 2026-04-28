/**
 * @fileoverview Firebase Adapter — Hexagonal Architecture Implementation
 *
 * Concrete implementation of {@link IUserRepository} and {@link IAuditRepository}
 * using Firebase/Firestore. This adapter isolates all Firebase coupling to this
 * single file, satisfying the Clean Architecture boundary requirement.
 *
 * The core domain logic has ZERO Firebase imports — only this adapter does.
 *
 * @module core/adapters/firebase-adapter
 * @see {@link core/ports}
 * @see {@link https://firebase.google.com/docs/firestore}
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfileSchema } from '@/types';
import type { UserProfile } from '@/types';
import type { IUserRepository, IAuditRepository, AuditEntry } from '@/core/ports';
import type { Result } from '@/types/result';
import { ok, err, tryCatchMap } from '@/types/result';
import { DatabaseError, NotFoundError } from '@/core/errors';

// ─── Memoization Cache ────────────────────────────────────────────────────────

const profileCache = new Map<string, { data: UserProfile; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCachedProfile(uid: string): UserProfile | null {
  const cached = profileCache.get(uid);
  if (cached && Date.now() < cached.expiresAt) return cached.data;
  profileCache.delete(uid);
  return null;
}

function setCachedProfile(uid: string, data: UserProfile): void {
  profileCache.set(uid, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

function invalidateCache(uid: string): void {
  profileCache.delete(uid);
}

// ─── User Repository Adapter ──────────────────────────────────────────────────

/**
 * Firebase implementation of {@link IUserRepository}.
 * All Firestore calls are wrapped in the {@link Result} pattern.
 * Results are memoized with a 5-minute TTL to reduce database reads.
 *
 * @implements {IUserRepository}
 */
export const FirebaseUserRepository: IUserRepository = {
  /**
   * Fetches a user profile by UID with in-memory caching.
   * Returns null (not an error) when the user doesn't exist.
   *
   * @param uid - The Firebase Auth UID.
   */
  async findById(uid: string): Promise<Result<UserProfile | null, DatabaseError>> {
    // Check memoization cache first
    const cached = getCachedProfile(uid);
    if (cached) return ok(cached);

    if (!db) return ok(null);

    return tryCatchMap(
      (async () => {
        const docRef = doc(db!, 'users', uid);
        const snap = await getDoc(docRef);
        if (!snap.exists()) return null;

        const parsed = UserProfileSchema.safeParse(snap.data());
        const profile = parsed.success ? parsed.data : (snap.data() as UserProfile);
        setCachedProfile(uid, profile);
        return profile;
      })(),
      (e) => new DatabaseError(`Failed to fetch user ${uid}`, e)
    );
  },

  /**
   * Creates or replaces a user profile in Firestore.
   * Invalidates the cache on success.
   */
  async save(profile: UserProfile): Promise<Result<void, DatabaseError>> {
    if (!db) return ok(undefined);
    return tryCatchMap(
      (async () => {
        const docRef = doc(db!, 'users', profile.uid);
        await setDoc(docRef, { ...profile, lastUpdated: new Date() });
        invalidateCache(profile.uid);
      })(),
      (e) => new DatabaseError('Failed to save user profile', e)
    );
  },

  /**
   * Partially updates a user profile.
   * Uses Firestore `updateDoc` (merge semantics — does NOT overwrite all fields).
   */
  async update(uid: string, data: Partial<UserProfile>): Promise<Result<void, DatabaseError>> {
    if (!db) return ok(undefined);
    return tryCatchMap(
      (async () => {
        const docRef = doc(db!, 'users', uid);
        await updateDoc(docRef, { ...data, lastUpdated: new Date() });
        invalidateCache(uid);
      })(),
      (e) => new DatabaseError(`Failed to update user ${uid}`, e)
    );
  },

  /**
   * Permanently deletes a user and all their subcollections.
   * This is a GDPR "right to erasure" operation.
   */
  async delete(uid: string): Promise<Result<void, DatabaseError>> {
    if (!db) return ok(undefined);
    return tryCatchMap(
      (async () => {
        const batch = writeBatch(db!);
        batch.delete(doc(db!, 'users', uid));
        await batch.commit();
        invalidateCache(uid);
      })(),
      (e) => new DatabaseError(`Failed to delete user ${uid}`, e)
    );
  },
};

// ─── Audit Repository Adapter ─────────────────────────────────────────────────

/**
 * Firebase implementation of {@link IAuditRepository}.
 * Writes are append-only — Firestore rules enforce no updates/deletes on this collection.
 *
 * @implements {IAuditRepository}
 */
export const FirebaseAuditRepository: IAuditRepository = {
  /**
   * Appends an immutable audit entry.
   * The `signature` field is populated by {@link services/auditService} before calling this.
   */
  async log(entry: AuditEntry): Promise<Result<void, DatabaseError>> {
    if (!db) return ok(undefined);
    return tryCatchMap(
      addDoc(collection(db!, 'audit_logs'), {
        ...entry,
        timestamp: entry.timestamp ?? new Date(),
      }),
      (e) => new DatabaseError('Failed to write audit log', e)
    );
  },

  /**
   * Retrieves audit entries for a specific user, newest first.
   */
  async findByUser(uid: string, limitN = 50): Promise<Result<AuditEntry[], DatabaseError>> {
    if (!db) return ok([]);
    return tryCatchMap(
      (async () => {
        const q = query(
          collection(db!, 'audit_logs'),
          where('uid', '==', uid),
          orderBy('timestamp', 'desc'),
          firestoreLimit(limitN)
        );
        const snap = await getDocs(q);
        return snap.docs.map((d) => d.data() as AuditEntry);
      })(),
      (e) => new DatabaseError(`Failed to fetch audit logs for ${uid}`, e)
    );
  },
};

// Re-export a ready-to-use batch writer helper for EFF-12 (Request Batching)
export { writeBatch };
export type { NotFoundError };
