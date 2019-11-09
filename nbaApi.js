const unirest = require("unirest");

const standings = () => {
  return new Promise((resolve, reject) => {
    const url = "https://api-nba-v1.p.rapidapi.com/standings/standard/2019"

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
  standings
}