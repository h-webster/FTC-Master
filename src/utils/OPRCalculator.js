import { Matrix } from 'ml-matrix';
function makeTeamMap(teams) {
    let teamMap = new Map();
    for (let i = 0; i < teams.length; i++) {
        let team = teams[i];
        teamMap.set(team.number, i);
    }
    return teamMap;
}

function calculateOPR(teams, matches, type) {
    let rows = [];
    let scores = [];
    let teamMap = makeTeamMap(teams);
    console.log(teamMap);

    const teamsLength = teams.length;
    console.log("All matches:", JSON.stringify(matches));

    for (const match of matches) {
        console.log("OPR Match:", JSON.stringify(match));

        // Red alliance row
        const redRow = new Array(teamsLength).fill(0);
        for (const teamNum of match.red) {
            if (teamMap.has(teamNum)) {
                redRow[teamMap.get(teamNum)] = 1;
            }
        }
        rows.push(redRow);
        scores.push(match[`red${type}`]);

        // Blue alliance row
        const blueRow = new Array(teamsLength).fill(0);
        for (const teamNum of match.blue) {
            if (teamMap.has(teamNum)) {
                blueRow[teamMap.get(teamNum)] = 1;
            }
        }
        rows.push(blueRow);
        scores.push(match[`blue${type}`]);

        // log snapshot each loop iteration
        console.log("Current rows:", JSON.stringify(rows));
        console.log("Current scores:", JSON.stringify(scores));
    }

    const A = new Matrix(rows);
    const b = new Matrix(scores.map(score => [score]));

    console.log("Final rows:", JSON.stringify(rows));
    console.log("Final scores:", JSON.stringify(scores));

    const x = solveLeastSquares(A, b);
    return x;
}


// Solve least squares using normal equation
function solveLeastSquares(A, b) {
    try {
        // Use the library’s least squares solver (QR under the hood)
        const x = A.solve(b);
        return x.getColumn(0);
    } catch (error) {
        console.warn("Least squares solve failed, falling back to regularization");

        try {
            const AT = A.transpose();
            const ATA = AT.mmul(A);
            const ATb = AT.mmul(b);

            // Ridge regression style regularization
            const lambda = 1e-6;
            for (let i = 0; i < ATA.rows; i++) {
                ATA.set(i, i, ATA.get(i, i) + lambda);
            }

            const x = ATA.inverse().mmul(ATb);
            return x.getColumn(0);
        } catch (error2) {
            console.error("Cannot solve least squares at all, returning zeros");
            return new Array(A.columns).fill(0);
        }
    }
}


export function getOPR(teams, matches) {
    const totalOPR = calculateOPR(teams, matches, 'Score');
    const autoOPR = calculateOPR(teams, matches, 'Auto');
    const teleOPR = calculateOPR(teams, matches, 'Tele');
    const endOPR = calculateOPR(teams, matches, 'End');
    
    // Combine results
    return teams.map((team, index) => ({
        number: team.number,
        name: team.name,
        totalOPR: totalOPR[index].opr,
        autoOPR: autoOPR[index].opr,
        teleOPR: teleOPR[index].opr,
        endOPR: endOPR[index].opr
    }));
}