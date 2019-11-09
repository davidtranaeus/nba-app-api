var mongoose = require('mongoose');
const nbaApi = require('./nbaApi')

let Standing;

const connect = () => {
  console.log("Connecting to database")
  return new Promise((resolve, reject) => {
    mongoose.connect(process.env.DATABASE_PATH, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(() => {
      const standingSchema = new mongoose.Schema({
        teamId: String,
        win: String,
        loss: String,
        conference: String,
        rank: String
      })
      Standing = mongoose.model('Standing', standingSchema)
      console.log("Connected to databse")
      resolve()
    })
    .catch(err => reject(err))
  })
}

const getStandings = () => {
  return new Promise((resolve, reject) => {
    Standing.find((err, standings) => {
      if (err) {
        reject(err);
      } else {
        resolve(standings);
      }
    })
  })
}

const updateStandings = () => {
  return new Promise((resolve, reject) => {
    nbaApi.standings()
    .then(data => { 
      const standings = prepareStandings(data.api.standings)
      return bulkWrite(standings)
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

const prepareStandings = (apiData) => {
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

const bulkWrite = (standings) => {
  return Standing.bulkWrite(standings.map((standing) => {
    const { teamId, ...update} = standing;

    return {
      updateOne: {
        filter: { teamId: teamId },
        update: {
          $setOnInsert: { teamId: teamId},
          $set: update
        },
        upsert: true,
      },
    }
  }))
}

module.exports = {
  connect,
  getStandings,
  updateStandings
}