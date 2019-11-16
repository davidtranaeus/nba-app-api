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
    nickName: String,
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
  return apiData.map((team) => {
    return {
      teamId: team.teamId,
      win: team.win,
      loss: team.loss,
      conference: team.conference.name,
      rank: team.conference.rank
    }
  })
}

module.exports = {
  connect,
  getTeams,
  updateStandings
}