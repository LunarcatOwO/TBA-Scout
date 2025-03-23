import axios from "axios";

/**
 * Helper function to get field values with multiple possible field names
 */
export const getFieldValue = (breakdown, fields) => {
  for (const field of fields) {
    if (breakdown && breakdown[field] !== undefined) {
      return breakdown[field];
    }
  }
  return null;
};

/**
 * Fetch event data for a specific team
 * @param {string} eventKey - The event key (e.g., "2025onnob")
 * @param {string} teamKey - The team key (e.g., "frc6987")
 * @param {string} apiKey - The Blue Alliance API key
 */
const fetchEventData = async (eventKey, teamKey, apiKey) => {
  if (!eventKey || !teamKey) return [];

  try {
    // Direct API call to The Blue Alliance
    const response = await axios.get(`https://www.thebluealliance.com/api/v3/event/${eventKey}/matches`, {
      headers: { "X-TBA-Auth-Key": apiKey }
    });
    
    // Filter matches with this team
    let teamMatches = response.data.filter(match => {
      const blueTeams = match.alliances?.blue?.team_keys || [];
      const redTeams = match.alliances?.red?.team_keys || [];
      return blueTeams.includes(teamKey) || redTeams.includes(teamKey);
    });
    
    const teamData = teamMatches.map(match => {
      // Determine which alliance this team is on
      const isBlue = match.alliances?.blue?.team_keys?.includes(teamKey);
      const alliance = isBlue ? 'blue' : 'red';
      const allianceColor = isBlue ? 'Blue' : 'Red';
      
      // Get score breakdown for this team's alliance if it exists
      const breakdown = match.score_breakdown && match.score_breakdown[alliance];
      
      // Get alliance teams (blue or red depending on this team)
      const allianceTeams = match.alliances?.[alliance]?.team_keys || [];
      // Find the position (1, 2, or 3) of this team in the alliance
      const teamIndex = allianceTeams.indexOf(teamKey);
      // Robot number is position + 1 (1-indexed)
      const robotNumber = teamIndex + 1;
      
      // Use more flexible data extraction with default values
      const matchData = {
        match: match.match_number,
        compLevel: match.comp_level,
        alliance: allianceColor,
        teams: allianceTeams,
        score: match.alliances?.[alliance]?.score,
        // Add opposing alliance score
        opposingScore: match.alliances?.[alliance === 'blue' ? 'red' : 'blue']?.score,
        
        // 2025 Ocean Opportunities field names - from the console output
        autoCoral: getFieldValue(breakdown, [
          'autoCoralPoints',
          'autoCoralCount'
        ]) || 0,
        
        teleopCoral: getFieldValue(breakdown, [
          'teleopCoralPoints', 
          'teleopCoralCount'
        ]) || 0,
        
        algaeProcessor: getFieldValue(breakdown, [
          'wallAlgaeCount',
          'algaePoints'
        ]) || 0,
        
        algaeNet: getFieldValue(breakdown, [
          'netAlgaeCount'
        ]) || 0,
        
        // Auto Leave - use autoMobilityPoints
        autoLeave: (getFieldValue(breakdown, [
          'autoMobilityPoints'
        ]) > 0) ? "Yes" : "No",
        
        foulPoints: getFieldValue(breakdown, [
          'foulPoints'
        ]) || 0,
        
        // Endgame status - only check the specific robot for this team
        climbStatus: (() => {
          // Get only this team's robot status
          const thisRobot = getFieldValue(breakdown, [`endGameRobot${robotNumber}`]) || '';
          
          if (thisRobot.includes('Cage')) {
            return "Climb";
          } else if (thisRobot.includes('Parked')) {
            return "Park";
          } else {
            return "None";
          }
        })(),
        
        // Climb depth - specific to this robot
        climbDepth: (() => {
          const thisRobot = getFieldValue(breakdown, [`endGameRobot${robotNumber}`]) || '';
          
          if (thisRobot.includes('Deep')) {
            return 'Deep';
          } else if (thisRobot.includes('Shallow')) {
            return 'Shallow';
          } else {
            return 'N/A';
          }
        })(),
        
        actualTime: match.actual_time,
        predictedTime: match.predicted_time  
      };
      
      return matchData;
    });

    // Sort by match number
    teamData.sort((a, b) => a.match - b.match);
    
    return teamData;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};

export default fetchEventData;