import { Medication } from '../types';
import { useApp } from '../context/AppContext';
import { Edit as EditIcon, Delete as DeleteIcon, History as HistoryIcon, Settings as SettingsIcon, VolumeUp as VolumeUpIcon } from '@mui/icons-material';
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
  Tooltip,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface MedicationCardProps {
  medication: Medication;
  onEdit: () => void;
}

export function MedicationCard({ medication, onEdit }: MedicationCardProps) {
  const { markAsTaken, deleteMedication, updateMedication, settings, deleteHistoryEntry } = useApp();
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
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderRadius: 3,
        boxShadow: 2,
        '&:hover': {
          boxShadow: 6,
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', p: 1 }}>
        <Typography variant="h6" component="h2" sx={{ fontWeight: 600, pl: 1, pt: 1 }}>
          {medication.name}
        </Typography>
        <Tooltip title="Delete Medication">
          <IconButton aria-label="delete" color="error" size="small" onClick={() => deleteMedication(medication.id)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <Divider />
      <CardContent sx={{ flexGrow: 1, pt: 2 }}>
        <Stack spacing={1}>
          <Typography variant="body1" color="text.secondary">
            {medication.dosage}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              Times:
            </Typography>
            {medication.times.map((time, idx) => (
              <Chip key={idx} label={time} size="small" color="primary" variant="outlined" />
            ))}
          </Box>
          {medication.refills !== undefined && (
            <Typography variant="body2" color="text.secondary">
              Refills remaining: {medication.refills}
            </Typography>
          )}
        </Stack>
      </CardContent>
      <Divider />
      <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
        <Button
          size="small"
          color="primary"
          onClick={() => onEdit()}
        >
          Edit
        </Button>
        <Button
          size="small"
          color="primary"
          onClick={() => setShowHistory(true)}
        >
          History
        </Button>
      </CardActions>

      {/* History Dialog */}
      <Dialog
        open={showHistory}
        onClose={() => setShowHistory(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Medication History</DialogTitle>
        <DialogContent>
          <List>
            {medication.history?.map((entry, idx) => (
              <>
                <ListItem key={entry.id} alignItems="flex-start" secondaryAction={
                  <Tooltip title="Delete Entry">
                    <IconButton edge="end" aria-label="delete-history" onClick={() => deleteHistoryEntry(medication.id, entry.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                }>
                  <ListItemText
                    primary={<>
                      <Chip
                        label={entry.status}
                        size="small"
                        color={
                          entry.status === 'taken' ? 'success' :
                          entry.status === 'skipped' ? 'error' :
                          entry.status === 'snoozed' ? 'warning' : 'default'
                        }
                        sx={{ mr: 1, textTransform: 'capitalize' }}
                      />
                      {format(new Date(entry.takenAt), 'PPpp')}
                    </>}
                  />
                </ListItem>
                {idx < (medication.history?.length || 0) - 1 && <Divider component="li" />}
              </>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHistory(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
} 