# Global Thermonuclear War Simulator

A web-based ICBM launch simulator inspired by the 1983 film "WarGames". Users can launch ICBMs at cities worldwide, with the system tracking missile trajectories and impacts in real-time.

## Visual Design
- Retro aesthetic reminiscent of WarGames
- Dark background with white vector graphics
- World map with white country outlines
- Missile trajectories shown as white parabolic arcs
- Impact locations marked with white circles

## Key Features
- OAuth-based authentication (Google/GitHub)
- City targeting by name or coordinates
- Real-time missile trajectory visualization
- API access with key management
- Per-user missile limits
- Administrative controls

## Technical Stack
- Backend: FastAPI + SQLite (development) / Supabase (production)
- Frontend: React
- All timestamps in UTC
- Client-side trajectory calculations

## Getting Started

### Backend Setup

1. Create and activate a virtual environment:
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
source venv/bin/activate # Unix
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Initialize the database:
```bash
python -m app.core.init_db
```

4. Start the backend server:
```bash
python -m app.main
```

The backend will be available at `http://localhost:5200`

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:5173`

## System Constraints
- Maximum concurrent missiles per user: 3 (default)
- Maximum launches per day per user: 10 (default)
- Maximum total concurrent missiles: 1000
- Impact visualization persistence: 24 hours
- Database cleanup threshold: 30 days

For detailed technical documentation, see `/docs/dev-plan.md`
