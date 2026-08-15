import { Menu, Search, Bell, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const navigate = useNavigate();
  const { settings } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <header 
      className="flex items-center justify-between px-6 py-4 border-b border-slate-200 transition-colors"
      style={{ backgroundColor: settings.headerColor }}
    >
      <div className="flex items-center">
        <button 
          onClick={onMenuClick}
          className="text-slate-500 hover:text-slate-700 md:hidden mr-4"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="relative hidden md:block">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="w-5 h-5 text-slate-400" />
          </span>
          <input
            type="text"
            className="w-full py-2 pl-10 pr-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Search member or number..."
          />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button className="text-slate-400 hover:text-slate-600 relative">
          <Bell className="w-6 h-6" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="relative flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
            A
          </div>
          <span className="hidden md:block font-medium text-slate-700">Admin User</span>
        </div>
        <button onClick={handleLogout} className="text-slate-500 hover:text-red-500 transition-colors ml-4" title="Logout">
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
