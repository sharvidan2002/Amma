import React from 'react';
import { Menu, Bell, Search, User } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useUIStore } from '../../store/uiStore';
import { useEmployeeStore } from '../../store/employeeStore';
import { APP_CONFIG } from '../../lib/constants';

const Header: React.FC = () => {
  const { toggleSidebar, notifications } = useUIStore();
  const { searchTerm, setSearchTerm } = useEmployeeStore();

  const unreadNotifications = notifications.filter(n => n.type === 'warning' || n.type === 'error').length;

  return (
    <header className="h-16 bg-white border-b border-pearl-200 flex items-center justify-between px-6 shadow-sm">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="hover:bg-pearl-100"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-semibold text-slate-custom-800">
            {APP_CONFIG.name}
          </h1>
          <span className="text-xs bg-crimson-100 text-crimson-700 px-2 py-1 rounded-full">
            v{APP_CONFIG.version}
          </span>
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-custom-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-2">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-pearl-100"
        >
          <Bell className="h-5 w-5" />
          {unreadNotifications > 0 && (
            <span className="absolute -top-1 -right-1 bg-crimson-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadNotifications}
            </span>
          )}
        </Button>

        {/* User Profile */}
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-pearl-100"
        >
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

export default Header;