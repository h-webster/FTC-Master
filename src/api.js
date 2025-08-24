const API_BASE_URL = process.env.NODE_ENV === 'production' ? 'https://backend-4ig5niadd-h-websters-projects.vercel.app' : 'http://localhost:5000/api';

export const api = {
  async saveTeamSearch(teams) {
    try {
      const payload = { teams: teams };
      const response = await fetch(`${API_BASE_URL}/teamsLists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => response.text());
        console.error('Server error response:', errorData);
        throw new Error(`Failed to save team list: ${JSON.stringify(errorData)}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving team:', error);
      throw error;
    }
  },

  // Get team data from MongoDB
  async getTeam(teamNumber) {
    try {
      const response = await fetch(`${API_BASE_URL}/teams/${teamNumber}`);
      if (!response.ok) {
        throw new Error('Team not found');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching team:', error);
      return null;
    }
  },

  // Save team data to MongoDB
  async saveTeam(teamData) {
    console.log("attempting to save:", JSON.stringify(teamData, null, 2));
    try {
      const response = await fetch(`${API_BASE_URL}/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teamData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => response.text());
        console.error('Server error response:', errorData);
        throw new Error(`Failed to save team data: ${JSON.stringify(errorData)}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error saving team:', error);
      throw error;
    }
  },

  // Update team data in MongoDB
  async updateTeam(teamNumber, teamData) {
    try {
      const response = await fetch(`${API_BASE_URL}/teams/${teamNumber}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teamData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update team data');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating team:', error);
      throw error;
    }
  },

  // Get all teams
  async getAllTeams() {
    try {
      const response = await fetch(`${API_BASE_URL}/teams`);
      if (!response.ok) {
        throw new Error('Failed to fetch teams');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching teams:', error);
      return [];
    }
  },

  async getTeamList() {
    try {
      const response = await fetch(`${API_BASE_URL}/teamsLists`);
      if (!response.ok) {
        throw new Error('Failed to fetch teams');
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching teams:", error);
      return [];
    }
  }
}; 