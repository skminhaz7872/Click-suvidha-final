import React, { useState, useEffect } from 'react';
import { X, Calendar, Phone, Mail, User, Wallet, Activity, CreditCard, Smartphone } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

export default function MemberDetailsModal({ member, onClose }: { member: any, onClose: () => void }) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemberData = async () => {
      setLoading(true);
      try {
        // Fetch recent transactions
        const txQuery = query(
          collection(db, 'transactions'),
          where('userId', '==', member.id)
        );
        const txSnap = await getDocs(txQuery);
        const txData: any[] = [];
        txSnap.forEach(doc => txData.push({ id: doc.id, ...doc.data() }));
        // Sort descending by date locally since we don't have a composite index
        txData.sort((a, b) => {
           const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime();
           const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime();
           return dateB - dateA;
        });
        setTransactions(txData.slice(0, 10)); // keep last 10
      } catch (err) {
        console.error("Failed to fetch member details", err);
      }
      setLoading(false);
    };

    if (member?.id) fetchMemberData();
  }, [member]);

  if (!member) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Member Details</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Profile Summary */}
            <div className="col-span-1 space-y-6">
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-center">
                <div className="w-20 h-20 mx-auto bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                  {member.fullName?.charAt(0) || 'U'}
                </div>
                <h3 className="text-lg font-bold text-slate-800">{member.fullName}</h3>
                <p className="text-sm text-slate-500 mb-2">@{member.username}</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${member.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                  {member.status || 'Active'}
                </span>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-100 space-y-4 shadow-sm">
                <h4 className="font-semibold text-slate-800 border-b pb-2">Contact Info</h4>
                <div className="flex items-center text-sm text-slate-600">
                  <Phone className="w-4 h-4 mr-3 text-slate-400" /> {member.mobileNumber || 'N/A'}
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <Mail className="w-4 h-4 mr-3 text-slate-400" /> {member.email || 'N/A'}
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <User className="w-4 h-4 mr-3 text-slate-400" /> {member.role || 'Retailer'}
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <Calendar className="w-4 h-4 mr-3 text-slate-400" /> 
                  Joined {member.createdAt?.toDate ? member.createdAt.toDate().toLocaleDateString() : 'Unknown'}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-5 rounded-xl text-white shadow-md">
                <div className="flex items-center mb-2 opacity-80">
                  <Wallet className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Current Balance</span>
                </div>
                <div className="text-3xl font-bold">
                  ₹{parseFloat(member.balance || 0).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="col-span-1 md:col-span-2 space-y-6">
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="font-semibold text-slate-800 flex items-center">
                    <Activity className="w-4 h-4 mr-2 text-blue-500" /> Recent Transactions
                  </h4>
                </div>
                
                {loading ? (
                  <div className="p-8 text-center text-slate-500">Loading activity...</div>
                ) : transactions.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {transactions.map((tx, idx) => (
                      <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${tx.type === 'recharge' ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            {tx.type === 'recharge' ? <Smartphone className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="font-medium text-slate-800 text-sm">
                              {tx.type === 'recharge' ? `${tx.operator} Recharge - ${tx.number}` : 'Wallet Funding'}
                            </div>
                            <div className="text-xs text-slate-500">
                              {tx.createdAt?.toDate ? tx.createdAt.toDate().toLocaleString() : 'Recent'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-semibold ${tx.type === 'recharge' ? 'text-slate-800' : 'text-emerald-600'}`}>
                            {tx.type === 'recharge' ? '-' : '+'}₹{parseFloat(tx.amount || 0).toLocaleString()}
                          </div>
                          <div className={`text-xs font-medium ${tx.status === 'Success' ? 'text-emerald-600' : tx.status === 'Failed' ? 'text-red-600' : 'text-amber-600'}`}>
                            {tx.status || 'Success'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500">
                    No recent transactions found for this member.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
