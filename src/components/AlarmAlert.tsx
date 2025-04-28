import { useState, useEffect, useRef } from 'react';
import { Medication } from '../types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Stack,
  keyframes,
} from '@mui/material';
import { VolumeUp, VolumeOff } from '@mui/icons-material';

interface AlarmAlertProps {
  medication: Medication;
  onMarkAsTaken: (id: string) => void;
  onSnooze: (id: string, minutes: number) => void;
  onClose: () => void;
  alarmSound: string;
}

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

export function AlarmAlert({
  medication,
  onMarkAsTaken,
  onSnooze,
  onClose,
  alarmSound,
}: AlarmAlertProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio(`/sounds/${alarmSound}.mp3`);
    audioRef.current.loop = true;
    
    // Play audio with error handling
    const playAudio = async () => {
      try {
        if (audioRef.current) {
          await audioRef.current.play();
        }
      } catch (error) {
        console.error('Error playing alarm sound:', error);
      }
    };
    
    playAudio();

    // Update elapsed time every second
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    return () => {
      clearInterval(interval);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [alarmSound]);

  const handleMuteToggle = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleMarkAsTaken = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    onMarkAsTaken(medication.id);
    onClose();
  };

  const handleSnooze = (minutes: number) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    onSnooze(medication.id, minutes);
    onClose();
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog
      open={true}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          animation: `${pulse} 2s infinite`,
          bgcolor: 'error.light',
          color: 'error.contrastText',
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="div">
            Medication Reminder
          </Typography>
          <IconButton onClick={handleMuteToggle} color="inherit">
            {isMuted ? <VolumeOff /> : <VolumeUp />}
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <Typography variant="h4" align="center">
            {medication.name}
          </Typography>
          <Typography variant="h6" align="center">
            {medication.dosage}
          </Typography>
          <Typography variant="body1" align="center">
            Time elapsed: {formatTime(elapsedTime)}
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3, flexDirection: 'column', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          onClick={handleMarkAsTaken}
        >
          Mark as Taken
        </Button>
        <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
          <Button
            variant="outlined"
            color="inherit"
            fullWidth
            onClick={() => handleSnooze(5)}
          >
            Snooze 5m
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            fullWidth
            onClick={() => handleSnooze(15)}
          >
            Snooze 15m
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            fullWidth
            onClick={() => handleSnooze(30)}
          >
            Snooze 30m
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
} 