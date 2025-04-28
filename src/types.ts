export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: number;
  times: string[];
  refills?: number;
  createdAt: string;
  settings: {
    alarmSound: string;
    notificationEnabled: boolean;
  };
  history: MedicationHistory[];
}

export interface MedicationHistory {
  id: string;
  medicationId: string;
  medicationName: string;
  takenAt: string;
  status: 'taken' | 'skipped' | 'snoozed';
  snoozeDuration?: number; // in minutes, if status is 'snoozed'
}

export interface Settings {
  alarmSound: string;
  notificationEnabled: boolean;
  theme: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    alarm: string;
  };
  profile: {
    picture: string | null;
    name: string;
  };
} 