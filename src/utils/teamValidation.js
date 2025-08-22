import { Query } from '../Query';

export async function isValidTeamNumber(teamNumber) {
  const query = `
  {
    teamByNumber(number: ${Number(teamNumber)}) {
      name
    }
  }
  `;
  const teamNumberQuery = await Query(query);
  return teamNumberQuery.data.teamByNumber !== null;
}
