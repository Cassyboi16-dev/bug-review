import UploadClient from "./upload"
import { auth } from "@/auth";
import { redirect } from "next/navigation";
export default async function Upload() {
  const session = await auth();
  if (!session) {
    redirect("/signin");
  }
  return (
    <div>
      <UploadClient session={session} />
    </div>
  )
}