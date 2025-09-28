const mongoose = require('mongoose');

// Team Schema
const teamSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  version: { type: Number, required: true },
  seasons: [{
    events: [{
      name: {type: String, required: true },
      dateStart: { type: String, required: true },
      dateEnd: { type: String, required: true },
      rank: { type: Number, required: true },
      teams: { type: Number, required: true},
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
    aiInsight: { type: String, default: 'No insights available.' },
    specimens: [Number],
    samples: [Number],
    points: [{
      matchNumber: {type: Number},
      points: {type: Number},
    }],
    rookieYear: { type: String, default: '0' },
    location: { type: String, default: '0' },
    sponsors: [String],
    quickStats: {
      season: { type: Number, default: 0},
      number: { type: Number, default: 0},
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
      count: { type: Number, default: 0 },
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

const eventRankSchema = new mongoose.Schema({
  eventCode: { type: String, required: true, unique: true },
  version: { type: Number, required: true },
  rankings: [{
    teamNumber: { type: Number, required: true },
    rank: { type: Number, required: true },
    wins: { type: Number, required: true },
    losses: { type: Number, required: true },
    ties: { type: Number, required: true },
    rp: { type: Number, required: true }, // sortOrder1
    tbp: { type: Number, required: true }, // sortOrder2
    ascent: { type: Number, required: true }, // sortOrder3
    highScore: { type: Number, required: true }, // sortOrder4
    matchesPlayed: { type: Number, required: true }
  }]
});

// Create models
const Team = mongoose.model('Team', teamSchema);
const TeamsList = mongoose.model('TeamsList', teamsListSchema);
const EventRank = mongoose.model('EventRank', eventRankSchema);

module.exports = {
  Team,
  TeamsList,
  teamSchema,
  teamsListSchema,
  EventRank,
  eventRankSchema
};