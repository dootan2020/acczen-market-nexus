
import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from '@/components/mode-toggle';
import { useAuth } from '@/contexts/AuthContext';

interface AdminNavbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
}

export const AdminNavbar = ({ 
  searchQuery, 
  setSearchQuery, 
  sidebarOpen, 
  setSidebarOpen 
}: AdminNavbarProps) => {
  const { userDisplayName } = useAuth();
  
  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full border-b shadow-sm">
      <div className="px-4 h-16 flex items-center justify-between">
        {/* Left side - Logo & Brand */}
        <div className="flex items-center">
          {setSidebarOpen && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2 lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          <Link to="/admin" className="flex items-center gap-2 mr-6 lg:mr-8">
            <div className="w-8 h-8 bg-[#19C37D] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold text-[#19C37D] hidden md:inline-block">AccZen.net</span>
          </Link>
        </div>
        
        {/* Center - Search bar */}
        <div className="hidden md:block flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Search in admin..."
              className="pl-8 h-9 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* Right side - Notification, theme toggle and user menu */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#19C37D] text-[10px] font-medium flex items-center justify-center text-white">
              2
            </span>
          </Button>
          
          <ModeToggle />
          
          <div className="flex items-center gap-3 border-l pl-4 ml-2">
            <Avatar className="h-8 w-8 bg-[#19C37D]/10">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback className="text-[#19C37D] font-medium">
                {userDisplayName?.slice(0, 2) || 'AD'}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <p className="text-sm font-medium">Admin: {userDisplayName || 'Administrator'}</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
