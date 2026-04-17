import Image from "next/image";
import Link from "next/link";
import { FaInstagram } from "react-icons/fa";
import { FaDiscord, FaXTwitter } from "react-icons/fa6";
import { IoLogoGithub } from "react-icons/io";

export default function Footer() {
  const footerLinks = [
    { label: "Chat with Us", url: "/chat" },
    { label: "Terms & Conditions", url: "/terms" },
    { label: "Privacy Policy", url: "/privacy" },
  ];

  return (
    <footer className="bg-[#050816] text-white border-t border-white/10 mt-10">

      {/* MAIN CONTAINER */}
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* TOP SECTION */}
        <div className="flex flex-col items-center text-center gap-3">

          <div className="p-2 rounded-full bg-white/5 border border-white/10">
            <Image
              src={"/bug.png"}
              alt="logo"
              width={40}
              height={40}
              className="rounded-full"
            />
          </div>

          <h1 className="text-lg font-semibold tracking-wide">
            BugReview
          </h1>

          <p className="text-xs text-gray-400 max-w-md">
            A community-driven space where developers share bugs, tutorials, and insights.
          </p>
        </div>

        {/* LINKS */}
        <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm">
          {footerLinks.map((item, index) => (
            <Link
              key={index}
              href={item.url}
              className="text-gray-400 hover:text-white transition hover:underline underline-offset-4"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* SOCIALS */}
        <div className="flex items-center justify-center gap-5 mt-8">

          <SocialIcon icon={<FaXTwitter />} />
          <SocialIcon icon={<FaInstagram />} />
          <SocialIcon icon={<FaDiscord />} />
          <SocialIcon icon={<IoLogoGithub />} />

        </div>

        {/* BOTTOM BAR */}
        <div className="mt-10 border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 gap-2">

          <p>© {new Date().getFullYear()} BugReview. All rights reserved.</p>

          <p className="text-gray-600">
            Built for developers • Powered by NextJS & Firebase
          </p>

          <p className="text-gray-600">Email:cassyboi16@proton.me</p>

        </div>

      </div>
    </footer>
  );
}

/* Reusable Social Icon */
function SocialIcon({ icon }) {
  return (
    <div className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-110 transition cursor-pointer">
      <div className="text-lg text-gray-300 hover:text-white transition">
        {icon}
      </div>
    </div>
  );
}