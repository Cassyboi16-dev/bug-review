import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Github from "next-auth/providers/github";
import Discord from "next-auth/providers/discord";

import { FirestoreAdapter } from "@auth/firebase-adapter";

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Firebase Admin Init
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

const db = getFirestore(firebaseApp);

// Username generator
const generateDefaultUsername = () => {
  const randomNum = Math.floor(Math.random() * 9999) + 1;
  return `bugger${randomNum}`;
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Github({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Discord({
      clientId: process.env.AUTH_DISCORD_ID,
      clientSecret: process.env.AUTH_DISCORD_SECRET,
    }),
  ],

  // adapter: FirestoreAdapter(db),

  // secret: process.env.AUTH_SECRET,

  // // ⚠️ optional
  // // allowDangerousEmailAccountLinking: true,

  // events: {
  //   async createUser({ user }) {
  //     if (!user.username) {
  //       user.username = generateDefaultUsername();
  //     }
  //   },
  // },

  // callbacks: {
  //   async session({ session, user }) {
  //     if (session.user) {
  //       session.user.id = user.id;
  //       session.user.username = user.username;
  //     }
  //     return session;
  //   },
  // },
});