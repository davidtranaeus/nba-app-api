const express = require('express')
require('dotenv').config()
const cors = require('cors')
const db = require('./mongoose');
const CronJob = require('cron').CronJob;

const port = process.env.PORT || 3001;
const app = express();
app.use(cors());

app.get('/teams', (req, res) => {
  db.getTeams()
  .then(teams => { res.json(teams); })
  .catch(err => { res.status(500).send(`An error occured: ${err}`); })
})

// TODO: Update team info if it is the first time the database is connected to
db.connect()
.then(() => {
  app.listen(port, () => {
    console.log(`Listening on port ${port}`);

    new CronJob({
      cronTime:'0 */30 * * * *',
      onTick: () => {
        db.updateStandings()
        .then(res => {
          console.log(`\nUpdated standings`)
          console.log(res)
        })
        .catch(err => console.log(`Failed to update standings: ${err}`))
      },
      start: true,
      runOnInit: true, 
    })
  })
})
.catch((err) => { console.log(`Could not connect to database: ${err}`); })


