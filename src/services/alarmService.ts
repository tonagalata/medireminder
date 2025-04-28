import { Medication } from '../types';

class AlarmService {
  private alarms: Map<string, NodeJS.Timeout> = new Map();
  private audio: HTMLAudioElement | null = null;

  constructor() {
    // Request notification permission
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }

  private createAudio(soundId: string) {
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
    this.audio = new Audio(`/sounds/${soundId}.mp3`);
    return this.audio;
  }

  private showNotification(medication: Medication) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Time to take your medication!', {
        body: `It's time to take ${medication.name} - ${medication.dosage}`,
        icon: '/favicon.ico',
      });
    }
  }

  private scheduleNextAlarm(medication: Medication) {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const nextTime = medication.times
      .map(time => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
      })
      .find(time => time > currentTime);

    if (nextTime) {
      const hours = Math.floor(nextTime / 60);
      const minutes = nextTime % 60;
      const nextAlarm = new Date();
      nextAlarm.setHours(hours, minutes, 0, 0);
      
      const delay = nextAlarm.getTime() - now.getTime();
      if (delay > 0) {
        this.setAlarm(medication, delay);
      }
    } else {
      // Schedule for next day
      const firstTime = medication.times[0];
      const [hours, minutes] = firstTime.split(':').map(Number);
      const nextAlarm = new Date();
      nextAlarm.setDate(nextAlarm.getDate() + 1);
      nextAlarm.setHours(hours, minutes, 0, 0);
      
      const delay = nextAlarm.getTime() - now.getTime();
      this.setAlarm(medication, delay);
    }
  }

  setAlarm(medication: Medication, delay: number) {
    // Clear existing alarm if any
    this.clearAlarm(medication.id);

    const timeout = setTimeout(() => {
      this.showNotification(medication);
      const audio = this.createAudio('default'); // You can get the sound from settings
      audio?.play();
    }, delay);

    this.alarms.set(medication.id, timeout);
  }

  clearAlarm(medicationId: string) {
    const existingAlarm = this.alarms.get(medicationId);
    if (existingAlarm) {
      clearTimeout(existingAlarm);
      this.alarms.delete(medicationId);
    }
  }

  clearAllAlarms() {
    this.alarms.forEach(alarm => clearTimeout(alarm));
    this.alarms.clear();
  }

  scheduleMedication(medication: Medication) {
    this.scheduleNextAlarm(medication);
  }
}

export const alarmService = new AlarmService(); 