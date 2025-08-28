import { Query } from '../Query';

export async function isValidTeamNumber(teamNumber, teamList) {
  console.log("Checking if valid team number");
  console.log(JSON.stringify(teamList));
  console.log(teamNumber);
  for (let team of teamList) {
    if (team.number == teamNumber) {
      console.log("Valid team number");
      return true;
    }
  }
  console.log("Invalid team number");
  return false;
}
