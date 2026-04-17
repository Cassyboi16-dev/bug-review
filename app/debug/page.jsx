import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DebugClient from "./debug";

export default async function DebugPage() {
  const session = await auth();

  if (!session) {
    redirect("/signin");
  }

  return <DebugClient />;
}
