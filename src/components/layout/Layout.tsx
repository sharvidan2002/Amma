import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useUIStore } from '../../store/uiStore';
import { cn } from '../../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { sidebarCollapsed, pageLoading } = useUIStore();

  return (
    <div className="h-screen flex bg-pearl-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className={cn(
          "flex-1 overflow-auto p-6 transition-all duration-300",
          pageLoading && "opacity-50 pointer-events-none"
        )}>
          {pageLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crimson-600"></div>
                <p className="text-slate-custom-600">Loading...</p>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              {children}
            </div>
          )}
        </main>
      </div>

      {/* Loading Overlay */}
      {pageLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-20 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-lg flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-crimson-600"></div>
            <p className="text-slate-custom-600 font-medium">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;