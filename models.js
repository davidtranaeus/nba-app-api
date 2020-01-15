module.exports = (mongoose) => {
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

  const models = {
    Teams: mongoose.model('Team', teamSchema)
  }
  
  return models;
}