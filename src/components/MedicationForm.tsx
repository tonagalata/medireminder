import { useState, useEffect } from 'react';
import { Medication } from '../types';
import { useApp } from '../context/AppContext';
import {
  TextField,
  Button,
  Box,
  Stack,
  IconButton,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon, Close as CloseIcon, VolumeUp as VolumeUpIcon } from '@mui/icons-material';

interface MedicationFormProps {
  medication?: Medication;
  onClose: () => void;
}

export function MedicationForm({ medication, onClose }: MedicationFormProps) {
  const { addMedication, updateMedication, settings } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 1,
    times: ['09:00'],
    refills: '',
    alarmSound: settings.alarmSound || 'default',
  });

  useEffect(() => {
    if (medication) {
      setFormData({
        name: medication.name,
        dosage: medication.dosage,
        frequency: medication.frequency,
        times: medication.times,
        refills: medication.refills?.toString() || '',
        alarmSound: medication.settings?.alarmSound || settings.alarmSound || 'default',
      });
    }
  }, [medication]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const medicationData = {
      ...formData,
      refills: formData.refills ? parseInt(formData.refills) : undefined,
      settings: {
        alarmSound: formData.alarmSound,
        notificationEnabled: medication?.settings?.notificationEnabled ?? settings.notificationEnabled,
      },
    };

    try {
      if (medication) {
        await updateMedication(medication.id, medicationData);
      } else {
        await addMedication(medicationData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving medication:', error);
    }
  };

  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...formData.times];
    newTimes[index] = value;
    setFormData(prev => ({ ...prev, times: newTimes }));
  };

  const addTimeSlot = () => {
    setFormData(prev => ({
      ...prev,
      times: [...prev.times, '09:00'],
    }));
  };

  const removeTimeSlot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      times: prev.times.filter((_, i) => i !== index),
    }));
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">
            {medication ? 'Edit Medication' : 'Add Medication'}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Stack spacing={3}>
            <TextField
              label="Medication Name"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              fullWidth
            />

            <TextField
              label="Dosage"
              value={formData.dosage}
              onChange={e => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
              required
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Times per Day</InputLabel>
              <Select
                value={formData.frequency}
                label="Times per Day"
                onChange={e => setFormData(prev => ({ ...prev, frequency: Number(e.target.value) }))}
                required
              >
                {[...Array(24)].map((_, i) => (
                  <MenuItem key={i + 1} value={i + 1}>
                    {i + 1}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Times
              </Typography>
              <Stack spacing={2}>
                {formData.times.map((time, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField
                      type="time"
                      value={time}
                      onChange={e => handleTimeChange(index, e.target.value)}
                      required
                      fullWidth
                    />
                    {formData.times.length > 1 && (
                      <IconButton
                        onClick={() => removeTimeSlot(index)}
                        color="error"
                        size="small"
                      >
                        <RemoveIcon />
                      </IconButton>
                    )}
                  </Box>
                ))}
                <Button
                  startIcon={<AddIcon />}
                  onClick={addTimeSlot}
                  variant="outlined"
                >
                  Add Time
                </Button>
              </Stack>
            </Box>

            <TextField
              label="Remaining Refills (Optional)"
              type="number"
              value={formData.refills}
              onChange={e => setFormData(prev => ({ ...prev, refills: e.target.value }))}
              fullWidth
              inputProps={{ min: 0 }}
            />

            <FormControl fullWidth>
              <InputLabel id="alarm-sound-label">Alarm Sound</InputLabel>
              <Select
                labelId="alarm-sound-label"
                value={formData.alarmSound}
                label="Alarm Sound"
                onChange={e => setFormData(prev => ({ ...prev, alarmSound: e.target.value as string }))}
                startAdornment={<VolumeUpIcon fontSize="small" sx={{ mr: 1 }} />}
              >
                <MenuItem value="default">Default</MenuItem>
                <MenuItem value="bell">Bell</MenuItem>
                <MenuItem value="digital">Digital</MenuItem>
                <MenuItem value="gentle">Gentle</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button onClick={onClose} variant="outlined">
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary">
                {medication ? 'Update' : 'Add'} Medication
              </Button>
            </Box>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
} 