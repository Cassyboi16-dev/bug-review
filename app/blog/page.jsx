import { auth } from "@/auth";
import { redirect } from "next/navigation";
import BlogWorkspace from "./blog";

export default async function BlogPage() {
  const session = await auth();

  if (!session) {
    redirect("/signin");
  }

  return <BlogWorkspace session={session} />;
}
