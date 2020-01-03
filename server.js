const express = require('express')
require('dotenv').config()
const cors = require('cors')
const db = require('./dbApi');

const port = process.env.PORT || 3001;
const app = express();
app.use(cors());

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
