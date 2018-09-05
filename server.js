'use strict';

const express = require('express');
const data = require('./db/notes');
const simDB = require('./db/simDB');
const notes = simDB.initialize(data);
const { logger } = require('./middleware/logger');
const { PORT } = require('./config');

const app = express();

// run logger
app.use(logger);

// ADD STATIC SERVER HERE
app.use(express.static('public'));

// return notes app & check for search query
app.get('/api/notes', (req, res, next) => {
  let { searchTerm } = req.query;
  notes.filter(searchTerm, (err, list) => {
    if (err) {
      return next(err); // goes to error handler
    }
    res.json(list); // responds with filtered array
  });
});

// return specific note in notes app
app.get('/api/notes/:id', (req, res, next) => {
  let { id } = req.params;
  notes.find(id, (err, item) => {
    if (err) {
      return next(err);
    }
    res.json(item);
  });
});

//test
app.get('/boom', (req, res, next) => {
  throw new Error('Boom!!');
});

// Error handling
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  res.status(404).json({ message: 'Not Found' });
});

// check error
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err
  });
});

app
  .listen(PORT, function() {
    console.info(`Server listening on ${this.address().port}`);
  })
  .on('error', err => {
    console.error(err);
  });
