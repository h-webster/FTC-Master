async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 8000 } = options; // 8s timeout
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

export async function Query(q) {
  console.log(`Querying FTC API ~ ${q}`);

  try {
    const res = await fetchWithTimeout("https://api.ftcscout.org/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: q }),
      timeout: 45000 // adjust
    });

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Request failed:", err);
    alert("Request failed, please try again.");
    window.location.reload();
    return { error: "FTC API request failed or timed out" };
  }
}


export async function getTeamData(teamNumber) {
    const query = `
    {
      teamByNumber(number: ${teamNumber}) {
        name
        number
        rookieYear
        sponsors
        quickStats (season: 2024) {
          tot {
            value
            rank
          }
          auto {
            value
            rank
          }
          dc {
            value
            rank
          }
          eg {
            value
            rank
          }
        }
        events(season: 2024) {
            event {
              name
              start
            }
            matches {
                matchId
                alliance
                team {
                    name
                }
                match {
                    tournamentLevel
                    scores {
                        ... on MatchScores2024 {
                            red {
                                totalPoints
                                dcSpecimenPoints
                                dcSamplePoints
                            }
                            blue {
                                totalPoints
                                dcSpecimenPoints
                                dcSamplePoints
                            }
                        }
                    }
                    teams {
                        alliance
                        team {
                            number
                            name
                         }
                        }
                    }
                }
            }
        }
    }`;
    const teamDataQuery = await Query(query);
    console.log(teamDataQuery.data);
    return teamDataQuery.data;
}
  
  
export async function getExtraData(teamNumber) {
    const query = `
    {
      teamByNumber(number: ${Number(teamNumber)}) {
        name
        number
        quickStats (season: 2024) {
          tot {
            value
          }
        }
        matches (season: 2024) {
          alliance
          match {
            tournamentLevel
            teams {
              alliance
              team {
                number
                quickStats (season: 2024) {
                  tot {
                    value
                  }
                }
              }
            }
          }
        }
      }
    }
    `;
    const extraDataQuery = await Query(query);
    return extraDataQuery.data;
  }
  
export async function getAllTeams(teamNumber) {
  const query = `
    {
      teamsSearch(limit: 100000) {
        name
        number
      }
    }
  `;
  const allTeamsQuery = await Query(query);
  return allTeamsQuery.data;
}

export async function getAllTeamNumbers() {
  const query = `
    teamsSearch(limit: 10) {
    name
        number
        rookieYear
        sponsors
        quickStats (season: 2024) {
          tot {
            value
            rank
          }
          auto {
            value
            rank
          }
          dc {
            value
            rank
          }
          eg {
            value
            rank
          }
        }
        events(season: 2024) {
            event {
              name
              start
            }
            matches {
                matchId
                alliance
                team {
                    name
                }
                match {
                    tournamentLevel
                    scores {
                        ... on MatchScores2024 {
                            red {
                                totalPoints
                                dcSpecimenPoints
                                dcSamplePoints
                            }
                            blue {
                                totalPoints
                                dcSpecimenPoints
                                dcSamplePoints
                            }
                        }
                    }
                    teams {
                        alliance
                        team {
                            number
                            name
                         }
                        }
                    }
                }
            }
  }
  }
  `;
  console.log("Doing getAllTeamNumbers...");
  const allTeamsQuery = await Query(query);
  return allTeamsQuery.data;
}