const unirest = require("unirest");

const standings = () => {
  const url = "https://api-nba-v1.p.rapidapi.com/standings/standard/2019"

  return new Promise((resolve, reject) => {
    httpRequest(url)
    .then(res => resolve(res))
    .catch(err => reject(err))
  })
}

const teamInfo = (teamId) => {
  const url = `https://api-nba-v1.p.rapidapi.com/teams/teamId/${teamId}`;

  return new Promise((resolve, reject) => {
    httpRequest(url)
    .then(res => resolve(res))
    .catch(err => reject(err))
  })
}

const httpRequest = (url) => {
  return new Promise((resolve, reject) => {
    unirest.get(url)
    .headers({
      "x-rapidapi-host": "api-nba-v1.p.rapidapi.com",
      "x-rapidapi-key": process.env.API_KEY
    })
    .end((response) => {
      if (response.error) {
        reject(response.error)
      } else {
        resolve(response.body)
      }
    })
  })
}

module.exports = {
  standings,
  teamInfo
}