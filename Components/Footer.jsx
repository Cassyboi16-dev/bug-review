import Image from "next/image";
import Link from "next/link";
import { FaXTwitter } from "react-icons/fa6";
export default function Footer(){
  const footerHover =[
    {
      label: "Chat with Us",
      url: "/chat"
    },
    {
      label: "Terms and Conditions",
      url: "/terms"
    },
    {
      label: "Privacy Policy",
      url: "/privacy"
    },
  ]
  return (
    <main className="max-md:py-3">
      <div className="flex items-center justify-center">
        <Image
        src={"/bug.png"}
        alt="bug-review-logo"
        width={1000}
        height={1000}
        className="w-7 h-7 rounded-full"
        />
      </div>
        <p className="text-xl text-black flex justify-center items-center italic">BugReview</p>
      <div className="flex gap-5 items-center justify-center text-black px-2 max-md:flex-col max-md:text-center max-md:py-15">
       {
         footerHover.map((content, index)=>(
          <Link href={"#"} key={index} className="hover:text-emerald-400 hover:underline-offset-auto">{content.label}</Link>

        ))
       }
      </div>
      <div className="flex items-center justify-center gap-5 text-2xl">
        <FaXTwitter />
      </div>
    </main>
  )
}