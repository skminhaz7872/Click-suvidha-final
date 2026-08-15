import React, { useState, useEffect } from 'react';
import { Smartphone, Activity, Zap, CheckCircle, XCircle, Clock } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, runTransaction, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';

export default function Recharge() {
  const [activeTab, setActiveTab] = useState('mobile');
  const [members, setMembers] = useState<any[]>([]);
  const [recharges, setRecharges] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    memberId: '', mobileNumber: '', operator: '', amount: ''
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMembers();
    
    // Real-time listener for transactions
    const q = query(collection(db, 'transactions') /* orderBy requires index, we'll sort client side for now */);
    const unsub = onSnapshot(q, (snapshot) => {
      const txns: any[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        txns.push({
          id: doc.id,
          txId: data.transactionId || doc.id,
          userId: data.userId,
          memberName: 'Loading...', // We'll map this below
          mobile: data.number || '-',
          operator: data.operator || '-',
          amount: data.amount || 0,
          status: data.status || 'Success',
          date: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()
        });
      });
      // Sort descending
      txns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecharges(txns);
    });
    
    return () => unsub();
  }, []);

  // Map user names to transactions when members or recharges update
  useEffect(() => {
    if (members.length > 0 && recharges.length > 0) {
      setRecharges(prev => prev.map(r => {
        const member = members.find(m => m.id === r.userId);
        if (member && r.memberName === 'Loading...') {
          return { ...r, memberName: member.fullName || member.email };
        }
        return r;
      }));
    }
  }, [members]); // only trigger when members load

  const fetchMembers = async () => {
    try {
      const snap = await getDocs(collection(db, 'users'));
      const m: any[] = [];
      snap.forEach(doc => m.push({ id: doc.id, ...doc.data() }));
      setMembers(m);
      
      // Update existing recharges with names
      setRecharges(prev => prev.map(r => {
        const member = m.find(x => x.id === r.userId);
        if (member) return { ...r, memberName: member.fullName || member.email };
        return r;
      }));
      
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: 'Processing...', type: 'info' });
    
    try {
      const chargeAmount = parseFloat(formData.amount);
      if (!formData.memberId || isNaN(chargeAmount) || chargeAmount <= 0) {
        throw new Error("Invalid input");
      }

      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', formData.memberId);
        const userDoc = await transaction.get(userRef);
        
        if (!userDoc.exists()) {
          throw new Error("User does not exist");
        }

        const currentBalance = parseFloat(userDoc.data().balance) || 0;
        if (currentBalance < chargeAmount) {
          throw new Error("User has insufficient balance!");
        }

        // Deduct balance
        transaction.update(userRef, { balance: currentBalance - chargeAmount });

        // Record transaction
        const txRef = doc(collection(db, 'transactions'));
        const txType = activeTab === 'mobile' ? 'Prepaid Mobile' : 'DTH';
        transaction.set(txRef, {
          transactionId: 'TXN' + Date.now() + Math.floor(Math.random() * 1000),
          userId: formData.memberId,
          type: txType,
          amount: chargeAmount,
          number: formData.mobileNumber,
          operator: formData.operator,
          status: 'Success',
          description: `Admin initiated ${txType} Recharge`,
          createdAt: serverTimestamp()
        });
      });

      setMessage({ text: 'Recharge successful!', type: 'success' });
      setFormData({ memberId: '', mobileNumber: '', operator: '', amount: '' });
      fetchMembers(); // refresh balances
    } catch (err: any) {
      setMessage({ text: err.message || 'Recharge failed. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const operators = activeTab === 'mobile' 
    ? ['Airtel', 'Jio', 'Vi', 'BSNL'] 
    : ['Airtel Digital TV', 'Tata Play', 'Dish TV', 'Sun Direct', 'd2h'];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Recharge Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Admin Recharge Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
          <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
            <button 
              onClick={() => setActiveTab('mobile')}
              className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'mobile' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
            >
              <Smartphone className="w-4 h-4 mr-2" /> Mobile
            </button>
            <button 
              onClick={() => setActiveTab('dth')}
              className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'dth' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
            >
              <Activity className="w-4 h-4 mr-2" /> DTH
            </button>
          </div>

          {message.text && (
            <div className={`p-3 mb-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : message.type === 'info' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleRecharge} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Member</label>
              <select required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.memberId} onChange={e => setFormData({...formData, memberId: e.target.value})}>
                <option value="">-- Choose Member --</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.fullName || m.email} - Bal: ₹{m.balance}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {activeTab === 'mobile' ? 'Mobile Number' : 'Customer ID / VC Number'}
              </label>
              <input type="text" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.mobileNumber} onChange={e => setFormData({...formData, mobileNumber: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Operator</label>
              <select required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.operator} onChange={e => setFormData({...formData, operator: e.target.value})}>
                <option value="">-- Choose Operator --</option>
                {operators.map(op => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
              <input type="number" min="1" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
            </div>

            <button type="submit" disabled={loading} className="w-full py-2.5 mt-2 flex justify-center items-center rounded-lg text-white font-medium bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50">
              <Zap className="w-4 h-4 mr-2" /> {loading ? 'Processing...' : 'Proceed Recharge'}
            </button>
          </form>
        </div>

        {/* Transaction History */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800">All Transactions (Retailers)</h2>
          </div>
          <div className="flex-1 overflow-auto max-h-[600px]">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm border-b">
                  <th className="px-4 py-3 font-medium">Txn ID</th>
                  <th className="px-4 py-3 font-medium">Member</th>
                  <th className="px-4 py-3 font-medium">Number/Op</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recharges.map((r, i) => (
                  <tr key={r.id || i} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-mono text-slate-600">{r.txId}</td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{r.memberName}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-slate-800">{r.mobile}</div>
                      <div className="text-xs text-slate-500">{r.operator}</div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold">₹{r.amount}</td>
                    <td className="px-4 py-3">
                      {r.status === 'Success' ? (
                        <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full w-fit">
                          <CheckCircle className="w-3 h-3 mr-1" /> Success
                        </span>
                      ) : r.status === 'Failed' ? (
                        <span className="flex items-center text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full w-fit">
                          <XCircle className="w-3 h-3 mr-1" /> Failed
                        </span>
                      ) : (
                        <span className="flex items-center text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full w-fit">
                          <Clock className="w-3 h-3 mr-1" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500 text-right">
                      {new Date(r.date).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {recharges.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
