import { auth } from "@/auth";
import { db } from "@/config/firebase.config";
import { doc, updateDoc } from "firebase/firestore";

export async function POST(req) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username } = await req.json();

    if (!username || !username.trim()) {
      return Response.json({ error: "Username is required" }, { status: 400 });
    }

    // Check username length
    if (username.length < 3 || username.length > 30) {
      return Response.json(
        { error: "Username must be between 3 and 30 characters" },
        { status: 400 },
      );
    }

    // Update user profile in database
    const userRef = doc(db, "users", session.user.id);
    await updateDoc(userRef, { username: username.trim() });

    return Response.json({ success: true, username: username.trim() });
  } catch (error) {
    console.error("Error updating username:", error);
    return Response.json(
      { error: "Failed to update username" },
      { status: 500 },
    );
  }
}
