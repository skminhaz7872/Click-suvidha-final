import React from 'react';
import { Wallet as WalletIcon, PlusCircle, ArrowDownLeft, Clock } from 'lucide-react';
import { useRetailer } from '../../contexts/RetailerContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function RetailerWallet() {
  const { balance } = useRetailer();
  const { settings } = useTheme();

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold text-slate-800">My Wallet</h1>
      
      {/* Balance Card */}
      <div 
        className="rounded-2xl shadow-md p-6 text-white relative overflow-hidden"
        style={{ backgroundColor: settings.primaryButtonColor }}
      >
        <div className="relative z-10">
          <p className="text-white/80 text-sm font-medium uppercase tracking-wider mb-1">Available Balance</p>
          <h2 className="text-4xl font-bold">₹ {balance.toLocaleString('en-IN')}</h2>
        </div>
        <WalletIcon className="absolute -right-4 -bottom-4 w-40 h-40 opacity-10" />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button className="flex flex-col items-center justify-center p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow active:scale-95">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
            <PlusCircle className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold text-slate-700">Add Money</span>
        </button>
        <button className="flex flex-col items-center justify-center p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow active:scale-95">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-3">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold text-slate-700">Fund Request</span>
        </button>
      </div>

      {/* Wallet Instructions */}
      <div className="bg-slate-100 rounded-2xl p-5 border border-slate-200">
        <h3 className="text-sm font-bold text-slate-800 mb-2">How to add money?</h3>
        <ul className="text-sm text-slate-600 space-y-2 list-disc pl-4">
          <li>You can request funds directly from the admin via Fund Request.</li>
          <li>Transfer money to the company bank account and submit UTR number.</li>
          <li>Minimum fund request amount is ₹ 500.</li>
        </ul>
      </div>
    </div>
  );
}
