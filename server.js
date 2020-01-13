const express = require('express')
require('dotenv').config()
const cors = require('cors')
const db = require('./dbApi');

const port = process.env.PORT || 3001;
const app = express();
// Test SSH
// Test new SSH
const whitelist = [
  'http://localhost:3000', 
  'http://nba-app-client.s3-website.eu-north-1.amazonaws.com'
]

app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true); // eg curl requests

    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}))

app.get('/teams', (req, res) => {
  db.getTeams()
  .then(teams => { res.json(teams); })
  .catch(err => { res.status(500).send(`An error occured: ${err}`); })
})

db.connect()
.then(() => { return db.ensureDataExists(); })
.then(() => { return db.startCronJob(); })
.then(() => {
  app.listen(port, () => console.log(`Listening on port ${port}`))
})
.catch((err) => console.log(`Could not start the server: ${err}`))
