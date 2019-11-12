var mongoose = require('mongoose');
const nbaApi = require('./nbaApi')

let Team;

const connect = () => {
  console.log("Connecting to database")
  return new Promise((resolve, reject) => {
    mongoose.connect(process.env.DATABASE_PATH, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(() => {
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
      console.log("Connected to database")
      resolve()
    })
    .catch(err => reject(err))
  })
}

const getTeams = () => {
  return new Promise((resolve, reject) => {
    Team.find((err, teams) => {
      if (err) {
        reject(err);
      } else {
        resolve(teams);
      }
    })
  })
}

const updateStandings = () => {
  return new Promise((resolve, reject) => {
    nbaApi.standings()
    .then(data => { 
      return bulkWriteStandings(data.api.standings)
    })
    .then(result => {
      console.log(`Updated standings:`)
      console.log(result)
      resolve(result)
    })
    .catch(err => {
      console.log(`Failed to update standings: ${err}`)
      reject(err)
    })
  })
}

const bulkWriteStandings = (apiStandings) => {
  const standings = filterStandings(apiStandings)

  return Team.bulkWrite(standings.map((standing) => {
    const { teamId, ...update } = standing;

    return {
      updateOne: {
        filter: { teamId: teamId },
        update: {
          $setOnInsert: { teamId: teamId },
          $set: update
        },
        upsert: true,
      },
    }
  }))
}

const filterStandings = (apiData) => {
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