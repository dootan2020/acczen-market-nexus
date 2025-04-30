
import React from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { Link } from 'react-router-dom';
import { useCurrencyContext } from "@/contexts/CurrencyContext";

export function DashboardWelcome() {
  const { user } = useAuth();
  const { formatUSD } = useCurrencyContext();
  
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
      <div className="space-y-1 animate-fade-in">
        <h2 className="text-3xl font-medium leading-none">
          Welcome back, <span className="font-semibold">{user?.username || user?.email?.split('@')[0] || 'User'}</span>
        </h2>
        <p className="text-muted-foreground">
          Here's a summary of your account activity
        </p>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg animate-fade-in">
          <p className="text-sm text-muted-foreground">Available balance</p>
          <p className="text-2xl font-semibold text-chatgpt-primary">{formatUSD(user?.balance || 0)}</p>
        </div>
        
        <Link to="/deposit">
          <Button className="bg-chatgpt-primary hover:bg-chatgpt-primary/90 text-white transition-all duration-300 animate-slide-in">
            <Wallet className="mr-2 h-4 w-4" />
            Deposit
          </Button>
        </Link>
      </div>
    </div>
  );
}
