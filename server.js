'use strict';

//express
const express = require('express');

//data
const data = require('./db/notes');
const simDB = require('./db/simDB');
const notes = simDB.initialize(data);

//3rd party middleware
const morgan = require('morgan');

//my modules
const { PORT } = require('./config');

const app = express();

// run morgan logger
app.use(morgan('dev'));

// ADD STATIC SERVER HERE
app.use(express.static('public'));

// Parse request body - we need to utilize the built in middleware to parse incoming requests that contain JSON and make them available on the req.body
app.use(express.json());

// GET return notes app & check for search query
app.get('/api/notes', (req, res, next) => {
  let { searchTerm } = req.query;
  notes.filter(searchTerm, (err, list) => {
    if (err) {
      return next(err); // goes to error handler
    }
    res.json(list); // responds with filtered array
  });
});

// GET return specific note in notes app
app.get('/api/notes/:id', (req, res, next) => {
  let { id } = req.params;
  notes.find(id, (err, item) => {
    if (err) {
      return next(err);
    }
    res.json(item);
  });
});

// PUT (update) notes by ID
app.put('/api/notes/:id', (req, res, next) => {
  const id = req.params.id;

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
