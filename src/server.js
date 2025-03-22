import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import fetchEventData, { getFieldValue } from "./utils/fetchTeamData.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const TBA_API_KEY = process.env.TBA_API_KEY;
const BASE_URL = "https://www.thebluealliance.com/api/v3";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fix: point to project root's public directory by going up one level
app.use(express.static(path.join(__dirname, '../public')));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up views and template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Home page route
app.get("/", (req, res) => {
  res.render('index', { title: 'TBA Scout' });
});

// Scout page route
app.get("/scout", async (req, res) => {
  const { eventKey } = req.query;
  let matchData = [];
  let error = null;

  if (eventKey) {
    try {
      const response = await axios.get(`${BASE_URL}/event/${eventKey}/matches`, {
        headers: { "X-TBA-Auth-Key": TBA_API_KEY },
      });
      
      // Sort matches by comp_level and match_number
      matchData = response.data.sort((a, b) => {
        // Define the order of competition levels
        const levels = { "qm": 0, "ef": 1, "qf": 2, "sf": 3, "f": 4 };
        
        // First sort by comp_level
        if (levels[a.comp_level] !== levels[b.comp_level]) {
          return levels[a.comp_level] - levels[b.comp_level];
        }
        
        // Then sort by match_number within the same comp_level
        return a.match_number - b.match_number;
      });
      
    } catch (error) {
      console.error("Error fetching data:", error);
      error = "Failed to fetch data";
    }
  }

  res.render('scout', { title: 'Scout', eventKey, matchData, error });
});

// Team data route
app.get("/team", async (req, res) => {
  const { eventKey, teamKey } = req.query;
  let teamData = [];
  let teamSummary = {
    matches: 0,
    autoCoral: 0,
    teleopCoral: 0,
    algaeProcessor: 0,
    algaeNet: 0,
    autoLeaves: 0,
    foulPoints: 0,
    climbs: 0,
    parks: 0,
    deepClimbs: 0,
    shallowClimbs: 0,
  };
  let error = null;

  if (eventKey && teamKey) {
    try {
      // Use the imported fetchEventData function
      teamData = await fetchEventData(eventKey, teamKey, TBA_API_KEY);
      
      // Calculate team summary from the fetched data
      teamData.forEach(matchData => {
        teamSummary.matches++;
        teamSummary.autoCoral += matchData.autoCoral;
        teamSummary.teleopCoral += matchData.teleopCoral;
        teamSummary.algaeProcessor += matchData.algaeProcessor;
        teamSummary.algaeNet += matchData.algaeNet;
        teamSummary.autoLeaves += matchData.autoLeave === "Yes" ? 1 : 0;
        teamSummary.foulPoints += matchData.foulPoints;

        if (matchData.climbStatus === "Climb") {
          teamSummary.climbs++;
          if (matchData.climbDepth === "Deep") {
            teamSummary.deepClimbs++;
          } else if (matchData.climbDepth === "Shallow") {
            teamSummary.shallowClimbs++;
          }
        } else if (matchData.climbStatus === "Park") {
          teamSummary.parks++;
        }
      });
    } catch (err) {
      console.error(err);
      error = "Failed to fetch team data";
    }
  }

  if (teamSummary.matches > 0) {
    teamSummary.avgAutoCoral = (teamSummary.autoCoral / teamSummary.matches).toFixed(2);
    teamSummary.avgTeleopCoral = (teamSummary.teleopCoral / teamSummary.matches).toFixed(2);
    teamSummary.avgAlgaeProcessor = (teamSummary.algaeProcessor / teamSummary.matches).toFixed(2);
    teamSummary.avgAlgaeNet = (teamSummary.algaeNet / teamSummary.matches).toFixed(2);
    teamSummary.avgFoulPoints = (teamSummary.foulPoints / teamSummary.matches).toFixed(2);
  }

  res.render('team', {
    title: `Team ${teamKey.replace('frc', '')} at ${eventKey}`,
    eventKey,
    teamKey,
    teamNumber: teamKey.replace('frc', ''),
    teamData,
    teamSummary,
    error
  });
});

// API endpoint
app.get("/api/eventdata", async (req, res) => {
  const { eventKey } = req.query;
  if (!eventKey) {
    return res.status(400).json({ error: "Missing eventKey" });
  }
  try {
    console.log(`Fetching data for event: ${eventKey}`);
    const response = await axios.get(
      `${BASE_URL}/event/${eventKey}/matches`,
      {
        headers: { "X-TBA-Auth-Key": TBA_API_KEY },
      }
    );


    res.json(response.data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch event data" });
  }
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});