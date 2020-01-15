module.exports = mongoose => {
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

  const gameSchema = new mongoose.Schema({
    gameId: String,
    statusNum: Number,
    startDateEastern: String,
    startTimeUTC: Date,
    hTeam: {
      teamId: String,
      score: String
    },
    vTeam: {
      teamId: String,
      score: String
    }
  })

  const models = {
    Team: mongoose.model('Team', teamSchema),
    Game: mongoose.model('Game', gameSchema)
  }
  
  return models;
}