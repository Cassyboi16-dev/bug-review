import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

export default async function Profile() {
  const session = await auth();

  if (!session) {
    redirect("/signin");
  }

  return (
    <main className="min-h-dvh bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617] text-white flex items-center justify-center px-4 py-10">
      
      <div className="w-full max-w-4xl flex flex-col gap-10">

        {/* HEADER */}
        <h1 className="text-center font-extrabold text-4xl md:text-6xl uppercase text-emerald-400 tracking-widest">
          {"<Profile />"}
        </h1>

        {/* CARD CONTAINER */}
        <section className="grid md:grid-cols-2 gap-8">

          {/* PROFILE CARD */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-4 shadow-lg">

            <img
              src={session?.user?.image || "/default-avatar.png"}
              alt={session?.user?.name || "User"}
              className="w-24 h-24 rounded-full border-2 border-emerald-400 shadow-md"
            />

            <div className="text-center space-y-1">
              <p className="text-lg font-semibold text-emerald-300">
                {session?.user?.name}
              </p>
              <p className="text-sm text-gray-400">
                {session?.user?.email}
              </p>
            </div>

            {/* SIGN OUT */}
            <form
              action={async () => {
                "use server";
                await signOut({ callbackUrl: "/signin" });
              }}
              className="w-full mt-4"
            >
              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition duration-300"
              >
                Sign Out
              </button>
            </form>
          </div>

          {/* UPDATE PROFILE CARD */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-lg flex flex-col gap-6">

            <h2 className="text-xl font-semibold text-emerald-300">
              Update Profile
            </h2>

            <div className="flex flex-col gap-4">

              {/* NAME */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400">Name</label>
                <input
                  type="text"
                  defaultValue={session.user?.name || ""}
                  className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-400 transition"
                />
              </div>

              {/* EMAIL */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400">Email</label>
                <input
                  type="email"
                  defaultValue={session.user?.email || ""}
                  className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-400 transition"
                />
              </div>
            </div>

            {/* SAVE BUTTON */}
            <button className="mt-auto py-2 rounded-lg bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition duration-300">
              Save Changes
            </button>
          </div>

        </section>

        {/* FOOTER FUN */}
        <p className="text-center text-xs text-gray-500 font-mono">
          {"User Signed In: "} {session.user?.name || "Unknown User"}
        </p>

      </div>
    </main>
  );
}