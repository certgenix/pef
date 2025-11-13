import { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {children}
      </main>
      <Footer />
    </div>
  );
}
