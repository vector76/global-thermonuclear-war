# Development Plan
Current plan for project development can be summarized by the following high level outline:
1. Discuss the project overview and its purpose, and build out a document containing an informal specification.
2. Create a phased implementation plan, describing individual parts of the project and tests for each one.
3. Implement the phases of the project, with the human supervising and testing each phase.

## Developing the overview and specification
The overview and specification, should be developed *collaboratively* by the AI agent and the human.  The human will provide guidance, but the AI agent will also ask questions on areas that need elaboration.  Results from this discussion will be incorporated into this document.

## Creation of phased implementation plan
As with the overview and specification, the phased implementation plan should be developed *collaboratively* by the AI agent and the human.  The human may ask the AI to propose a subdivision of the features into phases, and the human will steer the subdivision and testing strategy.

The results from this discussion will be incorporated into this document.

# Project overview, purpose, and architecture

## Game Concept
This project implements a global thermonuclear war simulation game inspired by the 1983 film "WarGames". Players can launch ICBMs at cities worldwide, with the system tracking missile trajectories and impacts in real-time.

### Visual Design
- Retro aesthetic reminiscent of WarGames
- Dark background with white vector graphics
- World map displayed with white country outlines
- Missile trajectories shown as white parabolic arcs
- Impact locations marked with white circles

## Technical Architecture

### Frontend
- Web-based interface
- Interactive map for target selection (mapping library TBD)
- City search functionality with autocomplete
- Client-side calculation of missile positions
- Client-side time zone conversion for display
- User must refresh for new missile data (in the future may have real-time update)
- Authentication UI for OAuth login (Google, GitHub)

### Backend
- REST API for missile launch and tracking
- OAuth authentication (Google/GitHub only)
- Internal city lookup from CSV database
- Database:
  - Development: SQLite
  - Production: Supabase
  - All timestamps stored in UTC
- No server-side trajectory calculations

### System Constraints
- Per-user limits:
  - Maximum concurrent missiles in flight (default: 3)
  - Maximum launches per day (default: 10)
- System-wide limits:
  - Maximum total concurrent missiles: 1000
- Administrative controls:
  - Adjustable user limits
  - System-wide missile cap control
  - System-wide visualization settings
  - Impact persistence duration control
  - Database cleanup duration control

### Error Handling
- Invalid city names:
  - Web UI: Display error message in red
  - API: Return HTTP 500 with error description
- Failed launches don't count against user limits
- All times handled in UTC/GMT server-side

### Key Features
1. User Authentication
   - OAuth-based login required for missile launches
   - Per-user missile limits (2-5 concurrent missiles in flight)
   - Anonymous users can view but not launch
   - Users can generate and manage multiple API keys
   - API keys inherit the same missile limits as the user

2. Missile System
   - Variable flight times based on distance
   - Trajectory stored as launch and impact times/locations
   - Path calculated at render time
   - Missiles continue to target regardless of user session
   - All users can view all active missiles
   - User's own missiles visually distinguished
   - Plausible launch site selection based on target location
   - Submarine and strategic site launches supported
   - Target specification:
     - Single string input format
     - Accepts either:
       - City names (e.g., "Paris, France", "Tokyo")
       - Coordinate strings (e.g., "40.7128,-74.0060")
     - Internal resolution of city names to coordinates
     - Same format used in both API and web interface

3. API Access
   - RESTful API for missile launch and tracking
   - Single endpoint for launch with string target parameter
   - Authentication via user-generated API keys
   - API keys tied to user accounts
   - Shared missile limits between API and web interface
   - Future support for AI-driven launches
   - API key management interface in web UI

### Data Model (preliminary)
- Internal Cities/Locations Database:
  - City name
  - Country
  - Latitude/longitude coordinates
  - Population (optional)
  - Alternative names/spellings
  - Metropolitan area (optional)
- Missiles in flight:
  - Launch time and location
  - Target:
    - Original input string
    - Resolved coordinates
  - Calculated impact time
  - Launching user
  - Trajectory parameters
