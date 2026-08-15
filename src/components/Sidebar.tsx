import { safeStorage } from "@/src/utils/storage";
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  Smartphone, 
  History, 
  Settings, 
  LogOut,
  Bell,
  MessageSquare,
  Server,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';

export default function Sidebar({ isOpen = false, onClose }: { isOpen?: boolean, onClose?: () => void }) {
  const { settings } = useTheme();
  
  const handleLogout = () => {
    safeStorage.removeItem('token');
    window.location.href = '/login';
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Members', path: '/members' },
    { icon: Wallet, label: 'Money Requests', path: '/fund-requests' },
    { icon: Smartphone, label: 'Recharge', path: '/recharge' },
    { icon: History, label: 'Wallet Ledger', path: '/wallet' },
    { icon: Server, label: 'API Routes', path: '/api-routes' },
    { icon: ImageIcon, label: 'Banners', path: '/banners' },
    { icon: MessageSquare, label: 'SMS/WhatsApp', path: '/sms' },
    { icon: Bell, label: 'Notice', path: '/notice' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col w-64 text-white transition-transform duration-300 md:relative md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ backgroundColor: settings.sidebarColor }}
      >
        <div 
          className="flex items-center justify-center h-16 border-b border-white/10 relative"
          style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
        >
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt={settings.companyName} className="h-10 object-contain" referrerPolicy="no-referrer" />
          ) : (
            <span className="text-xl font-bold tracking-wider" style={{ color: settings.primaryButtonColor }}>
              {settings.companyName}
            </span>
          )}
          <button 
            className="absolute right-4 md:hidden text-slate-300 hover:text-white"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      <div className="flex flex-col flex-1 overflow-y-auto">
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'text-white'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                )
              }
              style={({ isActive }) => (isActive ? { backgroundColor: settings.primaryButtonColor } : {})}
            >
              <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-400 rounded-lg hover:bg-slate-800 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3 flex-shrink-0" />
            Logout
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
