export function teamRolePrediction(specimens, samples) {
    const MAX_SAMPLE = 160;
    const MAX_SPECIMEN = 230;

    const normSamples = normalize(samples, MAX_SAMPLE);
    const normSpecimens = normalize(specimens, MAX_SPECIMEN);

    const meanSamples = mean(normSamples);
    const meanSpecimens = mean(normSpecimens);

    const stdSamples = stdDev(normSamples);
    const stdSpecimens = stdDev(normSpecimens);

    // Final score = mean / std
    const scoreSamples = stdSamples !== 0 ? meanSamples / stdSamples : Infinity;
    const scoreSpecimens = stdSpecimens !== 0 ? meanSpecimens / stdSpecimens : Infinity;

    const total = scoreSamples + scoreSpecimens;
    const percentSamples = (scoreSamples / total) * 100;
    const percentSpecimens = (scoreSpecimens / total) * 100;
    return {
        percentSamples: percentSamples.toFixed(2),
        percentSpecimens: percentSpecimens.toFixed(2)
    };
}

export function calculateCarriedScore(teamOpr, totalPartnerOpr, totalOpponentOpr, gamesPlayed) {
  const avgPartnerOpr = totalPartnerOpr / gamesPlayed;
  const avgOpponentOpr = totalOpponentOpr / gamesPlayed;

  console.log("Avg partner opr: " + avgPartnerOpr);
  console.log("Avg opponent opr: " + avgOpponentOpr);

  return avgPartnerOpr - avgOpponentOpr; 
}

function mean(arr) {
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}
  
function stdDev(arr) {
    const avg = mean(arr);
    const variance = arr.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / arr.length;
    return Math.sqrt(variance);
}

function normalize(arr, max) {
    return arr.map(val => val / max);
}