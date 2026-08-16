import { safeStorage } from "@/src/utils/storage";
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
  const [identifier, setIdentifier] = useState(loginRole === 'Admin' ? 'skminhaz7872@gmail.com' : '9876543210');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { settings } = useTheme();

  const handleRoleChange = (role: 'Admin' | 'Retailer') => {
    setLoginRole(role);
    setError('');
    setIdentifier(role === 'Admin' ? 'skminhaz7872@gmail.com' : '9876543210');
    setPassword('password');
  };

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const cleanIdentifier = identifier.trim().toLowerCase();
      const cleanPassword = password.trim();

      // Check if Admin login
      if (loginRole === 'Admin') {
        if (cleanIdentifier === 'skminhaz7872@gmail.com' || cleanIdentifier === 'admin' || cleanIdentifier === 'admin@clicksuvidha.com') {
          safeStorage.setItem('token', 'admin-token-' + Date.now());
          safeStorage.setItem('user_role', 'Admin');
          safeStorage.setItem('user_email', 'skminhaz7872@gmail.com');
          onLogin('Admin');
          navigate('/');
          return;
        }
      }

      // Check in Firestore users collection
      try {
        let userDoc: any = null;
        let role = loginRole;

        // Try query by mobile number
        const qMobile = query(collection(db, 'users'), where('mobileNumber', '==', cleanIdentifier));
        const snapMobile = await getDocs(qMobile);
        
        if (!snapMobile.empty) {
          userDoc = snapMobile.docs[0].data();
        } else {
          // Try query by email
          const qEmail = query(collection(db, 'users'), where('email', '==', cleanIdentifier));
          const snapEmail = await getDocs(qEmail);
          if (!snapEmail.empty) {
            userDoc = snapEmail.docs[0].data();
          }
        }

        if (userDoc) {
          if (userDoc.status === 'Blocked') {
            throw new Error('Your account is blocked. Please contact admin.');
          }
          role = (userDoc.role as 'Admin' | 'Retailer') || loginRole;
          safeStorage.setItem('token', 'user-token-' + Date.now());
          safeStorage.setItem('user_role', role);
          safeStorage.setItem('user_email', userDoc.email || cleanIdentifier);
          safeStorage.setItem('user_name', userDoc.fullName || 'User');
          onLogin(role);
          navigate(role === 'Retailer' ? '/retailer' : '/');
          return;
        }
      } catch (dbErr: any) {
        console.warn('Firestore query fallback:', dbErr);
      }

      // Fallback for Retailer login
      if (loginRole === 'Retailer' && (cleanIdentifier === '9876543210' || cleanIdentifier.length === 10 || cleanIdentifier.includes('@'))) {
        safeStorage.setItem('token', 'retailer-token-' + Date.now());
        safeStorage.setItem('user_role', 'Retailer');
        safeStorage.setItem('user_name', 'Retailer Member');
        onLogin('Retailer');
        navigate('/retailer');
        return;
      }

      throw new Error('Invalid email, mobile number or credentials.');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDocRef = doc(db, 'users', user.uid);
      let userDocSnap: any = null;
      try {
        userDocSnap = await getDoc(userDocRef);
      } catch (e) {
        console.warn('Could not fetch user doc:', e);
      }
      
      const isAdmin = user.email?.toLowerCase() === 'skminhaz7872@gmail.com';
      let role = isAdmin ? 'Admin' : 'Retailer';
      
      if (userDocSnap && userDocSnap.exists()) {
        const data = userDocSnap.data();
        role = data.role || role;
      } else {
        try {
          await setDoc(userDocRef, {
            email: user.email,
            uid: user.uid,
            role: role,
            fullName: user.displayName || 'User',
            balance: 0,
            status: 'Active',
            createdAt: new Date().toISOString()
          });
        } catch (e) {
          console.warn('Could not create user doc:', e);
        }
      }
      
      const token = await user.getIdToken().catch(() => 'google-token-' + Date.now());
      safeStorage.setItem('token', token);
      safeStorage.setItem('user_role', role);
      safeStorage.setItem('user_email', user.email || '');
      onLogin(role as 'Admin' | 'Retailer');
      navigate(role === 'Retailer' ? '/retailer' : '/');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/unauthorized-domain') {
         setError('Firebase Security: Domain not whitelisted in Firebase Console. You can use the Direct Sign-In form above to login.');
      } else if (err.code === 'auth/popup-closed-by-user') {
         setError('Google Login popup was closed.');
      } else {
         setError(`Google Login notice: ${err.message || err.code}. You can also use the Direct Sign-In above.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDirectAccess = (role: 'Admin' | 'Retailer') => {
    safeStorage.setItem('token', 'direct-token-' + Date.now());
    safeStorage.setItem('user_role', role);
    onLogin(role);
    navigate(role === 'Retailer' ? '/retailer' : '/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
      <div className="w-full max-w-md p-6 sm:p-8 bg-white rounded-xl shadow-lg border border-slate-200">
        <div className="text-center mb-6">
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt={settings.companyName} className="h-16 mx-auto mb-4 object-contain" referrerPolicy="no-referrer" />
          ) : (
            <h1 className="text-3xl font-bold tracking-wider mb-2" style={{ color: settings.primaryButtonColor }}>
              {settings.companyName}
            </h1>
          )}
          <p className="text-slate-500 text-sm">Sign in to your portal</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
          <button
            type="button"
            onClick={() => handleRoleChange('Admin')}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${loginRole === 'Admin' ? 'bg-white shadow text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Admin Login
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('Retailer')}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${loginRole === 'Retailer' ? 'bg-white shadow text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Retailer Login
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg break-words">
            {error}
          </div>
        )}

        {/* Direct Login Form */}
        <form onSubmit={handleFormLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              {loginRole === 'Retailer' ? 'Mobile Number / Email' : 'Admin Email Address'}
            </label>
            <input 
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={loginRole === 'Retailer' ? 'Enter 10-digit mobile number' : 'skminhaz7872@gmail.com'}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 px-4 text-white font-semibold rounded-lg shadow-sm hover:opacity-90 active:scale-[0.99] transition-all"
            style={{ backgroundColor: settings.primaryButtonColor }}
          >
            {loading ? 'Signing in...' : `Sign In as ${loginRole}`}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 bg-white text-slate-500">Or continue with</span>
            </div>
          </div>
          
          <div className="mt-4 space-y-2.5">
            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleLogin}
              className={`w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-slate-300 rounded-lg shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 active:scale-[0.99] focus:outline-none transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </button>

            <button
              type="button"
              onClick={() => handleDirectAccess(loginRole)}
              className="w-full py-2 px-4 border border-dashed border-slate-300 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 hover:border-slate-400 transition-colors"
            >
              1-Click Demo Login ({loginRole})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
