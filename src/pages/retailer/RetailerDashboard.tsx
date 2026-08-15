import React, { useEffect, useState } from 'react';
import { Smartphone, Tv, Zap, Droplet, Wifi, FileText, ChevronRight, AlertCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useRetailer } from '../../contexts/RetailerContext';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function RetailerDashboard() {
  const { settings } = useTheme();
  const { transactions } = useRetailer();
  const navigate = useNavigate();
  const [banners, setBanners] = useState<any[]>([]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const q = query(collection(db, 'settings'), where('type', '==', 'banner'));
        const snapshot = await getDocs(q);
        const b: any[] = [];
        snapshot.forEach(doc => b.push(doc.data()));
        setBanners(b);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBanners();
  }, []);

  const services = [
    { id: 'prepaid', icon: Smartphone, label: 'Prepaid', color: 'bg-blue-100 text-blue-600' },
    { id: 'dth', icon: Tv, label: 'DTH', color: 'bg-orange-100 text-orange-600' },
    { id: 'electricity', icon: Zap, label: 'Electricity', color: 'bg-yellow-100 text-yellow-600' },
    { id: 'water', icon: Droplet, label: 'Water', color: 'bg-cyan-100 text-cyan-600' },
    { id: 'broadband', icon: Wifi, label: 'Broadband', color: 'bg-emerald-100 text-emerald-600' },
    { id: 'postpaid', icon: FileText, label: 'Postpaid', color: 'bg-purple-100 text-purple-600' },
  ];

  const getServiceIcon = (type: string) => {
    switch(type) {
      case 'DTH': return Tv;
      case 'Electricity': return Zap;
      default: return Smartphone;
    }
  };

  return (
    <div className="p-4 space-y-6">
      
      {/* Banner Carousel */}
      {banners.length > 0 && (
        <div className="w-full overflow-x-auto snap-x snap-mandatory flex space-x-4 pb-2 hide-scrollbar">
          {banners.map((banner, idx) => (
            <div key={idx} className="flex-none w-full sm:w-80 snap-center rounded-xl overflow-hidden shadow-sm">
              <img src={banner.imageUrl} alt="Offer Banner" className="w-full h-40 object-cover" referrerPolicy="no-referrer" />
            </div>
          ))}
        </div>
      )}

      {/* Services Grid */}
      <section>
        <h2 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Recharge & Payments</h2>
        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 gap-y-6 gap-x-2 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          {services.map((service) => (
            <button 
              key={service.id} 
              onClick={() => navigate(`/retailer/recharge/${service.id}`)}
              className="flex flex-col items-center justify-center space-y-2 group"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${service.color}`}>
                <service.icon className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-medium text-slate-600 text-center leading-tight">
                {service.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Recent Transactions */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Recent Transactions</h2>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          {transactions.slice(0, 3).map((tx) => {
            const Icon = getServiceIcon(tx.type);
            return (
            <div key={tx.id} className="flex items-center justify-between p-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{tx.number}</p>
                  <p className="text-xs text-slate-500">{tx.operator}</p>
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
            <div className="p-6 flex flex-col items-center justify-center text-slate-500">
              <Clock className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">No recent transactions</p>
            </div>
          )}
        </div>
      </section>
      
      {/* Notice Area */}
      <section className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-semibold text-blue-900">Important Update</h3>
          <p className="text-xs text-blue-700 mt-1">DTH services for Airtel might face slight delays due to operator downtime.</p>
        </div>
      </section>
    </div>
  );
}
