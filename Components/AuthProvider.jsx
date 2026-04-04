"use client";
import { SessionProvider } from "next-auth/react";

export default function AuthProvider({ children }) {
  return (
    <main>
      <SessionProvider>{children}</SessionProvider>
    </main>
  );
}
