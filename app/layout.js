import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import Navbar from "@/Components/Navbar";
import Footer from "@/Components/Footer";
import AuthProvider from "@/Components/AuthProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getThemeInitScript } from "@/Components/theme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Bug Review - Fast, Friendly, and Focused Feedback for Your Code",
  description: "A Place to get your Bugs Reviewed Fast",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: getThemeInitScript() }} />
        <AuthProvider>
          <Navbar />
          {children}
          <SpeedInsights />
          <Toaster position="bottom-center" />
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
