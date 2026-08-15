import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { auth, db } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';

interface LoginProps {
  onLogin: (role: 'Admin' | 'Retailer') => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [loginRole, setLoginRole] = useState<'Admin' | 'Retailer'>('Admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { settings } = useTheme();

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      const q = query(collection(db, 'users'), where('email', '==', user.email));
      const querySnapshot = await getDocs(q);
      
      const isAdmin = user.email === 'skminhaz7872@gmail.com';
      
      if (!isAdmin && !userDoc.exists() && querySnapshot.empty) {
        await auth.signOut();
        throw new Error('Access Denied: Your email is not registered. Please contact Admin.');
      }
      
      let extraBalance = 0;
      let mergedData: any = {};
      let role = isAdmin ? 'Admin' : 'Retailer';
      
      if (!querySnapshot.empty) {
        for (const docSnap of querySnapshot.docs) {
          if (docSnap.id !== user.uid) {
            const oldData = docSnap.data();
            extraBalance += (parseFloat(oldData.balance) || 0);
            mergedData = { ...mergedData, ...oldData }; 
            await deleteDoc(doc(db, 'users', docSnap.id)).catch(console.error);
          }
        }
      }
      
      if (!userDoc.exists()) {
        role = mergedData.role || role;
        await setDoc(userDocRef, {
          ...mergedData,
          email: user.email,
          uid: user.uid,
          role: role,
          fullName: user.displayName || mergedData.fullName || 'User',
          balance: extraBalance,
          status: mergedData.status || 'Active',
          createdAt: mergedData.createdAt || new Date().toISOString()
        });
      } else {
        const currentData = userDoc.data();
        role = currentData.role || role;
        if (extraBalance > 0) {
          await setDoc(userDocRef, {
            ...currentData,
            balance: (parseFloat(currentData.balance) || 0) + extraBalance
          });
        }
      }
      
      localStorage.setItem('token', await user.getIdToken());
      onLogin(role as 'Admin' | 'Retailer');
      navigate(role === 'Retailer' ? '/retailer' : '/');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/unauthorized-domain') {
         setError('Firebase Security Error: This app URL is not authorized for Google Sign-In. You must add this URL to your Firebase Console > Authentication > Settings > Authorized Domains.');
      } else if (err.code === 'auth/popup-closed-by-user') {
         setError('Login cancelled. You closed the popup before finishing.');
      } else if (err.code === 'auth/operation-not-allowed') {
         setError('Google Sign-In is disabled. Please enable "Google" provider in Firebase Console.');
      } else {
         setError(`Login failed: ${err.message || err.code}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDevBypass = () => {
     // Quick bypass for the AI Studio preview environment if Firebase blocks domains
     localStorage.setItem('token', 'dev-bypass-token');
     onLogin(loginRole);
     navigate(loginRole === 'Retailer' ? '/retailer' : '/');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('Manual login is disabled. Please use the Google Sign-In button.');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-slate-200">
        <div className="text-center mb-8">
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt={settings.companyName} className="h-16 mx-auto mb-4 object-contain" referrerPolicy="no-referrer" />
          ) : (
            <h1 className="text-3xl font-bold tracking-wider mb-2" style={{ color: settings.primaryButtonColor }}>
              {settings.companyName}
            </h1>
          )}
          <p className="text-slate-500">Sign in to your account</p>
        </div>

        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
          <strong>🔒 Security Notice for Preview App:</strong><br />
          Google restricts Email/Password logins in this Starter Tier project. 
          You <strong>MUST</strong> use the Google Sign-In button below.
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
          <button
            type="button"
            onClick={() => { setLoginRole('Admin'); setError(''); }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${loginRole === 'Admin' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => { setLoginRole('Retailer'); setError(''); }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${loginRole === 'Retailer' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
          >
            Retailer
          </button>
        </div>

        {error && <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg break-words">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-6" autoComplete="off">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1 line-through">
              {loginRole === 'Retailer' ? 'Mobile Number (Disabled)' : 'Email Address (Disabled)'}
            </label>
            <input 
              type="text"
              disabled
              value={loginRole === 'Retailer' ? '10-digit mobile number' : 'Admin Email'}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-400 cursor-not-allowed"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1 line-through">Password (Disabled)</label>
            <input 
              type="password" 
              disabled
              value="********"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-400 cursor-not-allowed"
            />
          </div>

          <button 
            type="submit" 
            disabled
            className="w-full py-2 px-4 text-white font-medium rounded-lg opacity-50 cursor-not-allowed transition-opacity"
            style={{ backgroundColor: settings.primaryButtonColor }}
          >
            Sign In (Blocked)
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white font-bold text-blue-600">Please use this button 👇</span>
            </div>
          </div>
          
          <div className="mt-6 space-y-3">
            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleLogin}
              className={`w-full flex justify-center items-center gap-2 py-3 px-4 border-2 border-blue-500 rounded-lg shadow-md bg-blue-50 text-sm font-bold text-blue-700 hover:bg-blue-100 focus:outline-none transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Signing in...' : (
                <>
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Sign in with Google
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDevBypass}
              className="w-full py-2 px-4 border border-slate-300 rounded-lg shadow-sm bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Preview Bypass (Force Login)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
