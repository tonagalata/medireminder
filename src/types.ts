export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: number;
  times: string[];
  refills?: number;
  createdAt: string;
}

export interface MedicationHistory {
  id: string;
  medicationId: string;
  medicationName: string;
  takenAt: string;
}

export interface Settings {
  alarmSound: string;
} 