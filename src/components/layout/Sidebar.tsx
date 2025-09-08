import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Calendar,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '../ui/button';
import { useUIStore } from '../../store/uiStore';
import { cn } from '../../lib/utils';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  active?: boolean;
}

const sidebarItems: SidebarItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
    path: '/'
  },
  {
    id: 'employees',
    label: 'Employees',
    icon: <Users className="h-5 w-5" />,
    path: '/employees'
  },
  {
    id: 'add-employee',
    label: 'Add Employee',
    icon: <UserPlus className="h-5 w-5" />,
    path: '/add-employee'
  },
  {
    id: 'attendance',
    label: 'Attendance',
    icon: <Calendar className="h-5 w-5" />,
    path: '/attendance'
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: <FileText className="h-5 w-5" />,
    path: '/reports'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings className="h-5 w-5" />,
    path: '/settings'
  }
];

const Sidebar: React.FC = () => {
  const { sidebarCollapsed, setSidebarCollapsed, currentPage, setCurrentPage } = useUIStore();

  const handleItemClick = (item: SidebarItem) => {
    setCurrentPage(item.id);
    // Here you would typically navigate using React Router
    // navigate(item.path);
  };

  return (
    <aside className={cn(
      "bg-white border-r border-pearl-200 transition-all duration-300 ease-in-out flex flex-col shadow-sm",
      sidebarCollapsed ? "w-20" : "w-64"
    )}>
      {/* Header */}
      <div className={cn(
        "h-16 border-b border-pearl-200 flex items-center justify-between px-4",
        sidebarCollapsed && "justify-center"
      )}>
        {!sidebarCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-crimson-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="font-semibold text-slate-custom-800">EMS</span>
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hover:bg-pearl-100"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleItemClick(item)}
            className={cn(
              "sidebar-item w-full",
              currentPage === item.id && "active",
              sidebarCollapsed && "justify-center px-2"
            )}
            title={sidebarCollapsed ? item.label : undefined}
          >
            <span className="flex-shrink-0">
              {item.icon}
            </span>
            {!sidebarCollapsed && (
              <span className="ml-3 text-sm font-medium">
                {item.label}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className={cn(
        "p-4 border-t border-pearl-200",
        sidebarCollapsed && "px-2"
      )}>
        <div className={cn(
          "flex items-center space-x-3 p-3 rounded-lg bg-pearl-50",
          sidebarCollapsed && "justify-center"
        )}>
          <div className="w-8 h-8 bg-crimson-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">A</span>
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-custom-800 truncate">
                Administrator
              </p>
              <p className="text-xs text-slate-custom-500 truncate">
                System Admin
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;