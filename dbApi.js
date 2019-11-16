var mongoose = require('mongoose');
const nbaApi = require('./nbaApi')

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
    city: String,
    fullName: String,
    nickname: String,
    logo: String,
    win: String,
    loss: String,
    conference: String,
    rank: String
  })

  Team = mongoose.model('Team', teamSchema)
}

const getTeams = async () => {
  return await Team.find()
}

const updateStandings = async () => {
  const data = await nbaApi.standings()
  const standings = mapDataToDatabaseStandings(data.api.standings)
  const result = await bulkUpdate(standings)

  return result
}

const updateTeamInfo = async () => {
  const teams = await getTeams();

  const promises = teams.map(async team => {
    const res = await nbaApi.teamInfo(team.teamId);
    return res.api.teams[0]
  })

  const apiData = await Promise.all(promises);
  
  const teamInfo = mapDataToDatabaseTeamInfo(apiData)
  const result = await bulkUpdate(teamInfo)

  return result
}

const ensureDataExists = async () => {
  const teams = await getTeams();

  if (teams.length === 0) {
    console.log('Database is empty. Gathering data..')
    await updateStandings();
    await updateTeamInfo();
  }
}

const bulkUpdate = (updates) => {
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

const mapDataToDatabaseStandings = (apiData) => {
  return apiData.map(team => {
    return {
      teamId: team.teamId,
      win: team.win,
      loss: team.loss,
      conference: team.conference.name,
      rank: team.conference.rank,
    }
  })
}

const mapDataToDatabaseTeamInfo = (apiData) => {
  return apiData.map(team => {
    return {
      teamId: team.teamId,
      city: team.city,
      fullName: team.fullName,
      nickname: team.nickname,
      logo: team.logo,
    }
  })
}

module.exports = {
  connect,
  getTeams,
  updateStandings,
  ensureDataExists,
}