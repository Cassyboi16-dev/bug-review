import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import {
  DEFAULT_USER_STATS,
  getInitialUserProfile,
  getUnlockedAchievementKeys,
} from "@/lib/achievements";

function getFirebaseApp() {
  if (getApps().length > 0) return getApps()[0];

  const projectId = process.env.AUTH_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.AUTH_FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.AUTH_FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase Admin credentials are not configured");
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
  });
}

export function getAdminDb() {
  return getFirestore(getFirebaseApp());
}

export const adminDb = {
  collection(...args) {
    return getAdminDb().collection(...args);
  },
};

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

  const discordUsername =
    account?.provider === "discord"
      ? profile?.global_name ||
        profile?.username ||
        user.name ||
        existing.discordUsername ||
        ""
      : existing.discordUsername || "";

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
    discordUsername,
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

export async function registerCredentialUser({
  email,
  passwordHash,
  passwordSalt,
  passwordAlgorithm,
  name,
}) {
  const ref = getUserProfileRef(email);
  const snapshot = await ref.get();
  if (snapshot.exists) {
    throw new Error("User already exists");
  }

  const baseProfile = getInitialUserProfile();
  const profile = {
    ...baseProfile,
    email,
    name: name || "",
    username: email.split("@")[0],
    image: "",
    linkedProviders: ["credentials"],
    credentialPasswordHash: passwordHash,
    credentialPasswordSalt: passwordSalt,
    credentialPasswordAlgorithm: passwordAlgorithm,
    stats: { ...DEFAULT_USER_STATS, ...baseProfile.stats },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await ref.set(profile, { merge: true });
  return { id: ref.id, ...profile };
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
