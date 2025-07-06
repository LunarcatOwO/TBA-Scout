# Deprecated! Checkout [MelodyDevelopment/nexus-matches-fetcher](https://github.com/MelodyDevelopment/nexus-matches-fetcher) instead!


Collecting workspace information# TBA Scout

A simple web application to view FRC (FIRST Robotics Competition) match data from The Blue Alliance API. This tool helps teams scout and analyze performance data during FRC events.

## Description

TBA Scout allows you to:
- Search for FRC events by event key
- View all matches for an event with team assignments and scores
- Analyze detailed team performance statistics
- Track 2025 Ocean Opportunities game-specific metrics (auto coral, teleop coral, algae processor, etc.)
- Generate team summary statistics across all matches

**Note:** This application currently works best with the 2025 FRC season data.

## Installation

### Local Setup

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

3. Copy the example environment file and update it with your The Blue Alliance API key:

```bash
cp .env.example .env
```

4. Edit .env and add your TBA API key:

```
PORT=5000
TBA_API_KEY="your_tba_api_key_here"
```

5. Start the application:

```bash
npm start
```

The application will be accessible at http://localhost:5000

### Docker Setup

You can run TBA Scout using Docker:

```bash
docker run -p 5000:5000 -e TBA_API_KEY="your_tba_api_key_here" ghcr.io/lunarcatowo/tba-scout:main
```

Or using Docker Compose:

```bash
# Update the TBA_API_KEY in your .env file
docker-compose up -d
```

## Usage

1. Navigate to the home page
2. Enter an event key in the format YYYY[EVENT_CODE] (e.g., 2025onnob)
3. Click "Search" to view match data for that event
4. Click on team numbers to see detailed performance data for specific teams

## API Endpoints

- `/`: Home page
- `/scout?eventKey=<event_key>`: View matches for an event
- `/team?eventKey=<event_key>&teamKey=frc<team_number>`: View team performance at an event
- `/api/eventdata?eventKey=<event_key>`: Get raw JSON match data for an event
- `/health`: Health check endpoint (returns 200 OK if service is running)

## Environment Variables

- `PORT`: The port the application will run on (default: 5000)
- `TBA_API_KEY`: Your The Blue Alliance API key (required)
- `NODE_ENV`: Set to 'production' for production use

## Built With

- Node.js
- Express
- EJS Templates
- The Blue Alliance API

## License

This project is licensed under the GNU General Public License v3.0 - see the LICENSE file for details.

## Author

- [LunarcatOwO](https://github.com/LunarcatOwO)
