var mongoose = require('mongoose');
const nbaApi = require('./nbaApi')
const CronJob = require('cron').CronJob;
const teamLogos = require('./assets/team-logos.json')

let Team;

const connect = async () => {
  // async functions returns a promise, automatically resolves, rejects
  // await waits for a promise
  await mongoose.connect(process.env.DATABASE_PATH, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })

  const teamSchema = new mongoose.Schema({
    teamId: String,
    fullName: String,
    nickname: String,
    tricode: String,
    logo: String,
    win: String,
    loss: String,
    confName: String,
    confRank: String,
    winPct: String,
    streak: String,
    isWinStreak: Boolean,
    lastTenWin: String,
    lastTenLoss: String,
    gamesBehind: String,
  })

  Team = mongoose.model('Team', teamSchema)
}

const teams = () => {
  return Team.find()
}

const updateStandings = async () => {
  const data = await nbaApi.standings()
  const standings = mapDataToDatabaseStandings(data)
  const result = await bulkUpdate(standings)
  return result
}

const updateTeamInfo = async () => {
  const data = await nbaApi.teams();
  const teamInfo = mapDataToDatabaseTeamInfo(data)
  const result = await bulkUpdate(teamInfo)
  return result
}

const ensureTeamsExist = async () => {
  const allTeams = await teams();

  if (allTeams.length === 0) {
    console.log('Database is empty. Gathering team info and current standings..')
    await updateTeamInfo();
    await updateStandings();
  }
}

const bulkUpdate = updates => {
  return Team.bulkWrite(updates.map((update) => {
    const { teamId, ...newData } = update;
    return {
      updateOne: {
        filter: { teamId: teamId },
        update: {
          $setOnInsert: { teamId: teamId },
          $set: newData
        },
        upsert: true,
      },
    }
  }))
}

const mapDataToDatabaseStandings = apiData => {
  return apiData.map(team => {
    return {
      teamId: team.teamId,
      win: team.win,
      loss: team.loss,
      confRank: team.confRank,
      winPct: team.winPct,
      streak: team.streak,
      isWinStreak: team.isWinStreak,
      lastTenWin: team.lastTenWin,
      lastTenLoss: team.lastTenLoss,
      gamesBehind: team.gamesBehind,
    }
  })
}

const mapDataToDatabaseTeamInfo = apiData => {
  return apiData.map(team => {
    return {
      teamId: team.teamId,
      fullName: team.fullName,
      nickname: team.nickname,
      tricode: team.tricode,
      confName: team.confName,
      logo: teamLogos[team.tricode],
    }
  })
}

const startRegularUpdates = () => {
  return new Promise((resolve, reject) => {
    new CronJob({
      cronTime:'0 */30 * * * *',
      onTick: () => {
        updateStandings()
        .then(() => {
          console.log("Updated standings")
          resolve()
        })
        .catch(err => {
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
  teams,
  ensureTeamsExist,
  startRegularUpdates
}