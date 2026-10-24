import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "InfraSentinel AI — Enterprise Predictive Maintenance & Anomaly Detection",
  description: "Predict Failures. Prevent Disruptions. Protect Infrastructure. Real-time telemetry monitoring, calibrated failure risk estimation, and automated incident response.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#060B16] text-[#F8FAFC] min-h-screen selection:bg-blue-500/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
