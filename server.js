const express = require('express')
const app = express()
require('dotenv').config()
const db = require('./mongoose');
const CronJob = require('cron').CronJob;

const port = process.env.PORT || 3001;

app.get('/standings', (req, res) => {
  db.getStandings()
  .then(standings => { res.json(standings)})
  .catch(err => { res.status(500).send(`An error occured: ${err}`); })
})

db.connect()
.then(() => {
  app.listen(port, () => {
    console.log(`Listening on port ${port}`)

    new CronJob({
      cronTime:'0 */30 * * * *',
      onTick: () => {
        db.updateStandings()
        .catch(err => {console.log(`Failed to update standings: ${err}`); })
      },
      start: true,
      runOnInit: true, 
    })
  })
})
.catch((err) => { console.log(`Could not connect to database: ${err}`); })


