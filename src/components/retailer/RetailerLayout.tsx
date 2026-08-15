import { safeStorage } from "@/src/utils/storage";
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, History, Wallet, User, LogOut } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useRetailer } from '../../contexts/RetailerContext';
import { cn } from '../../lib/utils';

export default function RetailerLayout({ children }: { children: React.ReactNode }) {
  const { settings } = useTheme();
  const { balance } = useRetailer();

  const handleLogout = () => {
    safeStorage.removeItem('token');
    safeStorage.removeItem('role');
    window.location.href = '/login';
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Mobile Top Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt="Logo" className="h-8 object-contain" referrerPolicy="no-referrer" />
          ) : (
            <span className="font-bold text-lg" style={{ color: settings.primaryButtonColor }}>
              {settings.companyName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-slate-500 font-medium uppercase">Balance</p>
            <p className="text-sm font-bold text-slate-800">₹ {balance.toLocaleString('en-IN')}</p>
          </div>
          <button onClick={handleLogout} className="text-slate-400 hover:text-red-500">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Scrollable Area */}
      <main className="flex-1 overflow-y-auto pb-16">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center h-16 z-20">
        <NavLink 
          to="/retailer" 
          end
          className={({ isActive }) => cn(
            "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
            isActive ? "text-blue-600" : "text-slate-500"
          )}
          style={({ isActive }) => isActive ? { color: settings.primaryButtonColor } : {}}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Home</span>
        </NavLink>
        <NavLink 
          to="/retailer/history" 
          className={({ isActive }) => cn(
            "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
            isActive ? "text-blue-600" : "text-slate-500"
          )}
          style={({ isActive }) => isActive ? { color: settings.primaryButtonColor } : {}}
        >
          <History className="w-5 h-5" />
          <span className="text-[10px] font-medium">History</span>
        </NavLink>
        <NavLink 
          to="/retailer/wallet" 
          className={({ isActive }) => cn(
            "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
            isActive ? "text-blue-600" : "text-slate-500"
          )}
          style={({ isActive }) => isActive ? { color: settings.primaryButtonColor } : {}}
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[10px] font-medium">Wallet</span>
        </NavLink>
        <NavLink 
          to="/retailer/profile" 
          className={({ isActive }) => cn(
            "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
            isActive ? "text-blue-600" : "text-slate-500"
          )}
          style={({ isActive }) => isActive ? { color: settings.primaryButtonColor } : {}}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium">Profile</span>
        </NavLink>
      </nav>
    </div>
  );
}
