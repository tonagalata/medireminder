import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Medication, MedicationHistory, Settings } from '../types';

interface AppContextType {
  medications: Medication[];
  history: MedicationHistory[];
  settings: Settings;
  addMedication: (medication: Omit<Medication, 'id' | 'createdAt'>) => Promise<void>;
  updateMedication: (id: string, medication: Partial<Medication>) => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;
  markAsTaken: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  updateSettings: (settings: Partial<Settings>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const API_URL = 'http://localhost:3000/api';

export function AppProvider({ children }: { children: ReactNode }) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [history, setHistory] = useState<MedicationHistory[]>([]);
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('settings');
    return saved ? JSON.parse(saved) : { alarmSound: 'default' };
  });

  useEffect(() => {
    fetchMedications();
    fetchHistory();
  }, []);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  const fetchMedications = async () => {
    try {
      const response = await fetch(`${API_URL}/medications`);
      const data = await response.json();
      setMedications(data);
    } catch (error) {
      console.error('Error fetching medications:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/history`);
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const addMedication = async (medication: Omit<Medication, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch(`${API_URL}/medications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medication),
      });
      const data = await response.json();
      setMedications(prev => [...prev, data]);
    } catch (error) {
      console.error('Error adding medication:', error);
      throw error;
    }
  };

  const updateMedication = async (id: string, medication: Partial<Medication>) => {
    try {
      const response = await fetch(`${API_URL}/medications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medication),
      });
      const data = await response.json();
      setMedications(prev => prev.map(m => m.id === id ? data : m));
    } catch (error) {
      console.error('Error updating medication:', error);
      throw error;
    }
  };

  const deleteMedication = async (id: string) => {
    try {
      await fetch(`${API_URL}/medications/${id}`, { method: 'DELETE' });
      setMedications(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error('Error deleting medication:', error);
      throw error;
    }
  };

  const markAsTaken = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/medications/${id}/taken`, {
        method: 'POST',
      });
      const { medication, historyEntry } = await response.json();
      setMedications(prev => prev.map(m => m.id === id ? medication : m));
      setHistory(prev => [...prev, historyEntry]);
    } catch (error) {
      console.error('Error marking medication as taken:', error);
      throw error;
    }
  };

  const clearHistory = async () => {
    try {
      await fetch(`${API_URL}/history`, { method: 'DELETE' });
      setHistory([]);
    } catch (error) {
      console.error('Error clearing history:', error);
      throw error;
    }
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <AppContext.Provider value={{
      medications,
      history,
      settings,
      addMedication,
      updateMedication,
      deleteMedication,
      markAsTaken,
      clearHistory,
      updateSettings,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
} 