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
    <footer className="bg-surface text-foreground border-t border-border mt-10">
      {/* MAIN CONTAINER */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* TOP SECTION */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="p-2 rounded-full bg-surface-muted border border-border">
            <Image
              src={"/bug.png"}
              alt="logo"
              width={40}
              height={40}
              className="rounded-full"
            />
          </div>

          <h1 className="text-lg font-semibold tracking-wide">BugReview</h1>

          <p className="text-xs text-text-muted max-w-md">
            A community-driven space where developers share bugs, tutorials, and
            insights.
          </p>
        </div>

        {/* LINKS */}
        <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm">
          {footerLinks.map((item, index) => (
            <Link
              key={index}
              href={item.url}
              className="text-text-muted hover:text-foreground transition hover:underline underline-offset-4"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* SOCIALS */}
        <div className="flex items-center justify-center gap-5 mt-8">
<<<<<<< HEAD
          <SocialIcon icon={<FaXTwitter />} src="https://x.com/BugReviewHQ" />
          <SocialIcon icon={<FaInstagram />} src="https://instagram.com/bugreview" />
          <SocialIcon icon={<FaDiscord />} src="https://discord.gg/bugreview" />
          <SocialIcon icon={<IoLogoGithub />} src="https://github.com/bugreview" />
=======
          <SocialIcon icon={<FaXTwitter />} href="https://x.com/BugReviewHQ" />
          <SocialIcon icon={<FaInstagram />} href="https://instagram.com/bugreview" />
          <SocialIcon icon={<FaDiscord />} href="https://discord.gg/V3XURyxCU" />
          <SocialIcon icon={<IoLogoGithub />} href="https://github.com/Cassyboi16-dev/bug-review" />
>>>>>>> 6926824aeff9d149b974e2223332d6df8b9a2d18
        </div>

        {/* BOTTOM BAR */}
        <div className="mt-10 border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-text-muted gap-2">
          <p>© {new Date().getFullYear()} BugReview. All rights reserved.</p>

          <p className="text-slate-600 dark:text-gray-400">
            Built for developers • Powered by NextJS & Firebase
          </p>

          <p className="text-text-muted">Email : cassyboi16@proton.me</p>
        </div>
      </div>
    </footer>
  );
}

/* Reusable Social Icon */
function SocialIcon({ icon, src }) {
  return (
    <a href={src} target="_blank" rel="noopener noreferrer">
      <div className="p-2 rounded-full bg-surface-muted border border-border hover:bg-background hover:scale-110 transition cursor-pointer">
        <div className="text-lg text-text-muted hover:text-foreground transition">
          {icon}
        </div>
      </div>
    </a>
  );
}

