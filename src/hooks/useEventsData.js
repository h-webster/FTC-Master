import { useState, useEffect } from 'react';
import { TeamNotFound } from '../Fancy';

const API_BASE_URL = process.env.NODE_ENV === 'production' ? 'https://backend-six-sooty-74.vercel.app' : 'http://localhost:5000';

export const officialAPI = {
    async getEventsData(teamNumber) {
        const res = await fetch(`${API_BASE_URL}/api/events/${teamNumber}`);
        const data = await res.json();
        if (TeamNotFound(data)) return null;
        return data;
    },
    async getMatchesData(eventCode) {
        const res = await fetch(`${API_BASE_URL}/api/matches/${eventCode}`);
        return res.json();
    },
    async getTeamData(teamNumber) {
        const res = await fetch(`${API_BASE_URL}/api/team/${teamNumber}`);
        return res.json();
    },
    async getScoreDetails(eventCode, tournamentLevel, teamNumber) {
        const res = await fetch(`${API_BASE_URL}/api/scores/${eventCode}/${tournamentLevel}/${teamNumber}`);
        return res.json();
    }
}




