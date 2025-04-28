# MediReminder

A web application to help users manage their medications and receive timely reminders.

## Features

- Add and manage medications with dosage and schedule
- Set multiple daily reminders for each medication
- Track medication history
- Customizable alarm sounds
- Desktop notifications
- Refill tracking and reminders

## Tech Stack

- Frontend: React + Vite + TypeScript + TailwindCSS
- Backend: Node.js + Express
- Storage: In-memory (can be extended to use a database)

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/medication-reminder.git
cd medication-reminder
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. In a separate terminal, start the backend server:
```bash
node server.js
```

The application will be available at `http://localhost:5173`

## Project Structure

```
medication-reminder/
├── src/
│   ├── components/     # React components
│   ├── context/       # React context for state management
│   ├── services/      # Services for alarms and notifications
│   ├── types/         # TypeScript type definitions
│   ├── App.tsx        # Main application component
│   └── main.tsx       # Application entry point
├── server.js          # Express backend server
├── package.json       # Project dependencies
└── README.md         # Project documentation
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
