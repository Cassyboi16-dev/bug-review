"use client";
import Link from "next/link"
import Image from 'next/image'
import { useState } from "react";
import { PiUser } from "react-icons/pi";
import { TbMenu } from "react-icons/tb";
import { IoMdClose } from "react-icons/io";
export default function Navbar () {
  const [navOpen, setNavOpen] = useState(false)
const navLinks = [
   {
    label: "Home",
    url: "/home"
  },
  {
    label: "About Us",
    url: "/about"
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
    <main className="flex items-center justify-evenly md:px-10 md:py-4 p-3 bg-gradient-to-r from-slate-900 to-slate-950 shadow-md border-b-2">
      <Link href={"/"} className="flex items-center justify-around gap-2 z-50">
        <Image
          src={"/bug.png"}
          alt="logo"
          width={800}
          height={800}
          className="w-15 h-15 border-2 bg-emerald-400 rounded-4xl shadow-md"       
        />
        <p className="font-bold text-emerald-300 text-2xl italic">BugReview</p>
      </Link>

      {/* Tablet and Desktop Nav */}
      <div className="flex items-center gap-7 ml-auto px-10 max-md:hidden">
        {
          navLinks.map((content, index) => (
            <Link href={"#"} key={index} className="border-0.9 p-5 hover:text-emerald-300 rounded-4xl transition-colors duration-400 text-white font-bold">{content.label}</Link>

          ))
        }
      </div>
       {/* Mobile nav */}
      <div className={`bg-slate-950 h-96 w-full md:hidden absolute top-0 left-0 items-center flex-col pt-10 gap-10 rounded-b-3xl shadow-md text-emerald-400 z-100 ${navOpen ? "flex" : "hidden"}`}> 
        {
          navLinks.map((item, index) => (
            <Link key={index} href={"#"} className="hover:text-emerald-400 transition-colors duration-200">{item.label}</Link>
          ))
        }
      </div>
      <Link className="flex items-center gap-1 hover:border-b hover:border-emerald-400 pb-2 transition-all duration-400 ml-auto" 
      href={"/sign-in/Sign-In.jsx"}><p className="max-md:hidden text-white">Sign In</p><PiUser className="max-md:text-2xl text-lg text-white"/></Link>
      
      <button onClick={() => setNavOpen(!navOpen)} className="text-2xl md:hidden ml-5 z-100">
        {
          navOpen ? <IoMdClose className="text-white hover:text-emerald-400"/> : <TbMenu className="text-white hover:text-emerald-400"/>
        }
        
        
        </button>
    </main>
  )
}