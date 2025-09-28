import { useState, useEffect } from 'react';

const API_BASE_URL = process.env.NODE_ENV === 'production' ? 'https://backend-six-sooty-74.vercel.app' : 'http://localhost:5000';
export const openAPI = {
    async getAIRequest(teamData) {
        console.log("Passing to openai: " + JSON.stringify(teamData));
        if (teamData.aiInsight) {
            teamData.aiInsight = null; // Prevent sending old insight
        }
        const response = await fetch(`${API_BASE_URL}/api/openai`, {
            method: "POST", 
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({ data: teamData }),
        });

        const result = await response.json();
        console.log(result.analysis);   
        return result.analysis;
    },
    formatAI(aiText) {
        aiText = aiText.replaceAll('</$WEAKNESS$>', '');
        aiText = aiText.replaceAll('</$WEAKNESS>', '');
        aiText = aiText.replaceAll('</$STRENGTH$>', '');
        aiText = aiText.replaceAll('</$STRENGTH>', '');
        let strength = aiText.match(/\$STRENGTH:\s*(.+?)(?=\s*\$|$)/)?.[1]?.trim();
        let weakness = aiText.match(/\$WEAKNESS:\s*(.+?)(?=\s*\$|$)/)?.[1]?.trim(); 
        const score = aiText.match(/\$SCORE:\s*(.+?)(?=\s*\$|$)/)?.[1]?.trim();
        return { strength, weakness, score };
    }
};
