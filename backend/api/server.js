const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

let PORT;

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
  PORT = process.env.PORT || 5000;
}


const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://ftc-master.vercel.app']
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));

let cachedDb = null;

// MongoDB Connection
async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  try {
    console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set (hidden for security)' : 'Not set');
    console.log('Attempting to connect to MongoDB...');

    const connection = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/FTC-master', {
      // Recommended options for serverless
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0 // Disable mongoose buffering
    });

    cachedDb = connection;
    console.log('Connected to MongoDB successfully');
    console.log('Connected to database:', mongoose.connection.db.databaseName);
    
    return connection;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
}


// Team Schema
const teamSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  version: { type: Number, required: true },
  seasons: [{
    events: [{
      name: {type: String, required: true },
      quals: [{
        match: { type: Number },
        points: { type: Number },
        alliance: { type: String },
        redScore: { type: Number },
        blueScore: { type: Number },
        blueTeams: [{
          name: {type: String},
          number: {type: Number},
        }],
        redTeams: [{
          name: {type: String},
          number: {type: Number},
        }],
      }],
      playoffs: [{
        match: { type: Number },
        points: { type: Number },
        alliance: { type: String },
        redScore: { type: Number },
        blueScore: { type: Number },
        blueTeams: [{
          name: {type: String},
          number: {type: Number},
        }],
        redTeams: [{
          name: {type: String},
          number: {type: Number},
        }],
      }],
    }],
    year: { type: String, required: true },
    win: { type: Number, default: 0 },
    loss: { type: Number, default: 0 },
    ties: { type: Number, default: 0 },
    avgPoints: { type: String, default: '0' },
    luckScore: { type: String, default: '-999' },
    specimens: [Number],
    samples: [Number],
    points: [{
      matchNumber: {type: Number},
      points: {type: Number},
    }],
    rookieYear: { type: Number, default: 0 },
    sponsors: [String],
    quickStats: {
      auto: {
        value: { type: Number, default: 0 },
        rank: { type: Number, default: 0 },
      },
      dc: {
        value: { type: Number, default: 0 },
        rank: { type: Number, default: 0 },
      },
      eg: {
        value: { type: Number, default: 0 },
        rank: { type: Number, default: 0 },
      },
      tot: {
        value: { type: Number, default: 0 },
        rank: { type: Number, default: 0 },
      },
    },
    rolePrediction: {
      percentSamples: { type: Number, default: 0 },
      percentSpecimens: { type: Number, default: 0 }
    }
  }]
});

const teamsListSchema = new mongoose.Schema({
  teams: [{
    name: { type: String, required: true },
    number: { type: Number, required: true }
  }]
});

const Team = mongoose.model('Team', teamSchema);
const TeamsList = mongoose.model('TeamsList', teamsListSchema)

// Routes
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({ message: 'Database connection failed' });
  }
});



//get team list
app.get('/api/teamsLists', async (req, res) => {
  try {
    const teamList = await TeamsList.find();
    res.json(teamList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all teams
app.get('/api/teams', async (req, res) => {
  try {
    const teams = await Team.find();
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get team by number
app.get('/api/teams/:number', async (req, res) => {
  try {
    const team = await Team.findOne({ number: req.params.number });
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create or update team
app.post('/api/teams', async (req, res) => {
  try {
    const { number, name, seasons, version} = req.body;
    
    // Check if team exists
    let team = await Team.findOne({ number });
    
    if (team) {
      // Update existing team
      team.name = name;
      team.seasons = seasons;
      team.version = version;
      await team.save();
    } else {
      // Create new team
      team = new Team({ number, name, seasons, version });
      await team.save();
    }
    
    res.status(201).json(team);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Save/create team list
app.post('/api/teamsList', async (req, res) => {
  try {
    const { teams } = req.body;

    const list = new TeamsList({
      teams: teams
    });

    await list.save();

    res.status(201).json(list);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update team data
app.put('/api/teams/:number', async (req, res) => {
  try {
    const { name, seasons, version } = req.body;
    const team = await Team.findOneAndUpdate(
      { number: req.params.number },
      { name, seasons, version },
      { new: true, runValidators: true }
    );
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    res.json(team);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete team
app.delete('/api/teams/:number', async (req, res) => {
  try {
    const team = await Team.findOneAndDelete({ number: req.params.number });
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
/*
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
*/

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});
