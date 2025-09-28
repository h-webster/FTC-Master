import { useState, useEffect } from 'react';

const API_BASE_URL = process.env.NODE_ENV === 'production' ? 'https://backend-six-sooty-74.vercel.app' : 'http://localhost:5000';
export const openAPI = {
    async getAIRequest(teamData) {
        if (teamData.aiInsight) {
            teamData.aiInsight = null; // Prevent sending old insight
        }
        teamData.number = teamData.seasons[0].quickStats.number;
        const formattedAI = this.formatTeamData(teamData);
        console.log("Passing to openai: " + JSON.stringify(formattedAI));
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
    },
    formatTeamData(raw) {
        const team = raw;
        const season = team.seasons?.[0];
        const quick = season?.quickStats;

        // Averages
        const avgPoints = this.avg(season?.points?.map(p => p.points));
        const maxPoints = this.max(season?.points?.map(p => p.points));
        const avgSpecimens = this.avg(season?.specimens);
        const avgSamples = this.avg(season?.samples);

        return {
            teamNumber: team.number,
            teamName: team.name,
            location: team.location,
            rookieYear: team.rookieYear,
            season: season?.season,
            quickRanks: {
            autoRank: quick?.auto.rank,
            driverRank: quick?.dc.rank,
            endgameRank: quick?.eg.rank,
            totalRank: quick?.tot.rank
            },
            scoring: {
            averagePoints: avgPoints,
            maxPoints: maxPoints,
            avgSpecimens,
            avgSamples
            },
            eventSummary: season?.events?.map(e => ({
            name: e.name,
            rank: e.rank,
            avgMatchPoints: this.avg(
                e.quals?.map(m => m.points)
            )
            }))
        };
    },
    avg(arr = []) {
        return arr.length ? +(arr.reduce((a,b) => a+b, 0) / arr.length).toFixed(1) : 0;
    },
    max(arr = []) {
        return arr.length ? Math.max(...arr) : 0;
    }

};
