import express from 'express';
import cors from 'cors';

const app = express();
const port = 3000;

// In-memory storage
let medications = [];
let medicationHistory = [];

app.use(cors());
app.use(express.json());

// Get all medications
app.get('/api/medications', (req, res) => {
  res.json(medications);
});

// Add a new medication
app.post('/api/medications', (req, res) => {
  const medication = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  medications.push(medication);
  res.status(201).json(medication);
});

// Update a medication
app.put('/api/medications/:id', (req, res) => {
  const { id } = req.params;
  const index = medications.findIndex(m => m.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Medication not found' });
  }
  medications[index] = { ...medications[index], ...req.body };
  res.json(medications[index]);
});

// Delete a medication
app.delete('/api/medications/:id', (req, res) => {
  const { id } = req.params;
  const index = medications.findIndex(m => m.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Medication not found' });
  }
  medications.splice(index, 1);
  res.status(204).send();
});

// Mark medication as taken
app.post('/api/medications/:id/taken', (req, res) => {
  const { id } = req.params;
  const { historyEntry } = req.body;
  const medication = medications.find(m => m.id === id);
  if (!medication) {
    return res.status(404).json({ error: 'Medication not found' });
  }

  // Add history entry
  medication.history = medication.history || [];
  medication.history.push(historyEntry);

  // Update refills if applicable
  if (medication.refills !== undefined) {
    medication.refills = Math.max(0, medication.refills - 1);
  }

  res.json(medication);
});

// Snooze medication
app.post('/api/medications/:id/snooze', (req, res) => {
  const { id } = req.params;
  const { historyEntry } = req.body;
  const medication = medications.find(m => m.id === id);
  if (!medication) {
    return res.status(404).json({ error: 'Medication not found' });
  }

  // Add history entry
  medication.history = medication.history || [];
  medication.history.push(historyEntry);

  res.json(medication);
});

// Skip medication
app.post('/api/medications/:id/skip', (req, res) => {
  const { id } = req.params;
  const { historyEntry } = req.body;
  const medication = medications.find(m => m.id === id);
  if (!medication) {
    return res.status(404).json({ error: 'Medication not found' });
  }

  // Add history entry
  medication.history = medication.history || [];
  medication.history.push(historyEntry);

  res.json(medication);
});

// Get medication history
app.get('/api/history', (req, res) => {
  res.json(medicationHistory);
});

// Clear medication history
app.delete('/api/history', (req, res) => {
  medicationHistory = [];
  res.status(204).send();
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 