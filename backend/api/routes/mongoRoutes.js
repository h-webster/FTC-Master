const express = require('express');
const mongoose = require('mongoose');
const { Team, TeamsList, EventRank } = require('../schema');

const router = express.Router();

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

// Routes
router.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({ message: 'Database connection failed' });
  }
});



//get team list
router.get('/teamsLists', async (req, res) => {
  try {
    const teamList = await TeamsList.find();
    res.json(teamList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Get all teams (mongodb)
router.get('/teams', async (req, res) => {
  try {
    const teams = await Team.find();
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get team by number
router.get('/teams/:number', async (req, res) => {
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

// Get event rankings by event code
router.get('/eventRanks/:eventCode', async (req, res) => {
  try {
    const event = await EventRank.findOne({ eventCode: req.params.eventCode });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create or update team
router.post('/teams', async (req, res) => {
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

// Create or update event rankings
router.post('/eventRanks', async (req, res) => {
  try {
    const { eventCode, version, rankings } = req.body;
    
    // Check if event exists
    let event = await EventRank.findOne({ eventCode });
    
    if (event) {
      // Update existing event rankings
      event.version = version;
      event.rankings = rankings;
      await event.save();
    }
    else {
      // Create new event rankings
      event = new EventRank({ eventCode, version, rankings });
      await event.save();
    }
    
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Save/create team list
router.post('/teamsLists', async (req, res) => {
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
router.put('/teams/:number', async (req, res) => {
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

// Update event ranking data
router.put('/eventRanks/:eventCode', async (req, res) => {
  try {
    const { version, rankings } = req.body;
    const event = await EventRank.findOneAndUpdate(
      { eventCode: req.params.eventCode },
      { version, rankings },
      { new: true, runValidators: true }
    );
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete team
router.delete('/teams/:number', async (req, res) => {
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

router.delete('/eventRanks/:eventCode', async (req, res) => {
  try {
    const eventCode = req.params.eventCode;
    if (!eventCode) return res.status(400).json({ error: "eventCode is required" });

    const event = await EventRank.findOneAndDelete({ eventCode: eventCode });

    if (!event) {
      return res.status(404).json({ message: 'Event rankings not found' });
    }
    res.json({ message: 'Rankings deleted successfully', event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;