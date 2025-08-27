
const API_BASE_URL = process.env.NODE_ENV === 'production' ? 'https://backend-six-sooty-74.vercel.app/api' : 'http://localhost:5000/api';

export const getTeamMatches = async (eventCode, teamNumber) => {
  try {
    const response = await fetch(
      `http://ftc-api.firstinspires.org/v2.0/2024/matches/${eventCode}?teamNumber=${teamNumber}`,
      {
        method: 'GET',
        headers: {
          'Authorization': createAuthHeader(),
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching FTC matches:', error);
    throw error;
  }
};

/**
 * Generic FTC API fetch function for other endpoints
 * @param {string} endpoint - The FTC API endpoint path
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} - The API response data
 */
export const fetchFTCData = async (endpoint, params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/api/ftc${endpoint}${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': createAuthHeader(),
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching FTC data:', error);
    throw error;
  }
};

const createAuthHeader = () => {
  const username = import.meta.env.VITE_FTC_USERNAME;
  const token = import.meta.env.VITE_FTC_TOKEN;
  
  if (!username || !token) {
    throw new Error('FTC credentials not found in environment variables');
  }
  
  const credentials = btoa(`${username}:${token}`);
  return `Basic ${credentials}`;
};