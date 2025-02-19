 # Full Stack Application

A modern full-stack web application built with FastAPI and React.

## Project Structure

```
/
├── backend/           # FastAPI backend
│   ├── app/          # Application code
│   │   ├── api/      # API endpoints
│   │   ├── core/     # Core configuration
│   │   ├── models/   # Database models
│   │   └── schemas/  # Pydantic schemas
│   ├── docs/         # Backend documentation
│   └── requirements.txt
│
├── frontend/         # React frontend
│   ├── public/      # Static files
│   ├── src/         # Source code
│   ├── docs/        # Frontend documentation
│   └── package.json
│
└── docs/            # Project documentation
```

## Backend (FastAPI)

- Built with FastAPI framework
- Running on port 5200
- Features:
  - CORS middleware configured
  - Environment-based configuration
  - Health check endpoint
  - API versioning ready
  - Comprehensive architecture documentation

### Getting Started with Backend

1. Create and activate a virtual environment:
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the development server:
```bash
python -m app.main
```

The backend will be available at `http://localhost:5200`

## Frontend (React)

- Built with Create React App
- Running on port 5100
- Features:
  - Modern React (v19)
  - Backend proxy configuration
  - Testing setup with Jest and React Testing Library
  - Comprehensive architecture documentation

### Getting Started with Frontend

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:5100`

## Documentation

Detailed architecture documentation is available in:
- Backend: `/backend/docs/backend-architecture.md`
- Frontend: `/frontend/docs/frontend-architecture.md`

## Development

### Backend Development
- API endpoints are defined in `/backend/app/api/`
- Configuration settings in `/backend/app/core/config.py`
- Environment variables can be set in `.env`

### Frontend Development
- Main application component in `/frontend/src/App.js`
- Proxy configuration in `package.json` for backend communication
- Environment variables can be set in `.env` files (prefixed with REACT_APP_)

## Testing

### Backend Testing
- Tests to be added

### Frontend Testing
- Using Jest and React Testing Library
- Run tests with `npm test` in the frontend directory

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
