"use client";
import Link from "next/link"
import Image from 'next/image'
export default function Navbar () {
const navLinks = [
   {
    label: "Home",
    url: "/"
  },
  {
    label: "About Us",
    url: "/about"
  },
  {
    label: "Contacts",
    url: "/contacts"
  },
  {
    label: "Explore",
    url: "/expore"
  },
  {
    label: "Notifications",
    url: "/notifications"
  },
  {
    label: "Code Reviews",
    url: "/code-reviews"
  },
]
 

  return (
    <main className="flex items-center justify-evenly md:px-10 md:py-4 p-3 bg-gradient-to-r from-sky-950 to-emerald-300 shadow-md">
      <Link href={"/"} className="flex items-center justify-around gap-2">
        <Image
          src={"/bug.png"}
          alt="logo"
          width={800}
          height={800}
          className="w-10 h-10"       
        />
        <p className="font-bold text-emerald-300 text-2xl">BugReview</p>
      </Link>
      <div className="flex items-center gap-7">
        {
          navLinks.map((content) => (
            <Link href={"#"} className="border-0.9 p-5 hover:bg-sky-950 hover:text-taupe-50 rounded-4xl transition-colors duration-400">{content.label}</Link>

          ))
        }
      </div>
    </main>
  )
}