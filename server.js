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

// Parse request body - we need to utilize the built in middleware to parse incoming requests that contain JSON and make them available on the req.body
app.use(express.json());

// GET return notes app & check for search query
app.get('/api/notes', (req, res, next) => {
  const { searchTerm } = req.query;
  notes.filter(searchTerm, (err, list) => {
    if (err) {
      return next(err); // goes to error handler
    }
    res.json(list); // responds with filtered array
  });
});

// GET return specific note in notes app
app.get('/api/notes/:id', (req, res, next) => {
  const { id } = req.params;
  notes.find(id, (err, item) => {
    if (err) {
      return next(err);
    }
    if (item) {
      res.json(item);
    } else {
      next();
    }
  });
});

// PUT (update) notes by ID
app.put('/api/notes/:id', (req, res, next) => {
  const { id } = req.params;

  /***** Never trust users - validate input *****/
  const updateObj = {};
  const updateFields = ['title', 'content'];

  updateFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  notes.update(id, updateObj, (err, item) => {
    if (err) {
      return next(err);
    }
    if (item) {
      res.json(item);
    } else {
      next();
    }
  });
});

//test - brute-force test
app.get('/boom', (req, res, next) => {
  throw new Error('Boom!!');
});

// Catch all 404
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Catch all error handler
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
