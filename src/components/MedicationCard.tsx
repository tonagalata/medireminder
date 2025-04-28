import { Medication } from '../types';
import { useApp } from '../context/AppContext';
import { Edit as EditIcon, Delete as DeleteIcon, History as HistoryIcon, Settings as SettingsIcon } from '@mui/icons-material';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Button,
  Box,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface MedicationCardProps {
  medication: Medication;
  onEdit: () => void;
}

export function MedicationCard({ medication, onEdit }: MedicationCardProps) {
  const { markAsTaken, deleteMedication, updateMedication } = useApp();
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [nextReminder, setNextReminder] = useState<{ time: string; isToday: boolean; minutesUntil: number }>({
    time: '',
    isToday: true,
    minutesUntil: 0
  });

  // Calculate the next reminder time
  const calculateNextReminder = () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    // Convert all times to minutes since midnight
    const timeInMinutes = medication.times.map(time => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    });
    
    // Sort times to ensure we check them in chronological order
    timeInMinutes.sort((a, b) => a - b);
    
    // Find the next time today
    let nextTimeToday = timeInMinutes.find(time => time > currentTime);
    
    if (nextTimeToday !== undefined) {
      // Next reminder is today
      const hours = Math.floor(nextTimeToday / 60);
      const minutes = nextTimeToday % 60;
      const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      const minutesUntil = nextTimeToday - currentTime;
      
      setNextReminder({
        time: formattedTime,
        isToday: true,
        minutesUntil
      });
    } else {
      // Next reminder is tomorrow (first time of the day)
      const firstTimeTomorrow = timeInMinutes[0];
      const hours = Math.floor(firstTimeTomorrow / 60);
      const minutes = firstTimeTomorrow % 60;
      const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      // Calculate minutes until tomorrow's first reminder
      const minutesUntilTomorrow = (24 * 60 - currentTime) + firstTimeTomorrow;
      
      setNextReminder({
        time: formattedTime,
        isToday: false,
        minutesUntil: minutesUntilTomorrow
      });
    }
  };

  useEffect(() => {
    calculateNextReminder();
    const interval = setInterval(calculateNextReminder, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [medication.times]);

  const handleSoundChange = (sound: string) => {
    updateMedication(medication.id, {
      settings: {
        ...medication.settings,
        alarmSound: sound
      }
    });
  };

  const handleNotificationToggle = (enabled: boolean) => {
    updateMedication(medication.id, {
      settings: {
        ...medication.settings,
        notificationEnabled: enabled
      }
    });
  };

  return (
    <>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography variant="h6">{medication.name}</Typography>
              <Box>
                <IconButton onClick={() => setShowSettings(true)} size="small">
                  <SettingsIcon />
                </IconButton>
                <IconButton onClick={() => setShowHistory(true)} size="small">
                  <HistoryIcon />
                </IconButton>
                <IconButton onClick={onEdit} size="small">
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => deleteMedication(medication.id)} size="small" color="error">
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
            
            <Typography color="text.secondary">{medication.dosage}</Typography>
            
            <Box>
              <Typography variant="subtitle2" gutterBottom>Schedule</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {medication.times.map((time, index) => (
                  <Chip key={index} label={time} size="small" />
                ))}
              </Stack>
            </Box>

            {nextReminder.time && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>Next Reminder</Typography>
                <Typography>
                  {nextReminder.time} {nextReminder.isToday ? 'today' : 'tomorrow'}
                  {nextReminder.minutesUntil > 0 && ` (in ${nextReminder.minutesUntil} minutes)`}
                </Typography>
              </Box>
            )}
          </Stack>
        </CardContent>
        <CardActions>
          <Button 
            fullWidth 
            variant="contained" 
            onClick={() => markAsTaken(medication.id)}
          >
            Mark as Taken
          </Button>
        </CardActions>
      </Card>

      {/* History Dialog */}
      <Dialog open={showHistory} onClose={() => setShowHistory(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Medication History</DialogTitle>
        <DialogContent>
          <List>
            {medication.history?.length > 0 ? (
              medication.history.map((entry, index) => (
                <ListItem key={entry.id} divider={index < medication.history.length - 1}>
                  <ListItemText
                    primary={format(new Date(entry.takenAt), 'PPpp')}
                    secondary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip 
                          label={entry.status} 
                          size="small" 
                          color={
                            entry.status === 'taken' ? 'success' : 
                            entry.status === 'snoozed' ? 'warning' : 'error'
                          }
                        />
                        {entry.snoozeDuration && (
                          <Typography variant="caption" color="text.secondary">
                            Snoozed for {entry.snoozeDuration} minutes
                          </Typography>
                        )}
                      </Stack>
                    }
                  />
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="No history available" />
              </ListItem>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHistory(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onClose={() => setShowSettings(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Medication Settings</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Alarm Sound</InputLabel>
              <Select
                value={medication.settings?.alarmSound || 'default'}
                label="Alarm Sound"
                onChange={(e) => handleSoundChange(e.target.value)}
              >
                <MenuItem value="default">Default</MenuItem>
                <MenuItem value="bell">Bell</MenuItem>
                <MenuItem value="digital">Digital</MenuItem>
                <MenuItem value="gentle">Gentle</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={medication.settings?.notificationEnabled ?? true}
                  onChange={(e) => handleNotificationToggle(e.target.checked)}
                />
              }
              label="Enable Notifications"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSettings(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 