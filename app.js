const express = require('express');
const app = express();
const PORT = process.env.PORT || 4001;
const bodyParser = require('body-parser');
const morgan = require('morgan');

app.use(express.static('public'));

app.use(bodyParser.json()); //req.body
app.use(morgan('dev'));

//import sql.js
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './db.sqlite');

// get method to access all the rows from database

app.get('/strips', (req, res, next) => {
  db.all("SELECT * FROM Strip", (error, rows) => {
    if(error){
      res.sendStatus(500);
    } else {
      res.send({ strips: rows });
    }
  });
});

const validateStrip = (req, res, next) => {
  const insert = req.body.strip;
  if (!insert.head || !insert.body || !insert.background || !insert.bubbleType) {
    return res.sendStatus(400); //bad request
  }
  next();
}

//post method
app.post('/strips', validateStrip, (req, res, next) => {
  const addStrip = req.body.strip;
  db.run("INSERT INTO Strip (head, body, background, bubble_type, bubble_text, caption) VALUES ($head, $body, $back, $bType, $bText, $caption)",
  {
    $head: addStrip.head,
    $body: addStrip.body,
    $back: addStrip.background,
    $bType: addStrip.bubbleType,
    $bText: addStrip.bubbleText,
    $caption: addStrip.caption
  },
  function(error){
    if(error){
      return res.sendStatus(500); // interanl server error
    }
    db.get(`SELECT * FROM Strip WHERE id = ${this.lastID}`, (error, row) => {
      if(!row){
        return res.sendStatus(500);
      } 
      res.status(201).send({ strip: row });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is Listening on Port ${PORT}`)
});

module.exports = app;