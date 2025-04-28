import { useApp } from '../context/AppContext';
import {
  Box,
  Typography,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  Stack,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';

const ALARM_SOUNDS = [
  { id: 'default', name: 'Default' },
  { id: 'bell', name: 'Bell' },
  { id: 'chime', name: 'Chime' },
  { id: 'digital', name: 'Digital' },
  { id: 'gentle', name: 'Gentle' },
];

interface SettingsProps {
  onClose: () => void;
}

export function Settings({ onClose }: SettingsProps) {
  const { settings, updateSettings, history, clearHistory } = useApp();

  const handleSoundChange = (soundId: string) => {
    updateSettings({ alarmSound: soundId });
    // Play the sound for preview
    const audio = new Audio(`/sounds/${soundId}.mp3`);
    audio.play();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h2">
          Settings
        </Typography>
        <Button onClick={onClose} variant="outlined">
          Back
        </Button>
      </Box>

      <Stack spacing={4}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Alarm Sound
          </Typography>
          <RadioGroup
            value={settings.alarmSound}
            onChange={(e) => handleSoundChange(e.target.value)}
          >
            {ALARM_SOUNDS.map(sound => (
              <FormControlLabel
                key={sound.id}
                value={sound.id}
                control={<Radio />}
                label={sound.name}
              />
            ))}
          </RadioGroup>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Medication History
            </Typography>
            <Button
              onClick={clearHistory}
              variant="outlined"
              color="error"
            >
              Clear History
            </Button>
          </Box>

          <Typography color="text.secondary" gutterBottom>
            {history.length} entries in history
          </Typography>

          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {history.map((entry, index) => (
              <Box key={entry.id}>
                <ListItem>
                  <ListItemText
                    primary={entry.medicationName}
                    secondary={new Date(entry.takenAt).toLocaleString()}
                  />
                </ListItem>
                {index < history.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        </Paper>
      </Stack>
    </Box>
  );
} 