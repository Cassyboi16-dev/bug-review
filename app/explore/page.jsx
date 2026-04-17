import Explore from "./explore";
import { redirect } from "next/navigation";
import { auth } from "@/auth"; // only if YOU created this file

export default async function ExploreClient() {
  const session = await auth();

  if (!session) {
    redirect("/signin");
  }

  return (
    <main className="min-h-dvh bg-slate-950">
      <Explore session={session} />
    </main>
  );
}