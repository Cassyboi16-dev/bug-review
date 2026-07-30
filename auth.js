import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Github from "next-auth/providers/github";
import Discord from "next-auth/providers/discord";
import {
  getUserProfileByEmail,
  getUserProfileById,
  upsertUserProfileFromAuth,
} from "@/lib/server/userProfiles";

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
  callbacks: {
    async signIn({ user, account, profile }) {
      await upsertUserProfileFromAuth({ user, account, profile });
      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      if (trigger === "update" && session?.username) {
        token.username = session.username;
      }

      if (session?.githubProfileUrl !== undefined) {
        token.githubProfileUrl = session.githubProfileUrl;
      }

      const email = (user?.email || token.email || "").toLowerCase();
      if (!email) return token;

      const profileDoc = await getUserProfileByEmail(email);
      if (profileDoc) {
        token.profileId = profileDoc.id;
        token.username = profileDoc.username || token.username || user?.name || "";
        token.linkedProviders = profileDoc.linkedProviders || [];
        token.githubProfileUrl = profileDoc.githubProfileUrl || "";
        token.githubUsername = profileDoc.githubUsername || "";
        token.discordUsername = profileDoc.discordUsername || "";
        token.achievements = profileDoc.achievements || [];
        token.userStats = profileDoc.stats || {};
        token.blogVerificationStatus =
          profileDoc.blogVerificationStatus || "unverified";
        token.verifiedForBlogging = Boolean(profileDoc.verifiedForBlogging);
        token.bloggerBadge = Boolean(profileDoc.bloggerBadge);
        token.emailVerifiedForBlogging = Boolean(
          profileDoc.emailVerifiedForBlogging,
        );
        token.phoneVerifiedForBlogging = Boolean(
          profileDoc.phoneVerifiedForBlogging,
        );
        token.verificationEmail = profileDoc.verificationEmail || "";
        token.verificationPhone = profileDoc.verificationPhone || "";
      }

      if (account?.provider) {
        token.activeProvider = account.provider;
      }

      return token;
    },
    async session({ session, token }) {
      if (!session.user) return session;

      const profileDoc =
        (token.profileId && (await getUserProfileById(token.profileId))) || null;

      session.user.id = token.profileId || token.sub || "";
      session.user.profileId = token.profileId || token.sub || "";
      session.user.username =
        profileDoc?.username || token.username || session.user.name || "";
      session.user.linkedProviders =
        profileDoc?.linkedProviders || token.linkedProviders || [];
      session.user.githubProfileUrl =
        profileDoc?.githubProfileUrl || token.githubProfileUrl || "";
      session.user.githubUsername =
        profileDoc?.githubUsername || token.githubUsername || "";
      session.user.discordUsername =
        profileDoc?.discordUsername || token.discordUsername || "";
      session.user.achievements =
        profileDoc?.achievements || token.achievements || [];
      session.user.userStats = profileDoc?.stats || token.userStats || {};
      session.user.blogVerificationStatus =
        profileDoc?.blogVerificationStatus ||
        token.blogVerificationStatus ||
        "unverified";
      session.user.verifiedForBlogging = Boolean(
        profileDoc?.verifiedForBlogging ?? token.verifiedForBlogging,
      );
      session.user.bloggerBadge = Boolean(
        profileDoc?.bloggerBadge ?? token.bloggerBadge,
      );
      session.user.emailVerifiedForBlogging = Boolean(
        profileDoc?.emailVerifiedForBlogging ?? token.emailVerifiedForBlogging,
      );
      session.user.phoneVerifiedForBlogging = Boolean(
        profileDoc?.phoneVerifiedForBlogging ?? token.phoneVerifiedForBlogging,
      );
      session.user.verificationEmail =
        profileDoc.verificationEmail || token.verificationEmail || "";
      session.user.verificationPhone =
        profileDoc.verificationPhone || token.verificationPhone || "";
      session.user.activeProvider = token.activeProvider || "";

      return session;
    },
  },
});
