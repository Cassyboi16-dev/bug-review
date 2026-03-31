import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa6";
import { FaDiscord } from "react-icons/fa";
import { signIn } from "@/auth";
export default function SignIn() {
  return (
    
    <main className="bg-[#0f172a] text-white min-h-dvh flex flex-col justify-center items-center gap-6">
      <section className="flex flex-col gap-4 items-center p-3">
        <h1 className="text-4xl md:text-6xl font-black mb-6">Welcome</h1>
      <p className="mb-8 text-white/80 max-md:text-center">Sign up to start sharing and solving bugs with the community.</p>  
      
      <form className="flex flex-col gap-4 w-full max-w-md">
        <label htmlFor="name">Full Name</label>
        <input type="text" placeholder="Full Name" className="flex flex-col border rounded-xl p-3"/>
        <label htmlFor="Gender">Gender</label>
        <select name="Gender" id="Gender" className="flex flex-col border rounded-xl p-3 accent-emerald-400">
          <option value="male" className="bg-slate-900">Male</option>
          <option value="female" className="bg-slate-900">Female</option>
          <option value="other" className="bg-slate-900">Prefer Not to Say</option>
        </select>
        <label htmlFor="email">Email</label>
        <input type="text" placeholder="example@gmail.com" className="flex flex-col border rounded-xl p-3"/>
        <label htmlFor="password">Password</label>
        <input type="password" placeholder="Input your password" className="flex flex-col border rounded-xl p-3"/>


        <button
          type="submit"
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl transition hover:scale-105 text-2xl text-center"
        >
          Sign In
        </button>
      </form>
      <div className="text-center text-white/80 mt-4 font-sans">
      <div>Continue With</div>
      </div>
      <div className="w-full flex items-center justify-center gap-5">
            <form
            action={async () => {
              "use server";
              await signIn("google");
            }}
          >
            <button className="border p-6 text-3xl rounded-full hover:border-emerald-400 cursor-pointer">
            <FcGoogle />
          </button>
          </form>
          <form
            action={async () => {
              "use server";
              await signIn("github");
            }}
          >
            <button className="border p-6 text-3xl rounded-full hover:border-emerald-400 cursor-pointer">
              <FaGithub />
            </button>
          </form>
          <form
            action={async () => {
              "use server";
              await signIn("discord");
            }}
          >
            <button className="border p-6 text-3xl rounded-full hover:border-emerald-400 cursor-pointer">
              <FaDiscord />
            </button>
          </form>
        </div>
      </section>
      
    </main>
  )
}
    