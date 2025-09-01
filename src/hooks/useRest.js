import { useState, useEffect } from 'react';

const API_BASE_URL = process.env.NODE_ENV === 'production' ? 'https://backend-six-sooty-74.vercel.app' : 'http://localhost:5000';
export const scoutAPI = {
    async getQuickStats(teamNum) {
        const res = await fetch(`${API_BASE_URL}/api/quick-stats/${teamNum}`);
        return res.json();
    }
};

