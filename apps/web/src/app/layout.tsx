import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "../styles/globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "InfraSentinel AI — Infrastructure Failure Prediction & Anomaly Intelligence",
  description: "Predict Failures. Prevent Disruptions. Protect Infrastructure. AI-powered condition monitoring, calibrated failure risk estimation, and automated incident response.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={outfit.variable}>
      <body className="bg-white text-black min-h-screen selection:bg-[#76FB91] selection:text-black font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
