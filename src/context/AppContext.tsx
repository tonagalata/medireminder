import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Medication, MedicationHistory, Settings } from '../types';

interface AppContextType {
  medications: Medication[];
  settings: Settings;
  addMedication: (medication: Omit<Medication, 'id' | 'createdAt' | 'settings' | 'history'>) => Promise<void>;
  updateMedication: (id: string, medication: Partial<Medication>) => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;
  markAsTaken: (id: string) => Promise<void>;
  snoozeMedication: (id: string, minutes: number) => Promise<void>;
  skipMedication: (id: string) => Promise<void>;
  updateSettings: (settings: Partial<Settings>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const API_URL = 'http://localhost:3000/api';

export function AppProvider({ children }: { children: ReactNode }) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('settings');
    return saved ? JSON.parse(saved) : { 
      alarmSound: 'default',
      notificationEnabled: true,
      theme: {
        primary: '#1976d2',
        secondary: '#dc004e',
        background: '#ffffff',
        text: '#000000',
        alarm: '#f44336',
      },
      profile: {
        picture: null,
        name: '',
      },
    };
  });

  useEffect(() => {
    fetchMedications();
  }, []);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  const fetchMedications = async () => {
    try {
      const response = await fetch(`${API_URL}/medications`);
      const data = await response.json();
      // Ensure each medication has settings and history
      const medicationsWithDefaults = data.map((med: Medication) => ({
        ...med,
        settings: med.settings || {
          alarmSound: settings.alarmSound,
          notificationEnabled: settings.notificationEnabled
        },
        history: med.history || []
      }));
      setMedications(medicationsWithDefaults);
    } catch (error) {
      console.error('Error fetching medications:', error);
    }
  };

  const addMedication = async (medication: Omit<Medication, 'id' | 'createdAt' | 'settings' | 'history'>) => {
    try {
      const response = await fetch(`${API_URL}/medications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...medication,
          settings: {
            alarmSound: settings.alarmSound,
            notificationEnabled: settings.notificationEnabled
          },
          history: []
        }),
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
      const medication = medications.find(m => m.id === id);
      if (!medication) return;

      // Get current time in HH:mm format
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      // Find the closest reminder time
      const closestTime = medication.times.reduce((closest, time) => {
        const [reminderHour, reminderMinute] = time.split(':').map(Number);
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        const timeDiff = Math.abs(
          (currentHour * 60 + currentMinute) - (reminderHour * 60 + reminderMinute)
        );
        
        if (!closest || timeDiff < closest.diff) {
          return { time, diff: timeDiff };
        }
        return closest;
      }, { time: '', diff: Infinity });

      // Check if we're within 30 minutes of the closest reminder time
      if (closestTime.diff > 30) {
        throw new Error('No active reminder for this medication at the current time');
      }

      // Check if medication was already taken for this specific time slot today
      const today = now.toISOString().split('T')[0];
      const alreadyTakenForTimeSlot = medication.history?.some(entry => {
        const entryDate = new Date(entry.takenAt);
        const entryDay = entryDate.toISOString().split('T')[0];
        const entryTime = `${entryDate.getHours().toString().padStart(2, '0')}:${entryDate.getMinutes().toString().padStart(2, '0')}`;
        
        // Check if it was taken today and for this specific time slot
        return entryDay === today && entryTime === closestTime.time && entry.status === 'taken';
      });

      if (alreadyTakenForTimeSlot) {
        throw new Error(`Medication has already been taken for the ${closestTime.time} time slot today`);
      }

      const historyEntry: MedicationHistory = {
        id: Date.now().toString(),
        medicationId: id,
        medicationName: medication.name,
        takenAt: now.toISOString(),
        status: 'taken'
      };

      const response = await fetch(`${API_URL}/medications/${id}/taken`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ historyEntry }),
      });
      
      const data = await response.json();
      setMedications(prev => prev.map(m => 
        m.id === id 
          ? { 
              ...m, 
              history: [...(m.history || []), historyEntry],
              refills: m.refills !== undefined ? Math.max(0, m.refills - 1) : undefined
            }
          : m
      ));
    } catch (error) {
      console.error('Error marking medication as taken:', error);
      throw error;
    }
  };

  const snoozeMedication = async (id: string, minutes: number) => {
    try {
      const medication = medications.find(m => m.id === id);
      if (!medication) return;

      const historyEntry: MedicationHistory = {
        id: Date.now().toString(),
        medicationId: id,
        medicationName: medication.name,
        takenAt: new Date().toISOString(),
        status: 'snoozed',
        snoozeDuration: minutes
      };

      const response = await fetch(`${API_URL}/medications/${id}/snooze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ historyEntry, minutes }),
      });
      
      const data = await response.json();
      setMedications(prev => prev.map(m => 
        m.id === id 
          ? { ...m, history: [...(m.history || []), historyEntry] }
          : m
      ));
    } catch (error) {
      console.error('Error snoozing medication:', error);
      throw error;
    }
  };

  const skipMedication = async (id: string) => {
    try {
      const medication = medications.find(m => m.id === id);
      if (!medication) return;

      const historyEntry: MedicationHistory = {
        id: Date.now().toString(),
        medicationId: id,
        medicationName: medication.name,
        takenAt: new Date().toISOString(),
        status: 'skipped'
      };

      const response = await fetch(`${API_URL}/medications/${id}/skip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ historyEntry }),
      });
      
      const data = await response.json();
      setMedications(prev => prev.map(m => 
        m.id === id 
          ? { ...m, history: [...(m.history || []), historyEntry] }
          : m
      ));
    } catch (error) {
      console.error('Error skipping medication:', error);
      throw error;
    }
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <AppContext.Provider value={{
      medications,
      settings,
      addMedication,
      updateMedication,
      deleteMedication,
      markAsTaken,
      snoozeMedication,
      skipMedication,
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