const express = require('express');
const cors = require('cors');
const { Team, TeamsList } = require('./schema');
const { OpenAI } = require('openai');
const mongoRoutes = require('./routes/mongoRoutes');

let PORT;

if (process.env.NODE_ENV !== 'production') {
  
  require('dotenv').config();
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  PORT = process.env.PORT || 5000;
}


const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://ftc-master.vercel.app', 'https://www.ftcmaster.org', 'https://ftcmaster.org']
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));

const username = process.env.FTC_USERNAME;
const token = process.env.FTC_TOKEN;
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use('/api', mongoRoutes);


app.get('/api/events/:number', async (req, res) => {
  const teamNumber = req.params.number;
  if (!teamNumber) return res.status(400).json({ error: "teamNumber is required" });

  const url = `https://ftc-api.firstinspires.org/v2.0/2024/events?teamNumber=${teamNumber}`;
  try {
    const response = await fetch(url, {
      headers: {
        "Authorization": "Basic " + Buffer.from(`${username}:${token}`).toString("base64")
      }
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get all matches from a specific event code (FTCeventsapi)
app.get('/api/matches/:eventCode', async (req, res) => {
  const eventCode = req.params.eventCode;
  if (!eventCode) return res.status(400).json({ error: "Event code is required" });

  const url = `https://ftc-api.firstinspires.org/v2.0/2024/matches/${eventCode}`;
  try {
    const response = await fetch(url, {
      headers: {
        "Authorization": "Basic " + Buffer.from(`${username}:${token}`).toString("base64")
      }
    });
    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: errText });
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
})

// get quick stats from FTCscout api
app.get('/api/quick-stats/:number', async (req, res) => {
  const teamNumber = req.params.number;
  if (!teamNumber) return res.status(400).json({ error: "teamNumber is required" });

  const url = `https://api.ftcscout.org/rest/v1/teams/${teamNumber}/quick-stats`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
})

// get individual team information (rookie year etc) (FTCEventsApi)
app.get('/api/team/:number', async (req, res) => {
  const teamNumber = req.params.number;
  if (!teamNumber) {
    console.log("No team number");
    return res.status(400).json({ error: "teamNumber is required" });
  }

  const url = `https://ftc-api.firstinspires.org/v2.0/2024/teams?teamNumber=${teamNumber}`;
  try {
    const response = await fetch(url, {
      headers: {
        "Authorization": "Basic " + Buffer.from(`${username}:${token}`).toString("base64")
      }
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
})

app.get('/api/scores/:eventCode/:tournamentLevel', async (req, res) => {
  const eventCode = req.params.eventCode;
  if (!eventCode) return res.status(400).json({ error: "eventCode is required" });
  const tournamentLevel = req.params.tournamentLevel;
  if (!tournamentLevel) return res.status(400).json({ error: "tournamentLevel is required" });

  let tournamentLevels = ["qual", "playoff"];
  if (!tournamentLevels.includes(tournamentLevel)) {
    return res.status(400).json({ error: "incorrect tournament level"});
  }

  const url = `https://ftc-api.firstinspires.org/v2.0/2024/scores/${eventCode}/${tournamentLevel}`;
  try {
    const response = await fetch(url, {
      headers: {
        "Authorization": "Basic " + Buffer.from(`${username}:${token}`).toString("base64")
      }
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}) 

app.get('/api/rankings/:eventCode', async (req, res) => {
  const eventCode = req.params.eventCode;
  if (!eventCode) return res.status(400).json({ error: "eventCode is required" });

  const url = `https://ftc-api.firstinspires.org/v2.0/2024/rankings/${eventCode}`;
  try {
    const response = await fetch(url, {
      headers: {
        "Authorization": "Basic " + Buffer.from(`${username}:${token}`).toString("base64")
      }
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
})

app.post('/api/openai', async (req, res) => {
  try {
    const { data } = req.body;
    const completion = await client.chat.completions.create({
      model: "gpt-5-nano",
      messages: [
        { role: "system", content: "You are an expert FTC (FIRST Tech Challenge) scouting assistant that provides unbiased, data-driven team analysis. Your role is to evaluate teams objectively based on their performance, capabilities, and potential. Main factor is their point scoring.\n\nANALYSIS REQUIREMENTS:\n- Provide balanced assessments of team strengths and weaknesses\n- Use a 1.0-10.0 scoring system with one decimal place precision (e.g., 6.3, 7.8)\n- Base evaluations on observable performance metrics, consistency, and strategic capabilities\n\nFORMAT REQUIREMENTS (MUST BE FOLLOWED EXACTLY):\n$STRENGTH: <li>[strength 1]</li> <li>[strength 2]</li> <li>[additional strengths as needed]</li>\n$WEAKNESS: <li>[weakness 1]</li> <li>[weakness 2]</li> <li>[additional weaknesses as needed]</li>\n$SCORE: [numerical score]\n\nSCORING GUIDELINES:\n- 0.0-3.0: Significant challenges, inconsistent performance, consistently lowest rankings\n- 3.1-5.0: Below average, notable areas for improvement top 4000/7641\n- 5.1-7.0: Average to good performance, solid fundamentals, top 2000/7641\n- 7.1-9.5: Strong performance, competitive capabilities, top 500/7641 team\n- 9.5-10.0: Exceptional performance, championship contenders, top 50/7641 team\nExample (score 7.5/10): autoRank:1803,driverRank:1800,endgameRank:1776,totalRank:1918, Example (score 0.1/10) autoRank:7638,driverRank:7641,endgameRank:6647,totalRank:7641\nEnsure all analysis is factual, constructive, and maintains the exact formatting structure provided." },
        { role: "user", content: `Analyze: ${JSON.stringify(data)}` }
      ]
    });

    res.json({ analysis: completion.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});



if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  }); 
}


module.exports = app;