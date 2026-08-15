import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Wallet, 
  Users, 
  TrendingUp, 
  Activity,
  ArrowRight,
  Smartphone,
  History
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSuccess: 0,
    totalFailed: 0,
    pendingFundRequests: 0,
    totalRechargeAmount: 0,
    totalMembers: 0,
    walletBalance: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      let totalMembers = 0;
      let walletBalance = 0;
      
      usersSnap.forEach(doc => {
        const data = doc.data();
        if (['Retailer', 'Distributor', 'Master Distributor'].includes(data.role)) {
          totalMembers++;
          walletBalance += (data.balance || 0);
        }
      });

      const txSnap = await getDocs(collection(db, 'transactions'));
      let totalSuccess = 0;
      let totalFailed = 0;
      let totalRechargeAmount = 0;

      txSnap.forEach(doc => {
        const data = doc.data();
        if (data.status === 'Success') {
          totalSuccess++;
          if (data.type === 'Recharge') {
             totalRechargeAmount += (data.amount || 0);
          }
        } else if (data.status === 'Failed') {
          totalFailed++;
        }
      });

      setStats({
        totalSuccess,
        totalFailed,
        pendingFundRequests: 0,
        totalRechargeAmount,
        totalMembers,
        walletBalance
      });
    } catch (err) {
      console.error("Error fetching stats", err);
    }
  };

  const statCards = [
    { title: 'Success Txns', value: stats.totalSuccess, icon: CheckCircle, color: 'from-emerald-400 to-emerald-600' },
    { title: 'Failed Txns', value: stats.totalFailed, icon: XCircle, color: 'from-red-400 to-red-600' },
    { title: 'Pending Funds', value: stats.pendingFundRequests, icon: Clock, color: 'from-amber-400 to-amber-600' },
    { title: 'Total Members', value: stats.totalMembers, icon: Users, color: 'from-blue-400 to-blue-600' },
    { title: 'Wallet Balance', value: `₹${stats.walletBalance.toLocaleString()}`, icon: Wallet, color: 'from-indigo-400 to-indigo-600' },
    { title: 'Total Recharge', value: `₹${stats.totalRechargeAmount.toLocaleString()}`, icon: TrendingUp, color: 'from-purple-400 to-purple-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-2xl text-white shadow-xl">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, Admin!</h1>
          <p className="text-slate-300 mt-1">Here's what's happening today.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <Link to="/recharge" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium transition-colors">
            New Recharge
          </Link>
          <Link to="/fund-requests" className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg font-medium transition-colors">
            View Requests
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className={`p-4 rounded-2xl text-white bg-gradient-to-br ${card.color} shadow-lg relative overflow-hidden group`}>
            <div className="relative z-10">
              <p className="text-white/80 text-sm font-medium mb-1">{card.title}</p>
              <h3 className="text-2xl font-bold">{card.value}</h3>
            </div>
            <card.icon className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 group-hover:scale-110 transition-transform duration-300" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'All Members', icon: Users, path: '/members', color: 'bg-blue-50 text-blue-600' },
              { label: 'Fund Requests', icon: Wallet, path: '/fund-requests', color: 'bg-emerald-50 text-emerald-600' },
              { label: 'Mobile Recharge', icon: Smartphone, path: '/recharge', color: 'bg-purple-50 text-purple-600' },
              { label: 'DTH Recharge', icon: Activity, path: '/recharge', color: 'bg-amber-50 text-amber-600' },
              { label: 'Wallet Ledger', icon: History, path: '/wallet', color: 'bg-indigo-50 text-indigo-600' },
            ].map((action, i) => (
              <Link key={i} to={action.path} className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:shadow-md transition-all group">
                <div className={`w-12 h-12 rounded-full ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-slate-700">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Ready</p>
                <p className="text-xs text-slate-500">System is connected to Firebase</p>
              </div>
            </div>
            <Link to="/recharge" className="flex items-center justify-center text-sm text-blue-600 font-medium hover:text-blue-700 pt-2">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
