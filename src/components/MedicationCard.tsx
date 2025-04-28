import { Medication } from '../types';
import { useApp } from '../context/AppContext';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Button,
  Box,
  Stack,
} from '@mui/material';

interface MedicationCardProps {
  medication: Medication;
  onEdit: () => void;
}

export function MedicationCard({ medication, onEdit }: MedicationCardProps) {
  const { markAsTaken, deleteMedication } = useApp();

  const getNextAlarmTime = () => {
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
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    return medication.times[0];
  };

  return (
    <Card elevation={2}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" component="h3">
              {medication.name}
            </Typography>
            <Typography color="text.secondary">
              {medication.dosage}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <IconButton
              onClick={onEdit}
              size="small"
              aria-label="edit medication"
            >
              <EditIcon />
            </IconButton>
            <IconButton
              onClick={() => deleteMedication(medication.id)}
              size="small"
              color="error"
              aria-label="delete medication"
            >
              <DeleteIcon />
            </IconButton>
          </Stack>
        </Box>

        <Stack spacing={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Next Alarm:
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {getNextAlarmTime()}
            </Typography>
          </Box>
          {medication.refills !== undefined && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Remaining Refills:
              </Typography>
              <Typography
                variant="body2"
                fontWeight="medium"
                color={medication.refills <= 5 ? 'error' : 'text.primary'}
              >
                {medication.refills}
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
  );
} 