const getSafeStorage = () => {
  let memoryStorage: Record<string, string> = {};
  
  return {
    getItem: (key: string): string | null => {
      try {
        return window.localStorage.getItem(key);
      } catch (e) {
        return memoryStorage[key] || null;
      }
    },
    setItem: (key: string, value: string): void => {
      try {
        window.localStorage.setItem(key, value);
      } catch (e) {
        memoryStorage[key] = value;
      }
    },
    removeItem: (key: string): void => {
      try {
        window.localStorage.removeItem(key);
      } catch (e) {
        delete memoryStorage[key];
      }
    }
  };
};

export const safeStorage = getSafeStorage();
