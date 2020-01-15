const teamLogos = require('./assets/team-logos.json')

const mapStandingsToSchema = apiData => {
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

const mapTeamsToSchema = apiData => {
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

const mapGamesToSchema = apiData => {
  return apiData.map(game => {
    return {
      gameId: game.gameId,
      statusNum: game.statusNum,
      startDateEastern: game.startDateEastern,
      startTimeUTC: game.startTimeUTC,
      hTeam: {
        teamId: game.hTeam.teamId,
        score: game.hTeam.score
      },
      vTeam: {
        teamId: game.vTeam.teamId,
        score: game.vTeam.score
      }
    }
  })
}

module.exports = {
  mapStandingsToSchema,
  mapTeamsToSchema,
  mapGamesToSchema,
}