- Historical impacts:
  - Impact time and location
  - Source location
  - Launching user
  - Cleanup (remore from database) threshold: 30 days (adjustable)
  - Visual persistence: 24 hours (adjustable)
- API Keys:
  - Key identifier
  - Secret hash
  - Owner user
  - Creation timestamp
  - Last used timestamp
  - Optional description/name
  - Optional expiration date
  - Revocation status

# Phased implementation plan

## Phase 1: Basic Infrastructure
- Initial project setup:
  - Existing React frontend setup
  - Existing FastAPI backend setup
  - TypeScript configuration
  - Development environment configuration
  
- Database abstraction layer:
  - Interface definitions for database operations
  - SQLite implementation of interfaces
  - Basic schema:
    - Users table
    - Sessions table
    - Configuration table
    
- Simple REST API framework:
  - Health check endpoint
  - Basic middleware setup
  - Error handling framework
  - API response standardization
  
- Basic frontend shell:
  - React component structure
  - Basic routing
  - API client structure
  - Error handling

Manual Testing Checklist:

1. Development Environment:
   - [x] `cd frontend ; npm run dev` successfully launches Vite frontend on port 5100
   - [x] `cd backend ; python -m app.main` successfully launches FastAPI backend on port 5200
   - [x] Frontend can communicate with backend through proxy
   - [x] Environment variables are properly loaded

2. Database Operations:
   - [x] SQLite database file is created in correct location
   - [x] Can manually connect to database using SQLite client
   - [x] Basic tables are created with correct schema
   - [x] Can perform manual INSERT/SELECT operations

3. API Endpoints:
   - [x] Health check endpoint returns 200 OK
   - [x] Invalid endpoints return proper 404 error
   - [x] Error responses follow standardized format
   - [x] CORS headers allow frontend access

4. Frontend Features:
   - [x] Application loads without console errors
   - [ ] Basic navigation works between placeholder pages
   - [x] API errors are displayed to user
   - [x] Browser dev tools show proper API communication

5. Integration:
   - [x] Frontend successfully calls backend health check
   - [x] Database operations from API work end-to-end
   - [ ] Error handling works across all layers
   - [x] All components can run simultaneously without conflicts

## Phase 2: Authentication
- [x] OAuth implementation (Google only)
- [x] User session management
- [x] Basic admin panel
- [x] User database tables
Tests:
- [x] Login flow works
- [x] Session persistence
- Admin can view users
- [x] Unauthenticated users blocked

## Phase 3: Basic Missile Launch
- [x] City database CSV implementation
- Simple target string parsing
- Basic missile launch endpoint
- [x] Missile database tables
- Minimal frontend map display
Tests:
- City lookup works
- Can parse coordinates
- Can store launch records
- Map displays with basic markers

## Phase 4: Trajectory Visualization
- Client-side trajectory calculation
- Basic missile path rendering
- Impact time calculation
- UTC time handling
Tests:
- Paths render correctly
- Times convert properly
- Missiles "move" along paths
- Impact times recorded

## Phase 5: Launch Site Selection
- Launch location logic
- Submarine launch positions
- Strategic site database
- Plausible source/target matching
Tests:
- Launch sites are plausible
- Submarine launches work
- Strategic sites available
- Source/target relationships valid

## Phase 6: API and Limits
- API key generation
- Launch limits implementation
- System-wide missile cap
- API documentation
Tests:
- API keys work
- Limits enforced
- Cap prevents excess launches
- API docs are accurate

## Phase 7: Enhanced Features
- GitHub OAuth addition
- Impact visualization
- User missile highlighting
- Database cleanup implementation
Tests:
- Multiple OAuth providers work
- Impacts display correctly
- User missiles distinguished
- Old data cleaned up

## Phase 8: Polish and Performance
- UI improvements
- Error message handling
- Admin controls for all limits
- Performance optimization
Tests:
- UI is user-friendly
- Errors handled gracefully
- Admin controls work
- System handles load

## Future Phases (not initially implemented)
- Real-time updates
- AI integration
- Fuzzy city matching
- Localization
- Advanced statistics
