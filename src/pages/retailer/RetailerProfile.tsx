import { safeStorage } from "@/src/utils/storage";
import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Shield, LogOut, Key } from 'lucide-react';
import { db } from '../../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function RetailerProfile() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  
  const userId = safeStorage.getItem('user_id');

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  const handleLogout = () => {
    safeStorage.removeItem('token');
    safeStorage.removeItem('role');
    safeStorage.removeItem('user_id');
    window.location.href = '/login';
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPasswordMessage('Password must be at least 6 characters');
      return;
    }
    try {
      if (!userId) return;
      await updateDoc(doc(db, 'users', userId), {
        password: newPassword
      });
      setPasswordMessage('Password updated successfully!');
      setNewPassword('');
      setTimeout(() => setShowPasswordChange(false), 2000);
    } catch (err) {
      setPasswordMessage('Failed to update password.');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-4 text-center text-slate-500">Loading profile...</div>;
  }

  if (!userData) {
    return (
      <div className="p-4 text-center">
        <p className="text-slate-500 mb-4">Could not load profile. Please login again.</p>
        <button onClick={handleLogout} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Logout</button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-slate-800">My Profile</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 flex flex-col items-center border-b border-slate-100 relative">
          <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 shadow-inner text-3xl font-bold">
            {userData.fullName?.charAt(0) || <User className="w-12 h-12" />}
          </div>
          <h2 className="text-xl font-bold text-slate-800">{userData.fullName || 'User'}</h2>
          <p className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full mt-2">@{userData.username || 'user'}</p>
          <span className="absolute top-4 right-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            {userData.role}
          </span>
        </div>
        
        <div className="p-5 space-y-5">
          <div className="flex items-center text-slate-700">
            <Mail className="w-5 h-5 mr-4 text-slate-400" />
            <div className="flex-1">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Email Address</p>
              <p className="text-sm font-medium">{userData.email || 'N/A'}</p>
            </div>
          </div>
          
          <div className="flex items-center text-slate-700">
            <Phone className="w-5 h-5 mr-4 text-slate-400" />
            <div className="flex-1">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Mobile Number</p>
              <p className="text-sm font-medium">{userData.mobileNumber || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center text-slate-700">
            <Shield className="w-5 h-5 mr-4 text-slate-400" />
            <div className="flex-1">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Account Status</p>
              <p className={`text-sm font-bold ${userData.status === 'Active' ? 'text-emerald-600' : 'text-red-600'}`}>
                {userData.status || 'Active'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden p-5">
        <button 
          onClick={() => setShowPasswordChange(!showPasswordChange)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center text-slate-800 font-semibold">
            <Key className="w-5 h-5 mr-3 text-slate-500" />
            Change Password
          </div>
          <span className="text-blue-600 text-sm font-medium">{showPasswordChange ? 'Cancel' : 'Edit'}</span>
        </button>
        
        {showPasswordChange && (
          <form onSubmit={handleChangePassword} className="mt-4 pt-4 border-t border-slate-100">
            <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
            <input 
              type="password" 
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-3"
              placeholder="Enter new password"
            />
            {passwordMessage && (
              <p className={`text-xs mb-3 font-medium ${passwordMessage.includes('success') ? 'text-emerald-600' : 'text-red-600'}`}>
                {passwordMessage}
              </p>
            )}
            <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Update Password
            </button>
          </form>
        )}
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
