import { safeStorage } from "@/src/utils/storage";
import React from 'react';
import { User, Mail, Phone, MapPin, Shield, LogOut } from 'lucide-react';

export default function RetailerProfile() {
  const handleLogout = () => {
    safeStorage.removeItem('token');
    safeStorage.removeItem('role');
    window.location.href = '/login';
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold text-slate-800">My Profile</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 flex flex-col items-center border-b border-slate-100">
          <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
            <User className="w-12 h-12" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Retailer User</h2>
          <p className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full mt-2">ID: RET-10294</p>
        </div>
        
        <div className="p-5 space-y-5">
          <div className="flex items-center text-slate-700">
            <Mail className="w-5 h-5 mr-4 text-slate-400" />
            <div className="flex-1">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Email Address</p>
              <p className="text-sm font-medium">retailer@admin.com</p>
            </div>
          </div>
          
          <div className="flex items-center text-slate-700">
            <Phone className="w-5 h-5 mr-4 text-slate-400" />
            <div className="flex-1">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Mobile Number</p>
              <p className="text-sm font-medium">+91 98765 43210</p>
            </div>
          </div>

          <div className="flex items-center text-slate-700">
            <MapPin className="w-5 h-5 mr-4 text-slate-400" />
            <div className="flex-1">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Shop Address</p>
              <p className="text-sm font-medium">123, Main Market Road, Mumbai, Maharashtra</p>
            </div>
          </div>

          <div className="flex items-center text-slate-700">
            <Shield className="w-5 h-5 mr-4 text-slate-400" />
            <div className="flex-1">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Account Status</p>
              <p className="text-sm font-bold text-emerald-600">Active (Verified)</p>
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={handleLogout}
        className="w-full py-4 flex items-center justify-center text-red-600 font-bold bg-white rounded-xl shadow-sm border border-red-100 hover:bg-red-50 transition-colors"
      >
        <LogOut className="w-5 h-5 mr-2" />
        Logout securely
      </button>
    </div>
  );
}
