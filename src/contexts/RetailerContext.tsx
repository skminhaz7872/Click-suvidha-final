import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

import { safeStorage } from "@/src/utils/storage";

export type RetailerTransaction = {
  id: string;
  date: string;
  type: string;
  number: string;
  operator: string;
  amount: number;
  status: string;
};

type RetailerContextType = {
  balance: number;
  transactions: RetailerTransaction[];
  refreshData: () => Promise<void>;
};

const RetailerContext = createContext<RetailerContextType>({
  balance: 0,
  transactions: [],
  refreshData: async () => {}
});

export const RetailerProvider = ({ children }: { children: React.ReactNode }) => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<RetailerTransaction[]>([]);

  useEffect(() => {
    let unsubUser: (() => void) | undefined;
    let unsubTx: (() => void) | undefined;

    const setupListeners = (uid: string) => {
      // Listen to user balance
      unsubUser = onSnapshot(doc(db, 'users', uid), (docSnap) => {
        if (docSnap.exists()) {
          setBalance(docSnap.data().balance || 0);
        }
      });

      // Listen to user transactions
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', uid)
      );
      unsubTx = onSnapshot(q, (snapshot) => {
        const txData: RetailerTransaction[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          txData.push({
            id: doc.id,
            date: data.createdAt?.toDate ? data.createdAt.toDate().toLocaleString() : new Date().toLocaleString(),
            type: data.type || 'Transaction',
            number: data.description || '-',
            operator: data.operator || '-',
            amount: data.amount || 0,
            status: data.status || 'Success',
            ...data
          });
        });
        txData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setTransactions(txData);
      });
    };

    const storedUserId = safeStorage.getItem('user_id');
    
    // If we have a stored user id (meaning manual login), use it right away
    if (storedUserId) {
      setupListeners(storedUserId);
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      // If we don't have a stored user id, fallback to auth state (Google login)
      if (user && !storedUserId) {
        setupListeners(user.uid);
      } else if (!user && !storedUserId) {
        setBalance(0);
        setTransactions([]);
        if (unsubUser) unsubUser();
        if (unsubTx) unsubTx();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubUser) unsubUser();
      if (unsubTx) unsubTx();
    };
  }, []);

  const refreshData = async () => {
    // Realtime listeners handle this automatically now
  };

  return (
    <RetailerContext.Provider value={{ balance, transactions, refreshData }}>
      {children}
    </RetailerContext.Provider>
  );
};

export const useRetailer = () => useContext(RetailerContext);
