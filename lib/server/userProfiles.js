import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import {
  DEFAULT_USER_STATS,
  getInitialUserProfile,
  getUnlockedAchievementKeys,
} from "@/lib/achievements";

const firebaseApp =
  getApps().length === 0
    ? initializeApp({
        credential: cert({
          projectId: process.env.AUTH_FIREBASE_PROJECT_ID,
          clientEmail: process.env.AUTH_FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.AUTH_FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      })
    : getApps()[0];

export const adminDb = getFirestore(firebaseApp);

export function getUserProfileId(email = "") {
  return encodeURIComponent(email.trim().toLowerCase());
}

export function getUserProfileRef(email) {
  return adminDb.collection("users").doc(getUserProfileId(email));
}

export async function getUserProfileByEmail(email) {
  if (!email) return null;
  const snapshot = await getUserProfileRef(email).get();
  if (!snapshot.exists) return null;
  return { id: snapshot.id, ...snapshot.data() };
}

export async function getUserProfileById(profileId) {
  if (!profileId) return null;
  const snapshot = await adminDb.collection("users").doc(profileId).get();
  if (!snapshot.exists) return null;
  return { id: snapshot.id, ...snapshot.data() };
}

export async function upsertUserProfileFromAuth({ user, account, profile }) {
  if (!user?.email) return null;

  const ref = getUserProfileRef(user.email);
  const snapshot = await ref.get();
  const existing = snapshot.exists
    ? snapshot.data()
    : getInitialUserProfile();

  const linkedProviders = Array.from(
    new Set([...(existing.linkedProviders || []), account?.provider].filter(Boolean)),
  );

  const githubProfileUrl =
    account?.provider === "github"
      ? profile?.html_url || existing.githubProfileUrl || ""
      : existing.githubProfileUrl || "";

  const githubUsername =
    account?.provider === "github"
      ? profile?.login || existing.githubUsername || ""
      : existing.githubUsername || "";

  const nextProfile = {
    ...existing,
    name: user.name || existing.name || "",
    email: user.email,
    image: user.image || existing.image || "",
    username:
      existing.username ||
      user.username ||
      user.name ||
      user.email.split("@")[0],
    linkedProviders,
    githubProfileUrl,
    githubUsername,
    lastSignedInProvider: account?.provider || existing.lastSignedInProvider || "",
    stats: { ...DEFAULT_USER_STATS, ...(existing.stats || {}) },
    achievements:
      existing.achievements || getUnlockedAchievementKeys(existing.stats || {}),
    updatedAt: new Date().toISOString(),
    createdAt: existing.createdAt || new Date().toISOString(),
  };

  await ref.set(nextProfile, { merge: true });
  return { id: ref.id, ...nextProfile };
}

export async function updateUserProfile(email, updates) {
  const ref = getUserProfileRef(email);
  await ref.set({ ...updates, updatedAt: new Date().toISOString() }, { merge: true });
  const snapshot = await ref.get();
  return { id: snapshot.id, ...snapshot.data() };
}

export async function unlinkGithubProfile(email) {
  const current = await getUserProfileByEmail(email);
  if (!current) return null;

  const linkedProviders = (current.linkedProviders || []).filter(
    (provider) => provider !== "github",
  );

  return updateUserProfile(email, {
    linkedProviders,
    githubProfileUrl: "",
    githubUsername: "",
  });
}
