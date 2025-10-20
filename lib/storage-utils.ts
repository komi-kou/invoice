// LocalStorage操作のユーティリティ関数

export const safeJsonParse = <T>(jsonString: string | null, defaultValue: T): T => {
  if (!jsonString) return defaultValue;
  
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('JSON parse error:', error);
    return defaultValue;
  }
};

export const safeLocalStorageGet = (key: string): string | null => {
  try {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`LocalStorage get error for key ${key}:`, error);
    return null;
  }
};

export const safeLocalStorageSet = (key: string, value: string): boolean => {
  try {
    if (typeof window === 'undefined') return false;
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`LocalStorage set error for key ${key}:`, error);
    // ストレージが満杯の場合の処理
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      alert('ストレージの容量が不足しています。古いデータを削除してください。');
    }
    return false;
  }
};

export const safeLocalStorageRemove = (key: string): boolean => {
  try {
    if (typeof window === 'undefined') return false;
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`LocalStorage remove error for key ${key}:`, error);
    return false;
  }
};