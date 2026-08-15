import React from 'react';
import { Smartphone, Tv, Zap, Clock } from 'lucide-react';
import { useRetailer } from '../../contexts/RetailerContext';

export default function RetailerHistory() {
  const { transactions } = useRetailer();

  const getServiceIcon = (type: string) => {
    switch(type) {
      case 'DTH': return Tv;
      case 'Electricity': return Zap;
      default: return Smartphone;
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold text-slate-800">Transaction History</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {transactions.map((tx) => {
          const Icon = getServiceIcon(tx.type);
          return (
            <div key={tx.id} className="flex items-center justify-between p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{tx.number}</p>
                  <p className="text-xs text-slate-500">{tx.operator} - {new Date(tx.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-800">₹ {tx.amount.toLocaleString('en-IN')}</p>
                <p className={`text-[10px] font-medium uppercase ${tx.status === 'Success' ? 'text-emerald-600' : 'text-orange-600'}`}>
                  {tx.status}
                </p>
              </div>
            </div>
          );
        })}
        {transactions.length === 0 && (
          <div className="p-12 flex flex-col items-center justify-center text-slate-500">
            <Clock className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">No transactions yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
