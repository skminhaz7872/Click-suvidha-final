import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Smartphone, Tv, Zap, ArrowLeft, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useRetailer } from '../../contexts/RetailerContext';
import { db, auth } from '../../lib/firebase';
import { doc, collection, runTransaction, serverTimestamp } from 'firebase/firestore';
import { safeStorage } from '@/src/utils/storage';

export default function RechargePage() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { settings } = useTheme();
  
  const [number, setNumber] = useState('');
  const [operator, setOperator] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const typeConfig = {
    prepaid: { icon: Smartphone, label: 'Prepaid Mobile', operators: ['Jio', 'Airtel', 'Vi', 'BSNL'] },
    dth: { icon: Tv, label: 'DTH', operators: ['Tata Play', 'Airtel DTH', 'Dish TV', 'Videocon D2H', 'Sun Direct'] },
    electricity: { icon: Zap, label: 'Electricity', operators: ['WBSEDCL', 'CESC', 'Tata Power', 'BSES'] }
  };

  const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.prepaid;
  const Icon = config.icon;

  useEffect(() => {
    if (type === 'prepaid' && number.length >= 2) {
      if (/^(6|70|79)/.test(number)) setOperator('Jio');
      else if (/^(99|98|97|96|89|73)/.test(number)) setOperator('Airtel');
      else if (/^(91|95|81|88|87|79)/.test(number)) setOperator('Vi');
      else if (/^(94|84)/.test(number)) setOperator('BSNL');
    }
  }, [number, type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!number || !operator || !amount) return;
    
    const userId = auth.currentUser?.uid || safeStorage.getItem('user_id');
    if (!userId) {
      setStatus('error');
      setMessage('User session expired. Please login again.');
      return;
    }

    setStatus('loading');
    
    try {
      const chargeAmount = parseFloat(amount);
      if (isNaN(chargeAmount) || chargeAmount <= 0) {
        throw new Error("Invalid amount");
      }

      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', userId);
        const userDoc = await transaction.get(userRef);
        
        if (!userDoc.exists()) {
          throw new Error("User does not exist");
        }

        const currentBalance = userDoc.data().balance || 0;
        if (currentBalance < chargeAmount) {
          throw new Error("Insufficient balance!");
        }

        // Deduct balance
        transaction.update(userRef, { balance: currentBalance - chargeAmount });

        // Record transaction
        const txRef = doc(collection(db, 'transactions'));
        transaction.set(txRef, {
          transactionId: 'TXN' + Date.now() + Math.floor(Math.random() * 1000),
          userId: userId,
          type: config.label,
          amount: chargeAmount,
          number: number,
          operator: operator,
          status: 'Success',
          description: `${config.label} Recharge for ${number}`,
          createdAt: serverTimestamp()
        });
      });

      setStatus('success');
      setMessage('Recharge Successful!');
      setTimeout(() => {
        navigate('/retailer');
      }, 2000);
      
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setMessage(err.message || 'Something went wrong!');
    }
  };

  if (status === 'success') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Recharge Successful!</h2>
        <p className="text-slate-600">Your {config.label} recharge of ₹{amount} was successful.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-lg hover:bg-slate-200">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <h1 className="text-xl font-bold text-slate-800 flex items-center">
          <Icon className="w-5 h-5 mr-2 text-slate-600" />
          {config.label} Recharge
        </h1>
      </div>

      {status === 'error' && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {type === 'electricity' ? 'Consumer Number' : 'Mobile/Subscriber Number'}
          </label>
          <input 
            type="text" 
            required 
            value={number}
            onChange={e => setNumber(e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder={`Enter ${type === 'electricity' ? 'consumer' : '10-digit'} number`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Operator / Provider</label>
          <select 
            required
            value={operator}
            onChange={e => setOperator(e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
          >
            <option value="" disabled>Select Operator</option>
            {config.operators.map(op => (
              <option key={op} value={op}>{op}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
          <input 
            type="number" 
            required 
            min="1"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="Enter amount"
          />
        </div>
        
        <button 
          type="submit" 
          disabled={status === 'loading'}
          className="w-full py-4 text-white font-bold rounded-xl shadow-md hover:opacity-90 transition-opacity mt-4 disabled:opacity-50"
          style={{ backgroundColor: settings.primaryButtonColor }}
        >
          {status === 'loading' ? 'Processing...' : `Pay ₹ ${amount || '0'}`}
        </button>
      </form>
    </div>
  );
}
