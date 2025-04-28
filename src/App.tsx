import { useState } from 'react'
import { MedicationCard } from './components/MedicationCard'
import { MedicationForm } from './components/MedicationForm'
import { Settings } from './components/Settings'
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
} from '@mui/material'

export function App() {
  const { medications } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [editingMedication, setEditingMedication] = useState<Medication | undefined>()

  const handleEdit = (medication: Medication) => {
    setEditingMedication(medication)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingMedication(undefined)
  }

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
    </Box>
  )
}
