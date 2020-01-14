const unirest = require("unirest");

const teams = async () => {
  const url = "http://data.nba.net/data/10s/prod/v1/2019/teams.json" // Hårdkodat år
  const response = await httpRequest(url)
  const allTeams = response["league"]["standard"];
  const nbaTeams = allTeams.filter(team => team.isNBAFranchise === true);
  return nbaTeams;
}

const standings = async () => {
  const url = "http://data.nba.net/data/10s/prod/v1/current/standings_all_no_sort_keys.json"
  const response = await httpRequest(url)
  return response["league"]["standard"]["teams"]
}

const httpRequest = url => {
  return new Promise((resolve, reject) => {
    unirest.get(url)
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
  teams
}