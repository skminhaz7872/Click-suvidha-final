import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

export type ThemeSettings = {
  companyName: string;
  sidebarColor: string;
  headerColor: string;
  primaryButtonColor: string;
  logoUrl: string;
};

const defaultSettings: ThemeSettings = {
  companyName: 'CLICK SUVIDHA',
  sidebarColor: '#0f172a',
  headerColor: '#ffffff',
  primaryButtonColor: '#2563eb',
  logoUrl: ''
};

export const ThemeContext = createContext<{
  settings: ThemeSettings;
  updateSettings: (s: Partial<ThemeSettings>) => void;
}>({
  settings: defaultSettings,
  updateSettings: () => {}
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as ThemeSettings;
        setSettings(data);
        document.title = data.companyName + ' Admin Panel';
      }
    }, (err) => {
      console.error('Failed to fetch settings:', err);
    });

    return () => unsub();
  }, []);

  const updateSettings = async (newSettings: Partial<ThemeSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    document.title = updated.companyName + ' Admin Panel';
    try {
      await setDoc(doc(db, 'settings', 'global'), updated, { merge: true });
    } catch (err) {
      console.error('Failed to update settings:', err);
    }
  };

  return (
    <ThemeContext.Provider value={{ settings, updateSettings }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
