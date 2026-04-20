import React from "react";
import Header from "./Header";
import BottomNav from "./BottomNav";
import BetSlipPanel from "@/components/BetSlipPanel";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">{children}</main>
        <BetSlipPanel />
      </div>
      <BottomNav />
    </div>
  );
};

export default Layout;
