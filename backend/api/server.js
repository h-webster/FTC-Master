const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Team, TeamsList } = require('./schema');
const mongoRoutes = require('./routes/mongoRoutes');

let PORT;

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
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

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});



if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  }); 
}


module.exports = app;