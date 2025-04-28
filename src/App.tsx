import { useState, useEffect } from 'react'
import { MedicationCard } from './components/MedicationCard'
import { MedicationForm } from './components/MedicationForm'
import { Settings } from './components/Settings'
import { AlarmAlert } from './components/AlarmAlert'
import { useApp } from './context/AppContext'
import { Medication } from './types'
import { Settings as SettingsIcon } from '@mui/icons-material'
import {
  AppBar,
  Box,
  Container,
  IconButton,
  Toolbar,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Paper,
  Snackbar,
  Alert,
} from '@mui/material'

// Interface for snoozed medications
interface SnoozedMedication {
  id: string;
  snoozeUntil: number; // timestamp
}

export function App() {
  const { medications, settings, markAsTaken } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [editingMedication, setEditingMedication] = useState<Medication | undefined>()
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')
  const [showNotificationAlert, setShowNotificationAlert] = useState(false)
  const [activeAlarm, setActiveAlarm] = useState<Medication | null>(null)
  const [snoozedMedications, setSnoozedMedications] = useState<SnoozedMedication[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Load snoozed medications from localStorage on initial load
  useEffect(() => {
    const storedSnoozed = localStorage.getItem('snoozedMedications');
    if (storedSnoozed) {
      try {
        const parsed = JSON.parse(storedSnoozed);
        // Filter out expired snoozes
        const now = Date.now();
        const validSnoozes = parsed.filter((s: SnoozedMedication) => s.snoozeUntil > now);
        setSnoozedMedications(validSnoozes);
        
        // Update localStorage with only valid snoozes
        if (validSnoozes.length !== parsed.length) {
          localStorage.setItem('snoozedMedications', JSON.stringify(validSnoozes));
        }
      } catch (error) {
        console.error('Error parsing snoozed medications:', error);
      }
    }
  }, []);

  // Request notification permission when the app loads
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
      
      if (Notification.permission === 'default') {
        setShowNotificationAlert(true)
      }
    }
  }, [])

  // Check for medication reminders every minute
  useEffect(() => {
    const checkReminders = () => {
      const now = Date.now();
      const currentTime = new Date();
      const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
      
      // First check if any snoozed medications are due
      const updatedSnoozed = snoozedMedications.filter(snoozed => {
        if (snoozed.snoozeUntil <= now) {
          // This medication is due now
          const medication = medications.find(m => m.id === snoozed.id);
          if (medication) {
            setActiveAlarm(medication);
          }
          return false; // Remove from snoozed list
        }
        return true; // Keep in snoozed list
      });
      
      if (updatedSnoozed.length !== snoozedMedications.length) {
        setSnoozedMedications(updatedSnoozed);
        localStorage.setItem('snoozedMedications', JSON.stringify(updatedSnoozed));
      }
      
      // If there's already an active alarm, don't check for new ones
      if (activeAlarm) {
        return;
      }
      
      // Check for new medications due
      medications.forEach(medication => {
        // Skip medications that are snoozed
        if (snoozedMedications.some(s => s.id === medication.id)) {
          return;
        }
        
        medication.times.forEach(time => {
          const [hours, minutes] = time.split(':').map(Number);
          const timeInMinutes = hours * 60 + minutes;
          
          // If it's time to take the medication (within 1 minute of the scheduled time)
          if (Math.abs(currentMinutes - timeInMinutes) <= 1) {
            setActiveAlarm(medication);
          }
        });
      });
    };
    
    // Check immediately and then every minute
    checkReminders();
    const interval = setInterval(checkReminders, 60000);
    
    return () => clearInterval(interval);
  }, [medications, snoozedMedications, activeAlarm]);

  const handleEdit = (medication: Medication) => {
    setEditingMedication(medication)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingMedication(undefined)
  }

  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission)
        setShowNotificationAlert(false)
      })
    }
  }

  const handleMarkAsTaken = async (id: string) => {
    try {
      await markAsTaken(id);
      setActiveAlarm(null);
      
      // Also remove from snoozed list if it was there
      const updatedSnoozed = snoozedMedications.filter(s => s.id !== id);
      if (updatedSnoozed.length !== snoozedMedications.length) {
        setSnoozedMedications(updatedSnoozed);
        localStorage.setItem('snoozedMedications', JSON.stringify(updatedSnoozed));
      }
    } catch (error) {
      console.error('Error marking medication as taken:', error);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An error occurred while marking the medication as taken');
      }
    }
  };

  const handleSnooze = (id: string, minutes: number) => {
    const snoozeUntil = Date.now() + minutes * 60 * 1000;
    
    // Update snoozed medications
    const updatedSnoozed = [
      ...snoozedMedications.filter(s => s.id !== id),
      { id, snoozeUntil }
    ];
    
    setSnoozedMedications(updatedSnoozed);
    localStorage.setItem('snoozedMedications', JSON.stringify(updatedSnoozed));
    setActiveAlarm(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            MediReminder
          </Typography>
          <IconButton
            onClick={() => setShowSettings(true)}
            color="inherit"
            aria-label="settings"
          >
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        {showSettings ? (
          <Settings onClose={() => setShowSettings(false)} />
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h4" component="h2">
                My Medications
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setShowForm(true)}
              >
                Add Medication
              </Button>
            </Box>

            <Dialog
              open={showForm}
              onClose={handleCloseForm}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle>
                {editingMedication ? 'Edit Medication' : 'Add Medication'}
              </DialogTitle>
              <DialogContent>
                <MedicationForm
                  medication={editingMedication}
                  onClose={handleCloseForm}
                />
              </DialogContent>
            </Dialog>

            {medications.length > 0 ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
                {medications.map(medication => (
                  <Box key={medication.id}>
                    <MedicationCard
                      medication={medication}
                      onEdit={() => handleEdit(medication)}
                    />
                  </Box>
                ))}
              </Box>
            ) : (
              <Paper
                sx={{
                  p: 4,
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Typography color="text.secondary">
                  No medications added yet.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setShowForm(true)}
                >
                  Add Your First Medication
                </Button>
              </Paper>
            )}
          </>
        )}
      </Container>

      {/* Active Alarm Dialog */}
      {activeAlarm && (
        <AlarmAlert
          medication={activeAlarm}
          onMarkAsTaken={handleMarkAsTaken}
          onSnooze={handleSnooze}
          onClose={() => setActiveAlarm(null)}
          alarmSound={settings.alarmSound}
        />
      )}

      <Snackbar 
        open={showNotificationAlert} 
        autoHideDuration={6000} 
        onClose={() => setShowNotificationAlert(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowNotificationAlert(false)} 
          severity="info" 
          sx={{ width: '100%' }}
          action={
            <Button color="inherit" size="small" onClick={requestNotificationPermission}>
              Enable
            </Button>
          }
        >
          Enable notifications to receive medication reminders
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar 
        open={!!errorMessage} 
        autoHideDuration={6000} 
        onClose={() => setErrorMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setErrorMessage(null)} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}
