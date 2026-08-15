import React from "react";
import { useState, useEffect } from 'react';
import { PlusCircle, MinusCircle, Search } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, getDocs, doc, runTransaction, serverTimestamp, where } from 'firebase/firestore';

export default function Wallet() {
  const [members, setMembers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    memberId: '', amount: '', remark: '', type: 'credit'
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const q = query(collection(db, 'users'), where('role', 'in', ['Retailer', 'Distributor', 'Master Distributor']));
      const querySnapshot = await getDocs(q);
      const membersData: any[] = [];
      querySnapshot.forEach((doc) => {
        membersData.push({ id: doc.id, ...doc.data() });
      });
      setMembers(membersData);
    } catch (err) {
      console.error("Error fetching members:", err);
    }
  };

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!formData.memberId) return alert('Select a member');
    
    try {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Invalid amount");
      }

      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', formData.memberId);
        const userDoc = await transaction.get(userRef);
        
        if (!userDoc.exists()) {
          throw new Error("Member does not exist!");
        }

        const currentBalance = userDoc.data().balance || 0;
        let newBalance = currentBalance;
        
        if (formData.type === 'credit') {
          newBalance += amount;
        } else {
          if (currentBalance < amount) {
            throw new Error("Insufficient balance!");
          }
          newBalance -= amount;
        }

        transaction.update(userRef, { balance: newBalance });

        const txRef = doc(collection(db, 'transactions'));
        transaction.set(txRef, {
          transactionId: 'TXN' + Date.now() + Math.floor(Math.random() * 1000),
          userId: formData.memberId,
          type: formData.type === 'credit' ? 'Wallet Credit' : 'Wallet Debit',
          amount: amount,
          status: 'Success',
          description: formData.remark,
          createdAt: serverTimestamp()
        });
      });

      setMessage({ text: 'Transaction successful!', type: 'success' });
      setFormData({ memberId: '', amount: '', remark: '', type: 'credit' });
      fetchMembers();
    } catch (err: any) {
      console.error(err);
      setMessage({ text: err.message || 'Transaction failed', type: 'error' });
    }
  };

  const filteredMembers = members.filter(m => 
    m.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.mobileNumber?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Wallet Management</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-3 rounded-full ${formData.type === 'credit' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
              {formData.type === 'credit' ? <PlusCircle className="w-6 h-6" /> : <MinusCircle className="w-6 h-6" />}
            </div>
            <h2 className="text-xl font-semibold">Wallet Transaction</h2>
          </div>
          {message.text && (
            <div className={`p-3 mb-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.text}
            </div>
          )}
          <form onSubmit={handleTransaction} className="space-y-4">
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button 
                type="button"
                onClick={() => setFormData({...formData, type: 'credit'})}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${formData.type === 'credit' ? 'bg-white shadow text-emerald-600' : 'text-slate-500'}`}
              >
                Credit (+)
              </button>
              <button 
                type="button"
                onClick={() => setFormData({...formData, type: 'debit'})}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${formData.type === 'debit' ? 'bg-white shadow text-red-600' : 'text-slate-500'}`}
              >
                Debit (-)
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Member</label>
              <select 
                required 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.memberId}
                onChange={e => setFormData({...formData, memberId: e.target.value})}
              >
                <option value="">-- Choose Member --</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.fullName} ({m.mobileNumber}) - Bal: ₹{m.balance}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
              <input 
                type="number" 
                required 
                min="1"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Remark / Reason</label>
              <input 
                type="text" 
                required 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.remark}
                onChange={e => setFormData({...formData, remark: e.target.value})}
              />
            </div>
            <button type="submit" className={`w-full py-2.5 mt-2 rounded-lg text-white font-medium transition-colors ${formData.type === 'credit' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>
              {formData.type === 'credit' ? 'Credit Wallet' : 'Debit Wallet'}
            </button>
          </form>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-semibold mb-4">Member Balances</h2>
          <div className="relative mb-4">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search members..." 
              className="pl-9 pr-4 py-2 w-full border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {filteredMembers.map(m => (
              <div key={m.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-slate-50">
                <div>
                  <div className="font-medium text-slate-800">{m.fullName}</div>
                  <div className="text-xs text-slate-500">{m.mobileNumber}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-600">₹{(m.balance || 0).toLocaleString()}</div>
                  <div className="text-xs text-slate-500">{m.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
