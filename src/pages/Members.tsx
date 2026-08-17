import React from "react";
import { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical, Eye, Edit, Shield, Check, X, Ban, Unlock } from 'lucide-react';
import MemberDetailsModal from "../components/MemberDetailsModal";
import { db } from '../lib/firebase';
import { collection, query, getDocs, addDoc, doc, updateDoc, serverTimestamp, where } from 'firebase/firestore';

export default function Members() {
  const [members, setMembers] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: '', mobileNumber: '', email: '', username: '', role: 'Retailer', openingBalance: '0', password: ''
  });
  const [message, setMessage] = useState({ text: '', type: '' });

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
      console.error("Error fetching members: ", err);
    }
  };

  const handleBlockMember = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'Active' ? 'Blocked' : 'Active';
      await updateDoc(doc(db, 'users', id), {
        status: newStatus
      });
      fetchMembers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: 'Saving...', type: 'info' });
    try {
      await addDoc(collection(db, 'users'), {
        fullName: formData.fullName,
        mobileNumber: formData.mobileNumber,
        email: formData.email,
        username: formData.username,
        role: formData.role,
        password: formData.password,
        balance: parseFloat(formData.openingBalance) || 0,
        status: 'Active',
        createdAt: serverTimestamp()
      });
      setMessage({ text: 'Member added successfully!', type: 'success' });
      setShowAddForm(false);
      fetchMembers();
      setFormData({ fullName: '', mobileNumber: '', email: '', username: '', role: 'Retailer', openingBalance: '0', password: '' });
    } catch (err: any) {
      console.error(err);
      setMessage({ text: err.message || 'Failed to add member', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Members Management</h1>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showAddForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showAddForm ? 'Cancel' : 'Add Member'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold mb-4">Add New Member</h2>
          {message.text && (
            <div className={`p-3 mb-4 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700' : message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
              {message.text}
            </div>
          )}
          <form onSubmit={handleAddMember} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input type="text" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number</label>
              <input type="text" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.mobileNumber} onChange={e => setFormData({...formData, mobileNumber: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
              <input type="text" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input type="password" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
              <select className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="Retailer">Retailer</option>
                <option value="Distributor">Distributor</option>
                <option value="Master Distributor">Master Distributor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Opening Balance</label>
              <input type="number" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.openingBalance} onChange={e => setFormData({...formData, openingBalance: e.target.value})} />
            </div>
            <div className="lg:col-span-3 flex justify-end mt-2">
              <button type="submit" className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors">
                Save Member
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search members..." className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm">
                <th className="px-6 py-3 font-medium">Member</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Contact</th>
                <th className="px-6 py-3 font-medium">Wallet Balance</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-3">
                        {member.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-800">{member.fullName}</div>
                        <div className="text-xs text-slate-500">@{member.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-800">{member.mobileNumber}</div>
                    <div className="text-xs text-slate-500">{member.email}</div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-emerald-600">
                    ₹{member.balance.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${member.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setSelectedMember(member)}
                        className="p-1.5 rounded transition-colors text-blue-600 bg-blue-50 hover:bg-blue-100"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleBlockMember(member.id, member.status || 'Active')}
                        className={`p-1.5 rounded transition-colors ${member.status === 'Active' ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'}`}
                        title={member.status === 'Active' ? 'Block Member' : 'Unblock Member'}
                      >
                        {member.status === 'Active' ? <Ban className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No members found. Add a member to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {selectedMember && (
        <MemberDetailsModal 
          member={selectedMember} 
          onClose={() => setSelectedMember(null)} 
        />
      )}
    </div>
  );
}
