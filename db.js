const nbaApi = require('./nbaApi');
const CronJob = require('cron').CronJob;
const utils = require('./utils');
const mongoose = require('mongoose');
const models = require('./models')(mongoose);

const TEAM_KEY = 'teamId'
const GAME_KEY = 'gameId'

let Team;
let Game;

const connect = async () => {
  // async functions returns a promise, automatically resolves, rejects
  // await waits for a promise
  await mongoose.connect(process.env.DATABASE_PATH, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  Team = models.Team;
  Game = models.Game;
}

const getTeams = () => {
  return Team.find();
}

const getGames = () => {
  return Game.find();
}

const ensureTeamsExist = async () => {
  const allTeams = await getTeams();

  if (allTeams.length === 0) {
    console.log('Database is empty. Gathering team info..')
    await updateTeamInfo();
    await updateStandings();
    await updateGameResults();
  }
}

const updateStandings = async () => {
  const data = await nbaApi.standings()
  const standings = utils.mapStandingsToSchema(data)
  const result = await bulkUpdate(Team, TEAM_KEY, standings)
  return result
}

const updateTeamInfo = async () => {
  const data = await nbaApi.teams();
  const teams = utils.mapTeamsToSchema(data)
  const result = await bulkUpdate(Team, TEAM_KEY, teams)
  return result
}

const updateGameResults = async () => {
  const data = await nbaApi.games();
  const games = utils.mapGamesToSchema(data);
  const result = await bulkUpdate(Game, GAME_KEY, games);
  return result;
}

const bulkUpdate = (model, key, updates) => {
  return model.bulkWrite(updates.map(update => {
    return {
      updateOne: {
        filter: { key: update[key] },
        update: { $set: update },
        upsert: true,
      },
    }
  }))
}

const startRegularUpdates = () => {
  return new Promise((resolve, reject) => {
    new CronJob({
      cronTime:'0 */30 * * * *',
      onTick: () => {
        updateStandings()
        .then(() => updateGameResults())
        .then(() => {
          console.log("Updated standings")
          resolve()
        }).catch(err => {
          console.log(`Failed to update standings: ${err}`)
          reject(err)
        })
      },
      start: true,
      runOnInit: true, 
    })
  })
}

module.exports = {
  connect,
  getTeams,
  getGames,
  ensureTeamsExist,
  startRegularUpdates
}