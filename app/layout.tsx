import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: "Havli — Find Your People. Find Your Plans.",
  description:
    "Discover affordable parties, meetups and social experiences around Delhi NCR. Gurgaon, Noida, Delhi, Greater Noida, Ghaziabad, Faridabad.",
  keywords: ["events Delhi NCR", "Gurgaon parties", "Noida meetups", "social events Delhi", "affordable events"],
  openGraph: {
    title: "Havli — Find Your People. Find Your Plans.",
    description: "Discover affordable parties, meetups and social experiences around Delhi NCR.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
