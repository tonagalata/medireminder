import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Box,
  Stack,
  Paper,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  Switch,
  FormControlLabel as MuiFormControlLabel,
  TextField,
  IconButton,
  Grid,
  Slider,
  Input,
} from '@mui/material';
import { Close as CloseIcon, Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { ChromePicker } from 'react-color';

const ALARM_SOUNDS = [
  { id: 'default', name: 'Default' },
  { id: 'bell', name: 'Bell' },
  { id: 'digital', name: 'Digital' },
  { id: 'gentle', name: 'Gentle' },
];

const DEFAULT_THEME = {
  primary: '#1976d2',
  secondary: '#dc004e',
  background: '#ffffff',
  text: '#000000',
  alarm: '#f44336',
};

export function Settings() {
  const { settings, updateSettings } = useApp();
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSoundChange = (sound: string) => {
    updateSettings({ alarmSound: sound });
  };

  const handleNotificationToggle = (enabled: boolean) => {
    updateSettings({ notificationEnabled: enabled });
  };

  const handleThemeChange = (color: string, type: keyof typeof settings.theme) => {
    updateSettings({
      theme: {
        ...settings.theme,
        [type]: color,
      },
    });
  };

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateSettings({
          profile: {
            ...settings.profile,
            picture: reader.result as string,
          },
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNameChange = (name: string) => {
    updateSettings({
      profile: {
        ...settings.profile,
        name,
      },
    });
  };

  const handleResetTheme = () => {
    updateSettings({
      theme: DEFAULT_THEME,
    });
  };

  return (
    <Dialog open={true} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">Settings</Typography>
          <IconButton onClick={() => window.location.reload()}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={4} sx={{ mt: 2 }}>
          {/* Profile Settings */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Profile
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '2px solid',
                    borderColor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'grey.200',
                  }}
                >
                  {settings.profile?.picture ? (
                    <img
                      src={settings.profile.picture}
                      alt="Profile"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <AddIcon sx={{ fontSize: 40, color: 'grey.500' }} />
                  )}
                </Box>
                <Button
                  variant="outlined"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Change Picture
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  ref={fileInputRef}
                  onChange={handleProfilePictureChange}
                />
              </Box>
              <TextField
                label="Name"
                value={settings.profile?.name || ''}
                onChange={(e) => handleNameChange(e.target.value)}
                fullWidth
              />
            </Stack>
          </Paper>

          {/* Theme Settings */}
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Theme</Typography>
              <Button variant="outlined" onClick={handleResetTheme}>
                Reset Theme
              </Button>
            </Box>
            <Grid container spacing={2}>
              {Object.entries(settings.theme || DEFAULT_THEME).map(([key, color]) => (
                <Grid item xs={12} sm={6} key={key}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                        bgcolor: color,
                        border: '1px solid',
                        borderColor: 'divider',
                        cursor: 'pointer',
                      }}
                      onClick={() => setShowColorPicker(key)}
                    />
                    <Typography sx={{ textTransform: 'capitalize' }}>{key}</Typography>
                    {showColorPicker === key && (
                      <Box
                        sx={{
                          position: 'absolute',
                          zIndex: 2,
                        }}
                      >
                        <Box
                          sx={{
                            position: 'fixed',
                            top: 0,
                            right: 0,
                            bottom: 0,
                            left: 0,
                          }}
                          onClick={() => setShowColorPicker(null)}
                        />
                        <ChromePicker
                          color={color}
                          onChange={(color) => handleThemeChange(color.hex, key as keyof typeof settings.theme)}
                        />
                      </Box>
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Alarm Settings */}
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

          {/* Notification Settings */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Notifications
            </Typography>
            <MuiFormControlLabel
              control={
                <Switch
                  checked={settings.notificationEnabled}
                  onChange={(e) => handleNotificationToggle(e.target.checked)}
                />
              }
              label="Enable Notifications"
            />
          </Paper>
        </Stack>
      </DialogContent>
    </Dialog>
  );
} 