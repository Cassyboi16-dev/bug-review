import Image from "next/image";
import Link from "next/link";
import { FaDiscord, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { IoLogoGithub } from "react-icons/io";

const footerLinks = [
  { label: "Explore", url: "/explore" },
  { label: "Blog", url: "/blog" },
  { label: "Terms", url: "/terms" },
  { label: "Privacy", url: "/privacy" },
];

const socialLinks = [
  { label: "X", icon: <FaXTwitter />, href: "https://x.com/BugReviewHQ" },
  { label: "Instagram", icon: <FaInstagram />, href: "https://instagram.com/bugreview" },
  { label: "Discord", icon: <FaDiscord />, href: "https://discord.gg/V3XURyxCU" },
  {
    label: "GitHub",
    icon: <IoLogoGithub />,
    href: "https://github.com/Cassyboi16-dev/bug-review",
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border/80 bg-surface/70 backdrop-blur-xl">
      <div className="page-shell py-10">
        <div className="section-shell grid gap-8 px-6 py-8 md:grid-cols-[1.2fr_0.8fr_0.9fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-border bg-background/60 p-2">
                <Image
                  src="/bug.png"
                  alt="BugReview"
                  width={36}
                  height={36}
                  className="rounded-xl"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">BugReview</p>
                <p className="text-xs text-text-muted">
                  Faster debugging, cleaner collaboration.
                </p>
              </div>
            </div>
            <p className="max-w-md text-sm leading-7 text-text-muted">
              A focused developer workspace for bug reports, verified authors,
              practical solutions, and technical writing that feels useful on a busy day.
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
              Product
            </p>
            <div className="flex flex-col gap-3 text-sm">
              {footerLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.url}
                  className="text-text-muted transition hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
              Community
            </p>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.label}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-background/60 text-text-muted transition hover:border-primary-500/40 hover:text-foreground"
                >
                  <span className="text-lg">{item.icon}</span>
                </a>
              ))}
            </div>
            <p className="text-sm text-text-muted">cassyboi16@proton.me</p>
          </div>
        </div>

<<<<<<< HEAD
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
          <SocialIcon icon={<FaXTwitter />} src="https://x.com/BugReviewHQ" />
          <SocialIcon icon={<FaInstagram />} src="https://instagram.com/bugreview" />
          <SocialIcon icon={<FaDiscord />} src="https://discord.gg/V3XURyxCU" />
          <SocialIcon icon={<IoLogoGithub />} src="https://github.com/Cassyboi16-dev/bug-review" />
        </div>

        {/* BOTTOM BAR */}
        <div className="mt-10 border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-text-muted gap-2">
=======
        <div className="mt-4 flex flex-col gap-2 px-2 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between">
>>>>>>> e3acc8e32ed37679f00cf4155b98d2b2861f8616
          <p>© {new Date().getFullYear()} BugReview. All rights reserved.</p>
          <p>Built with Next.js, Firebase, and a healthy respect for production sleep.</p>
        </div>
      </div>
    </footer>
  );
}
<<<<<<< HEAD

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

=======
>>>>>>> e3acc8e32ed37679f00cf4155b98d2b2861f8616
