
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Wallet, HelpCircle } from "lucide-react";
import { Link } from 'react-router-dom';

export function QuickActions() {
  return (
    <Card className="shadow-sm border-primary/10 transition-all duration-300 hover:shadow-md">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Commonly used actions and shortcuts</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Link to="/deposit" className="flex-1">
          <Button variant="outline" className="w-full transition-all hover:border-chatgpt-primary">
            <Wallet className="mr-2 h-4 w-4" />
            Deposit
          </Button>
        </Link>
        
        <Link to="/products" className="flex-1">
          <Button variant="outline" className="w-full transition-all hover:border-chatgpt-primary">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Browse Products
          </Button>
        </Link>
        
        <Link to="/help" className="flex-1">
          <Button variant="outline" className="w-full transition-all hover:border-chatgpt-primary">
            <HelpCircle className="mr-2 h-4 w-4" />
            Get Support
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
