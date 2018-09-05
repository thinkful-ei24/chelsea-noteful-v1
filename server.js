'use strict';

const express = require('express');
const data = require('./db/notes');
const { logger } = require('./middleware/logger');
const { PORT } = require('./config');

const app = express();

// run logger
app.use(logger);

// ADD STATIC SERVER HERE
app.use(express.static('public'));

// return notes app & check for search query
app.get('/api/notes', (req, res) => {
  let { searchTerm } = req.query;
  if (searchTerm) {
    return res.json(data.filter(item => item.title.includes(searchTerm)));
  }
  res.json(data);
});

// return specific note in notes app
app.get('/api/notes/:id', (req, res) => {
  //written out way
  // let id = req.params.id;
  // short hand
  let { id } = req.params;
  res.json(data.find(item => item.id === Number(id)));
});

//test
app.get('/boom', (req, res, next) => {
  throw new Error('Boom!!');
});

// check error
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err
  });
});

// Error handling
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  res.status(404).json({ message: 'Not Found' });
});

app
  .listen(PORT, function() {
    console.info(`Server listening on ${this.address().port}`);
  })
  .on('error', err => {
    console.error(err);
  });
