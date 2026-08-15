import { safeStorage } from "@/src/utils/storage";
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Recharge from './pages/Recharge';
import FundRequests from './pages/FundRequests';
import Wallet from './pages/Wallet';
import APIRoutes from './pages/APIRoutes';
import Banners from './pages/Banners';
import Settings from './pages/Settings';
import Placeholder from './pages/Placeholder';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import RetailerLayout from './components/retailer/RetailerLayout';
import RetailerDashboard from './pages/retailer/RetailerDashboard';
import RechargePage from './pages/retailer/RechargePage';
import RetailerHistory from './pages/retailer/RetailerHistory';
import RetailerProfile from './pages/retailer/RetailerProfile';
import RetailerWallet from './pages/retailer/RetailerWallet';

import { RetailerProvider } from './contexts/RetailerContext';

function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, isAuthenticated, allowedRole, userRole }: { children: React.ReactNode, isAuthenticated: boolean, allowedRole: string, userRole: string }) {
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (userRole !== allowedRole) {
    return <Navigate to={userRole === 'Retailer' ? '/retailer' : '/'} replace />;
  }
  
  if (allowedRole === 'Admin') {
    return <AdminLayout>{children}</AdminLayout>;
  } else {
    return <RetailerLayout>{children}</RetailerLayout>;
  }
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string>('Admin');

  useEffect(() => {
    try {
      const token = safeStorage.getItem('token');
      const role = safeStorage.getItem('role') || 'Admin';
      if (token) {
        setIsAuthenticated(true);
        setUserRole(role);
      }
    } catch (err) {
      console.warn("safeStorage is blocked or unavailable", err);
    }
  }, []);

  const handleLogin = (role: string) => {
    setIsAuthenticated(true);
    setUserRole(role);
    try {
      safeStorage.setItem('role', role);
    } catch(e) {}
  };

  return (
    <ThemeProvider>
      <RetailerProvider>
      <BrowserRouter>
        <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        
        {/* Admin Routes */}
        <Route path="/" element={<ProtectedRoute isAuthenticated={isAuthenticated} allowedRole="Admin" userRole={userRole}><Dashboard /></ProtectedRoute>} />
        <Route path="/members" element={<ProtectedRoute isAuthenticated={isAuthenticated} allowedRole="Admin" userRole={userRole}><Members /></ProtectedRoute>} />
        <Route path="/recharge" element={<ProtectedRoute isAuthenticated={isAuthenticated} allowedRole="Admin" userRole={userRole}><Recharge /></ProtectedRoute>} />
        <Route path="/fund-requests" element={<ProtectedRoute isAuthenticated={isAuthenticated} allowedRole="Admin" userRole={userRole}><FundRequests /></ProtectedRoute>} />
        <Route path="/wallet" element={<ProtectedRoute isAuthenticated={isAuthenticated} allowedRole="Admin" userRole={userRole}><Wallet /></ProtectedRoute>} />
        <Route path="/api-routes" element={<ProtectedRoute isAuthenticated={isAuthenticated} allowedRole="Admin" userRole={userRole}><APIRoutes /></ProtectedRoute>} />
        <Route path="/banners" element={<ProtectedRoute isAuthenticated={isAuthenticated} allowedRole="Admin" userRole={userRole}><Banners /></ProtectedRoute>} />
        <Route path="/sms" element={<ProtectedRoute isAuthenticated={isAuthenticated} allowedRole="Admin" userRole={userRole}><Placeholder title="SMS & WhatsApp Module" /></ProtectedRoute>} />
        <Route path="/notice" element={<ProtectedRoute isAuthenticated={isAuthenticated} allowedRole="Admin" userRole={userRole}><Placeholder title="Notice & Updates" /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute isAuthenticated={isAuthenticated} allowedRole="Admin" userRole={userRole}><Settings /></ProtectedRoute>} />
        
        {/* Retailer Routes */}
        <Route path="/retailer" element={<ProtectedRoute isAuthenticated={isAuthenticated} allowedRole="Retailer" userRole={userRole}><RetailerDashboard /></ProtectedRoute>} />
        <Route path="/retailer/recharge/:type" element={<ProtectedRoute isAuthenticated={isAuthenticated} allowedRole="Retailer" userRole={userRole}><RechargePage /></ProtectedRoute>} />
        <Route path="/retailer/history" element={<ProtectedRoute isAuthenticated={isAuthenticated} allowedRole="Retailer" userRole={userRole}><RetailerHistory /></ProtectedRoute>} />
        <Route path="/retailer/profile" element={<ProtectedRoute isAuthenticated={isAuthenticated} allowedRole="Retailer" userRole={userRole}><RetailerProfile /></ProtectedRoute>} />
        <Route path="/retailer/wallet" element={<ProtectedRoute isAuthenticated={isAuthenticated} allowedRole="Retailer" userRole={userRole}><RetailerWallet /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to={userRole === 'Retailer' ? '/retailer' : '/'} replace />} />
      </Routes>
      </BrowserRouter>
      </RetailerProvider>
    </ThemeProvider>
  );
}
